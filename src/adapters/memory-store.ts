import type {
  ApprovalDetail,
  ApprovalQueueItem,
  ApprovalQueueQuery,
  ApprovalQueueResponse,
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
} from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";
import { assertTimelineOrdered } from "../contracts/run.js";
import type { EvidenceBundle } from "../contracts/evidence.js";
import type { ResubmitApprovalRequest, ResubmitApprovalResponse } from "../contracts/resubmit.js";
import { GsocError } from "../contracts/errors.js";
import { resolvePolicyForRole } from "../policy/policy-registry.js";
import { buildRedactedView } from "../policy/redaction.js";
import {
  transitionApprovalStatus,
  transitionResubmitStatus,
} from "../core/approval-state-machine.js";
import { assertCanDecide } from "../contracts/tenant.js";
import type { ApprovalStore, DetailOptions } from "./store-interface.js";
import type {
  AuditEntry,
  InternalApproval,
  InternalEvidenceBundle,
  InternalRun,
  StoreSnapshot,
} from "./store-types.js";
import { parseStoreSnapshot } from "./store-schema.js";
import { assertTenantMatch, parseCursorOffset, nextCursor } from "./tenant-access.js";

export function seedEvidenceBundles(): InternalEvidenceBundle[] {
  return [
    {
      bundleId: "evb-001",
      tenantId: "tenant-a",
      label: "Config change evidence",
      items: [
        {
          itemId: "evi-001",
          kind: "policy_check",
          label: "Policy evaluation",
          summary: "Policy check passed for config patch",
          contentRef: "payload-ref-policy-001",
          rawPayload: { applicant: { email: "alex@example.com" } },
        },
        {
          itemId: "evi-002",
          kind: "tool_output",
          label: "Config diff",
          summary: "Diff between v2.2 and v2.3",
          contentRef: "payload-ref-diff-001",
          rawPayload: { credentials: { token: "token-abc", apiKey: "key-xyz" } },
        },
      ],
    },
    {
      bundleId: "evb-003",
      tenantId: "tenant-b",
      label: "Tenant B job evidence",
      items: [
        {
          itemId: "evi-003",
          kind: "log_excerpt",
          label: "Job planner log",
          summary: "Planner selected workflow step 3",
          rawPayload: { applicant: { email: "bob@tenant-b.com" } },
        },
      ],
    },
  ];
}

export function seedData(): {
  approvals: InternalApproval[];
  runs: InternalRun[];
  auditLog: AuditEntry[];
  evidenceBundles: InternalEvidenceBundle[];
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
    evidenceBundles: seedEvidenceBundles(),
  };
}

export class MemoryStore implements ApprovalStore {
  private approvals!: Map<string, InternalApproval>;
  private runs!: Map<string, InternalRun>;
  private evidenceBundles!: Map<string, InternalEvidenceBundle>;
  private auditLog!: AuditEntry[];

  constructor(snapshot?: StoreSnapshot) {
    if (snapshot) {
      this.restore(snapshot);
    } else {
      const seed = seedData();
      this.approvals = new Map(seed.approvals.map((a) => [a.approvalId, { ...a }]));
      this.runs = new Map(seed.runs.map((r) => [r.runId, r]));
      this.evidenceBundles = new Map(
        seed.evidenceBundles.map((b) => [b.bundleId, structuredClone(b)]),
      );
      this.auditLog = [...seed.auditLog];
    }
  }

