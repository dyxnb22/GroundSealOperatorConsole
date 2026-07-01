import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ApprovalQueueQuerySchema,
  ApprovalDetailSchema,
  ApprovalDecisionRequestSchema,
  RunTimelineSchema,
  RedactedPresentationRequestSchema,
} from "../../src/contracts/index.js";

const fixturesDir = join(process.cwd(), "fixtures/scenarios");

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, name), "utf-8"));
}

describe("ContractValidation fixtures", () => {
  it("parses approval-queue-query.json", () => {
    const data = loadFixture("approval-queue-query.json");
    const result = ApprovalQueueQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("parses approval-detail.json", () => {
    const data = loadFixture("approval-detail.json");
    const result = ApprovalDetailSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("parses approval-decision-approve.json", () => {
    const data = loadFixture("approval-decision-approve.json");
    const result = ApprovalDecisionRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("parses approval-decision-reject.json", () => {
    const data = loadFixture("approval-decision-reject.json");
    const result = ApprovalDecisionRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("parses run-timeline.json", () => {
    const data = loadFixture("run-timeline.json");
    const result = RunTimelineSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("parses redaction-pii.json request portion", () => {
    const data = loadFixture("redaction-pii.json") as {
      payload: Record<string, unknown>;
      policy: unknown;
    };
    const result = RedactedPresentationRequestSchema.safeParse({
      payload: data.payload,
      policy: data.policy,
    });
    expect(result.success).toBe(true);
  });

  it("rejects approve decision with extra fields (strict)", () => {
    const data = loadFixture("approval-decision-approve.json") as Record<string, unknown>;
    const result = ApprovalDecisionRequestSchema.safeParse({
      ...data,
      extraField: "not allowed",
    });
    expect(result.success).toBe(false);
  });

  it("rejects reject without reason", () => {
    const result = ApprovalDecisionRequestSchema.safeParse({
      tenantContext: { tenantId: "tenant-a", role: "reviewer" },
      approvalId: "apr-001",
      decision: "reject",
    });
    expect(result.success).toBe(false);
  });
});
