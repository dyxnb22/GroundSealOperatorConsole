import { describe, it, expect, beforeEach } from "vitest";
import { ErrorCodeSchema, GsocError } from "../../src/contracts/errors.js";
import { ERROR_TAXONOMY } from "../../src/policy/error-taxonomy.js";
import { buildRedactedView } from "../../src/policy/redaction.js";
import {
  MemoryStore,
  parseApprovalQueueQuery,
  parseApprovalDecisionRequest,
  parseResubmitRequest,
} from "../../src/adapters/memory-store.js";
import { resetDefaultStore, getApprovalDetail, submitApprovalDecision, resubmitApproval } from "../../src/core/approval-service.js";
import { ApprovalDecisionRequestSchema } from "../../src/contracts/approval.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const fixturesDir = join(process.cwd(), "fixtures/scenarios");

function expectCode(fn: () => void, code: string): void {
  try {
    fn();
    throw new Error("Expected error");
  } catch (e) {
    expect(e).toBeInstanceOf(GsocError);
    expect((e as GsocError).code).toBe(code);
  }
}

describe("ErrorCode negative-path coverage", () => {
  beforeEach(() => resetDefaultStore());

  const allCodes = ErrorCodeSchema.options;

  it("taxonomy covers every ErrorCode", () => {
    for (const code of allCodes) {
      expect(ERROR_TAXONOMY[code]).toBeDefined();
      expect(ERROR_TAXONOMY[code].failMode).toBe("closed");
    }
  });

  it("INVALID_QUERY: malformed queue query", () => {
    expectCode(
      () =>
        parseApprovalQueueQuery({
          tenantContext: { tenantId: "tenant-a", role: "reviewer" },
          status: "bogus",
        }),
      "INVALID_QUERY",
    );
  });

  it("INVALID_TENANT_CONTEXT: empty tenantId", () => {
    expectCode(
      () =>
        parseApprovalQueueQuery({
          tenantContext: { tenantId: "", role: "reviewer" },
        }),
      "INVALID_TENANT_CONTEXT",
    );
  });

  it("NOT_FOUND: missing approval", () => {
    expectCode(() => getApprovalDetail("tenant-a", "missing"), "NOT_FOUND");
  });

  it("RUN_NOT_FOUND: approval with broken run reference", () => {
    const store = new MemoryStore();
    const snap = store.snapshot();
    snap.approvals[0]!.runId = "run-missing";
    store.restore(snap);
    expectCode(() => store.getApprovalDetail("tenant-a", "apr-001"), "RUN_NOT_FOUND");
  });

  it("INVALID_STATE_TRANSITION: double decision", () => {
    const approve = ApprovalDecisionRequestSchema.parse(
      JSON.parse(readFileSync(join(fixturesDir, "approval-decision-approve.json"), "utf-8")),
    );
    submitApprovalDecision(approve);
    expectCode(() => submitApprovalDecision(approve), "INVALID_STATE_TRANSITION");
  });

  it("INVALID_DECISION: reject without reason via parser", () => {
    expectCode(
      () =>
        parseApprovalDecisionRequest({
          tenantContext: { tenantId: "tenant-a", role: "reviewer" },
          approvalId: "apr-001",
          decision: "reject",
        }),
      "INVALID_DECISION",
    );
  });

  it("INSUFFICIENT_ROLE: viewer cannot decide", () => {
    expectCode(
      () =>
        submitApprovalDecision(
          ApprovalDecisionRequestSchema.parse({
            tenantContext: { tenantId: "tenant-a", operatorId: "v1", role: "viewer" },
            approvalId: "apr-001",
            decision: "approve",
          }),
        ),
      "INSUFFICIENT_ROLE",
    );
  });

  it("MALFORMED_TIMELINE: out-of-order events", () => {
    const store = new MemoryStore();
    expectCode(() => store.getRunTimeline("tenant-a", "run-bad-order"), "MALFORMED_TIMELINE");
  });

  it("INVALID_POLICY: empty rules", () => {
    expectCode(
      () =>
        buildRedactedView({
          payload: { a: 1 },
          policy: { policyId: "empty", rules: [] },
        }),
      "INVALID_POLICY",
    );
  });

  it("PAYLOAD_TOO_DEEP: nested payload", () => {
    let nested: Record<string, unknown> = { value: "x" };
    for (let i = 0; i < 12; i++) nested = { child: nested };
    expectCode(
      () =>
        buildRedactedView({
          payload: nested,
          policy: { policyId: "t", rules: [{ path: "value", action: "mask" }] },
        }),
      "PAYLOAD_TOO_DEEP",
    );
  });

  it("resubmit from pending fails INVALID_STATE_TRANSITION", () => {
    expectCode(
      () =>
        resubmitApproval(
          parseResubmitRequest({
            tenantContext: { tenantId: "tenant-a", role: "admin" },
            approvalId: "apr-001",
          }),
        ),
      "INVALID_STATE_TRANSITION",
    );
  });

  it("resubmit from changes_requested succeeds", () => {
    const result = resubmitApproval(
      parseResubmitRequest({
        tenantContext: { tenantId: "tenant-a", operatorId: "op-1", role: "admin" },
        approvalId: "apr-004",
      }),
    );
    expect(result.status).toBe("pending");
    expect(getApprovalDetail("tenant-a", "apr-004").status).toBe("pending");
  });
});