  getApprovalQueue(query: ApprovalQueueQuery): ApprovalQueueResponse {
    const { tenantContext, status, limit, cursor } = query;
    let items = [...this.approvals.values()].filter(
      (a) => a.tenantId === tenantContext.tenantId,
    );

    if (status !== "all") {
      items = items.filter((a) => a.status === status);
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const offset = parseCursorOffset(cursor);
    const page = items.slice(offset, offset + limit).map((a) => toQueueItem(a));

    return {
      items: page,
      nextCursor: nextCursor(offset, limit, items.length),
    };
  }

  getApprovalDetail(
    tenantId: string,
    approvalId: string,
    options?: DetailOptions,
  ): ApprovalDetail {
    const approval = this.approvals.get(approvalId);
    assertTenantMatch(approval?.tenantId, tenantId, `Approval ${approvalId}`);

    const run = this.runs.get(approval!.runId);
    if (!run) {
      throw new GsocError("RUN_NOT_FOUND", `Run ${approval!.runId} not found`);
    }
    assertTenantMatch(run.tenantId, tenantId, `Run ${approval!.runId}`);

    const role = options?.role ?? "reviewer";
    const policy = resolvePolicyForRole(role);

    const redacted = buildRedactedView({
      payload: approval!.rawPayload,
      policy,
    });

    return {
      approvalId: approval!.approvalId,
      tenantId: approval!.tenantId,
      status: approval!.status,
      subject: approval!.subject,
      runId: approval!.runId,
      evidenceBundleIds: approval!.evidenceBundleIds,
      requestedAction: approval!.requestedAction,
      createdAt: approval!.createdAt,
      updatedAt: approval!.updatedAt,
      redactedPreview: redacted.fields,
    };
  }

  getRunTimeline(tenantId: string, runId: string): RunTimeline {
    const run = this.runs.get(runId);
    assertTenantMatch(run?.tenantId, tenantId, `Run ${runId}`);

    assertTimelineOrdered(run!.timeline.events);
    return run!.timeline;
  }

  getEvidenceBundle(
    tenantId: string,
    bundleId: string,
    options?: DetailOptions,
  ): EvidenceBundle {
    const bundle = this.evidenceBundles.get(bundleId);
    assertTenantMatch(bundle?.tenantId, tenantId, `Evidence bundle ${bundleId}`);

    const role = options?.role ?? "reviewer";
    const policy = resolvePolicyForRole(role);

    const items = bundle!.items.map((item) => {
      const redacted = buildRedactedView({ payload: item.rawPayload, policy });
      return {
        itemId: item.itemId,
        kind: item.kind,
        label: item.label,
        summary: item.summary,
        contentRef: item.contentRef ?? null,
        redactedFields: redacted.fields,
      };
    });

    return {
      bundleId: bundle!.bundleId,
      tenantId: bundle!.tenantId,
      label: bundle!.label,
      items,
    };
  }

  submitApprovalDecision(
    request: ApprovalDecisionRequest,
  ): ApprovalDecisionResponse {
    const { tenantContext, approvalId, decision } = request;
    assertCanDecide(tenantContext.role);

    const approval = this.approvals.get(approvalId);
    assertTenantMatch(approval?.tenantId, tenantContext.tenantId, `Approval ${approvalId}`);

    const nextStatus = transitionApprovalStatus(approval!.status, decision);
    const decidedAt = new Date().toISOString();
    const decidedBy = tenantContext.operatorId ?? "unknown-operator";
    const auditRef = `audit-${approvalId}-${Date.now()}`;

    approval!.status = nextStatus;
    approval!.updatedAt = decidedAt;
    approval!.decidedAt = decidedAt;
    approval!.decidedBy = decidedBy;
    approval!.auditRef = auditRef;
    this.approvals.set(approvalId, approval!);

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
    assertTenantMatch(approval?.tenantId, tenantContext.tenantId, `Approval ${approvalId}`);

    const nextStatus = transitionResubmitStatus(approval!.status);
    const resubmittedAt = new Date().toISOString();
    const auditRef = `audit-resubmit-${approvalId}-${Date.now()}`;

    approval!.status = nextStatus;
    approval!.updatedAt = resubmittedAt;
    this.approvals.set(approvalId, approval!);

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
      approvals: [...this.approvals.values()].map(cloneApproval),
      runs: [...this.runs.values()],
      auditLog: [...this.auditLog],
      evidenceBundles: [...this.evidenceBundles.values()].map((b) => structuredClone(b)),
    };
  }

  restore(snapshot: StoreSnapshot): void {
    const parsed = parseStoreSnapshot(snapshot);
    if (!parsed.success) {
      throw new GsocError("STORE_LOAD_FAILED", parsed.error.message);
    }
    const data = parsed.data;
    this.approvals = new Map(data.approvals.map((a) => [a.approvalId, cloneApproval(a)]));
    this.runs = new Map(data.runs.map((r) => [r.runId, r]));
    this.auditLog = [...data.auditLog];
    const bundles = data.evidenceBundles ?? seedEvidenceBundles();
    this.evidenceBundles = new Map(bundles.map((b) => [b.bundleId, structuredClone(b)]));
  }
}

function cloneApproval(approval: InternalApproval): InternalApproval {
  return {
    ...approval,
    evidenceBundleIds: [...approval.evidenceBundleIds],
    rawPayload: structuredClone(approval.rawPayload),
  };
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
