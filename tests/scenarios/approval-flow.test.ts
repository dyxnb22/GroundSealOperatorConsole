import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getApprovalQueue,
  getApprovalDetail,
  submitApprovalDecision,
  getRunTimeline,
  resetDefaultStore,
} from "../../src/core/approval-service.js";
import { ApprovalDecisionRequestSchema } from "../../src/contracts/approval.js";
import { GsocError } from "../../src/contracts/errors.js";

const fixturesDir = join(process.cwd(), "fixtures/scenarios");

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, name), "utf-8"));
}

describe("Approval flow scenarios", () => {
  beforeEach(() => {
    resetDefaultStore();
  });

  it("list → detail → approve → verify state (happy path)", () => {
    const queueQuery = loadFixture("approval-queue-query.json");
    const queue = getApprovalQueue(queueQuery);

    expect(queue.items.some((i) => i.approvalId === "apr-001")).toBe(true);

    const detail = getApprovalDetail("tenant-a", "apr-001");
    expect(detail.status).toBe("pending");
    expect(detail.redactedPreview.length).toBeGreaterThan(0);

    const decisionRaw = loadFixture("approval-decision-approve.json");
    const decisionReq = ApprovalDecisionRequestSchema.parse(decisionRaw);
    const decision = submitApprovalDecision(decisionReq);

    expect(decision.status).toBe("approved");
    expect(decision.auditRef).toMatch(/^audit-apr-001-/);

    const updated = getApprovalDetail("tenant-a", "apr-001");
    expect(updated.status).toBe("approved");
  });

  it("reject with reason succeeds", () => {
    resetDefaultStore();
    const decisionRaw = loadFixture("approval-decision-reject.json");
    const decisionReq = ApprovalDecisionRequestSchema.parse(decisionRaw);
    const decision = submitApprovalDecision(decisionReq);

    expect(decision.status).toBe("rejected");
  });

  it("TenantIsolation: cross-tenant detail access denied", () => {
    expect(() => getApprovalDetail("tenant-a", "apr-003")).toThrow(GsocError);
    try {
      getApprovalDetail("tenant-a", "apr-003");
    } catch (e) {
      expect((e as GsocError).code).toBe("NOT_FOUND");
    }
  });

  it("TenantIsolation: cross-tenant decision denied", () => {
    const decisionReq = ApprovalDecisionRequestSchema.parse({
      tenantContext: { tenantId: "tenant-a", operatorId: "op-1", role: "reviewer" },
      approvalId: "apr-003",
      decision: "approve",
    });

    expect(() => submitApprovalDecision(decisionReq)).toThrow(GsocError);
  });

  it("ApprovalStateMachine: double decision rejected", () => {
    const approve = ApprovalDecisionRequestSchema.parse(
      loadFixture("approval-decision-approve.json"),
    );
    submitApprovalDecision(approve);

    expect(() => submitApprovalDecision(approve)).toThrow(GsocError);
    try {
      submitApprovalDecision(approve);
    } catch (e) {
      expect((e as GsocError).code).toBe("INVALID_STATE_TRANSITION");
    }
  });

  it("NegativePath: malformed timeline rejected", () => {
    expect(() => getRunTimeline("tenant-a", "run-bad-order")).toThrow(GsocError);
    try {
      getRunTimeline("tenant-a", "run-bad-order");
    } catch (e) {
      expect((e as GsocError).code).toBe("MALFORMED_TIMELINE");
    }
  });

  it("INSUFFICIENT_ROLE: viewer cannot decide", () => {
    const decisionReq = ApprovalDecisionRequestSchema.parse({
      tenantContext: { tenantId: "tenant-a", operatorId: "op-view", role: "viewer" },
      approvalId: "apr-001",
      decision: "approve",
    });

    expect(() => submitApprovalDecision(decisionReq)).toThrow(GsocError);
    try {
      submitApprovalDecision(decisionReq);
    } catch (e) {
      expect((e as GsocError).code).toBe("INSUFFICIENT_ROLE");
    }
  });

  it("returns ordered run timeline for valid run", () => {
    const timeline = getRunTimeline("tenant-a", "run-001");
    expect(timeline.events).toHaveLength(2);
    expect(timeline.events[0]!.eventId).toBe("evt-001");
  });
});
