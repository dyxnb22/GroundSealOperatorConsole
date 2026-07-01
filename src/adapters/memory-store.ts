import type {
  ApprovalDetail,
  ApprovalQueueItem,
  ApprovalQueueQuery,
  ApprovalQueueResponse,
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
} from "../contracts/approval.js";
import { ApprovalQueueQuerySchema, ApprovalDecisionRequestSchema } from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";
import { assertTimelineOrdered } from "../contracts/run.js";
import type { ResubmitApprovalRequest, ResubmitApprovalResponse } from "../contracts/resubmit.js";
import { ResubmitApprovalRequestSchema } from "../contracts/resubmit.js";
import { GsocError } from "../contracts/errors.js";
import { DEFAULT_PII_POLICY } from "../contracts/redaction.js";
import { buildRedactedView } from "../policy/redaction.js";
import {
  transitionApprovalStatus,
  transitionResubmitStatus,
} from "../core/approval-state-machine.js";
import { assertCanDecide } from "../contracts/tenant.js";
import type { ApprovalStore } from "./store-interface.js";
import type {
  AuditEntry,
  InternalApproval,
  InternalRun,
  StoreSnapshot,
} from "./store-types.js";

export function seedData(): {
  approvals: InternalApproval[];
  runs: InternalRun[];
  auditLog: AuditEntry[];
} {
  return {
    approvals: [
      {
        approvalId: "apr-001",
        tenantId: "tenant-a",
        status: "pending",
        subject: "Deploy production config",
        runId: "run-001",
        evidenceBundleIds: ["evb-001"],
        requestedAction: "Apply config patch v2.3",
        createdAt: "2026-06-01T10:00:00.000Z",
        updatedAt: "2026-06-01T10:00:00.000Z",
        rawPayload: {
          applicant: {
            name: "Alex Operator",
            email: "alex@example.com",
            phone: "555-0100",
            ssn: "123-45-6789",
          },
          credentials: {
            token: "secret-token-abc",
            apiKey: "key-xyz-789",
          },
        },
      },
      {
        approvalId: "apr-002",
        tenantId: "tenant-a",
        status: "approved",
        subject: "Rotate API keys",
        runId: "run-002",
        evidenceBundleIds: [],
        requestedAction: "Rotate keys for service-b",
        createdAt: "2026-05-28T08:00:00.000Z",
        updatedAt: "2026-05-28T09:00:00.000Z",
        rawPayload: {
          applicant: { name: "Sam Reviewer", email: "sam@example.com" },
        },
        auditRef: "audit-002",
        decidedBy: "op-sam",
        decidedAt: "2026-05-28T09:00:00.000Z",
      },
      {
        approvalId: "apr-003",
        tenantId: "tenant-b",
        status: "pending",
        subject: "Tenant B workflow",
        runId: "run-003",
        evidenceBundleIds: ["evb-003"],
        requestedAction: "Execute tenant-b job",
        createdAt: "2026-06-02T12:00:00.000Z",
        updatedAt: "2026-06-02T12:00:00.000Z",
        rawPayload: {
          applicant: { email: "bob@tenant-b.com" },
        },
      },
      {
        approvalId: "apr-004",
        tenantId: "tenant-a",
        status: "changes_requested",
        subject: "Update staging config",
        runId: "run-001",
        evidenceBundleIds: ["evb-001"],
        requestedAction: "Apply staging patch v1.1",
        createdAt: "2026-05-30T14:00:00.000Z",
        updatedAt: "2026-05-30T15:00:00.000Z",
        rawPayload: {
          applicant: { email: "alex@example.com" },
        },
        auditRef: "audit-004",
        decidedBy: "op-alex",
        decidedAt: "2026-05-30T15:00:00.000Z",
      },
    ],
    runs: [
      {
        runId: "run-001",
        tenantId: "tenant-a",
        timeline: {
          runId: "run-001",
          tenantId: "tenant-a",
          events: [
            {
              eventId: "evt-001",
              timestamp: "2026-06-01T09:55:00.000Z",
              kind: "policy_check",
              summary: "Policy check passed",
              payloadRef: "payload-ref-001",
            },
            {
              eventId: "evt-002",
              timestamp: "2026-06-01T09:58:00.000Z",
              kind: "tool_call",
              summary: "Config diff generated",
              payloadRef: "payload-ref-002",
            },
          ],
        },
      },
      {
        runId: "run-002",
        tenantId: "tenant-a",
        timeline: { runId: "run-002", tenantId: "tenant-a", events: [] },
      },
      {
        runId: "run-003",
        tenantId: "tenant-b",
        timeline: {
          runId: "run-003",
          tenantId: "tenant-b",
          events: [
            {
              eventId: "evt-003",
              timestamp: "2026-06-02T11:00:00.000Z",
              kind: "model_step",
              summary: "Plan generated",
            },
          ],
        },
      },
      {
        runId: "run-bad-order",
        tenantId: "tenant-a",
        timeline: {
          runId: "run-bad-order",
          tenantId: "tenant-a",
          events: [
            {
              eventId: "evt-bad-2",
              timestamp: "2026-06-01T10:00:00.000Z",
              kind: "tool_call",
              summary: "Later step",
            },
            {
              eventId: "evt-bad-1",
              timestamp: "2026-06-01T09:00:00.000Z",
              kind: "policy_check",
              summary: "Earlier step",
            },
          ],
        },
      },
    ],
    auditLog: [],
  };
}

export class MemoryStore implements ApprovalStore {
  private approvals!: Map<string, InternalApproval>;
  private runs!: Map<string, InternalRun>;
  private auditLog!: AuditEntry[];

  constructor(snapshot?: StoreSnapshot) {
    if (snapshot) {
      this.restore(snapshot);
    } else {
      const seed = seedData();
      this.approvals = new Map(seed.approvals.map((a) => [a.approvalId, { ...a }]));
      this.runs = new Map(seed.runs.map((r) => [r.runId, r]));
      this.auditLog = [...seed.auditLog];
    }
  }

  getApprovalQueue(query: ApprovalQueueQuery): ApprovalQueueResponse {
    const { tenantContext, status, limit } = query;
    let items = [...this.approvals.values()].filter(
      (a) => a.tenantId === tenantContext.tenantId,
    );

    if (status !== "all") {
      items = items.filter((a) => a.status === status);
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const page = items.slice(0, limit).map((a) => toQueueItem(a));

    return {
      items: page,
      nextCursor: items.length > limit ? String(limit) : null,
    };
  }

  getApprovalDetail(tenantId: string, approvalId: string): ApprovalDetail {
    const approval = this.approvals.get(approvalId);
    if (!approval || approval.tenantId !== tenantId) {
      throw new GsocError("NOT_FOUND", `Approval ${approvalId} not found`);
    }

    const run = this.runs.get(approval.runId);
    if (!run || run.tenantId !== tenantId) {
      throw new GsocError("RUN_NOT_FOUND", `Run ${approval.runId} not found`);
    }

    const redacted = buildRedactedView({
      payload: approval.rawPayload,
      policy: DEFAULT_PII_POLICY,
    });

    return {
      approvalId: approval.approvalId,
      tenantId: approval.tenantId,
      status: approval.status,
      subject: approval.subject,
      runId: approval.runId,
      evidenceBundleIds: approval.evidenceBundleIds,
      requestedAction: approval.requestedAction,
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      redactedPreview: redacted.fields,
    };
  }

  getRunTimeline(tenantId: string, runId: string): RunTimeline {
    const run = this.runs.get(runId);
    if (!run || run.tenantId !== tenantId) {
      throw new GsocError("NOT_FOUND", `Run ${runId} not found`);
    }

    assertTimelineOrdered(run.timeline.events);
    return run.timeline;
  }

  submitApprovalDecision(
    request: ApprovalDecisionRequest,
  ): ApprovalDecisionResponse {
    const { tenantContext, approvalId, decision } = request;
    assertCanDecide(tenantContext.role);

    const approval = this.approvals.get(approvalId);
    if (!approval || approval.tenantId !== tenantContext.tenantId) {
      throw new GsocError("NOT_FOUND", `Approval ${approvalId} not found`);
    }

    const nextStatus = transitionApprovalStatus(approval.status, decision);
    const decidedAt = new Date().toISOString();
    const decidedBy = tenantContext.operatorId ?? "unknown-operator";
    const auditRef = `audit-${approvalId}-${Date.now()}`;

    approval.status = nextStatus;
    approval.updatedAt = decidedAt;
    approval.decidedAt = decidedAt;
    approval.decidedBy = decidedBy;
    approval.auditRef = auditRef;
    this.approvals.set(approvalId, approval);

    this.auditLog.push({
      auditRef,
      approvalId,
      tenantId: tenantContext.tenantId,
      action: "decision",
      at: decidedAt,
      operatorId: tenantContext.operatorId,
      details: { decision },
    });

    return { approvalId, status: nextStatus, decidedAt, decidedBy, auditRef };
  }

  resubmitApproval(request: ResubmitApprovalRequest): ResubmitApprovalResponse {
    const { tenantContext, approvalId } = request;
    if (tenantContext.role === "viewer") {
      throw new GsocError("INSUFFICIENT_ROLE", "Viewer role cannot resubmit approvals");
    }

    const approval = this.approvals.get(approvalId);
    if (!approval || approval.tenantId !== tenantContext.tenantId) {
      throw new GsocError("NOT_FOUND", `Approval ${approvalId} not found`);
    }

    const nextStatus = transitionResubmitStatus(approval.status);
    const resubmittedAt = new Date().toISOString();
    const auditRef = `audit-resubmit-${approvalId}-${Date.now()}`;

    approval.status = nextStatus;
    approval.updatedAt = resubmittedAt;
    this.approvals.set(approvalId, approval);

    this.auditLog.push({
      auditRef,
      approvalId,
      tenantId: tenantContext.tenantId,
      action: "resubmit",
      at: resubmittedAt,
      operatorId: tenantContext.operatorId,
    });

    return { approvalId, status: "pending", resubmittedAt, auditRef };
  }

  snapshot(): StoreSnapshot {
    return {
      version: 1,
      approvals: [...this.approvals.values()],
      runs: [...this.runs.values()],
      auditLog: [...this.auditLog],
    };
  }

  restore(snapshot: StoreSnapshot): void {
    if (snapshot.version !== 1) {
      throw new GsocError("INVALID_QUERY", `Unsupported snapshot version: ${snapshot.version}`);
    }
    this.approvals = new Map(snapshot.approvals.map((a) => [a.approvalId, { ...a }]));
    this.runs = new Map(snapshot.runs.map((r) => [r.runId, r]));
    this.auditLog = [...snapshot.auditLog];
  }
}

function toQueueItem(approval: InternalApproval): ApprovalQueueItem {
  return {
    approvalId: approval.approvalId,
    status: approval.status,
    subject: approval.subject,
    runId: approval.runId,
    createdAt: approval.createdAt,
    summary: approval.requestedAction,
  };
}

export function parseApprovalQueueQuery(raw: unknown): ApprovalQueueQuery {
  const result = ApprovalQueueQuerySchema.safeParse(raw);
  if (!result.success) {
    const emptyTenant = result.error.issues.some(
      (i) =>
        i.path.join(".") === "tenantContext.tenantId" &&
        (i.code === "too_small" || i.code === "invalid_type"),
    );
    throw new GsocError(
      emptyTenant ? "INVALID_TENANT_CONTEXT" : "INVALID_QUERY",
      result.error.message,
    );
  }
  return result.data;
}

export function parseApprovalDecisionRequest(raw: unknown): ApprovalDecisionRequest {
  const result = ApprovalDecisionRequestSchema.safeParse(raw);
  if (!result.success) {
    const reasonIssue = result.error.issues.find((i) => i.path.join(".") === "reason");
    throw new GsocError(
      reasonIssue ? "INVALID_DECISION" : "INVALID_QUERY",
      result.error.message,
    );
  }
  return result.data;
}

export function parseResubmitRequest(raw: unknown): ResubmitApprovalRequest {
  const result = ResubmitApprovalRequestSchema.safeParse(raw);
  if (!result.success) {
    throw new GsocError("INVALID_QUERY", result.error.message);
  }
  return result.data;
}

/** @deprecated Use MemoryStore */
export { MemoryStore as FixtureStore };
