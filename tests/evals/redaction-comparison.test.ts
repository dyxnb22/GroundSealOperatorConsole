import { describe, it, expect } from "vitest";
import {
  compareRedactionPolicies,
  measurePolicy,
  loadRedactionCorpus,
} from "../../src/evals/redaction-comparison.js";
import { DEFAULT_PII_POLICY, STRICT_OMIT_POLICY } from "../../src/contracts/redaction.js";
import { resolvePolicyForRole } from "../../src/policy/policy-registry.js";
import { getApprovalDetail, resetDefaultStore } from "../../src/core/approval-service.js";

describe("Redaction policy comparison (Phase 8)", () => {
  it("both policies produce zero leaks on corpus", () => {
    const result = compareRedactionPolicies();
    for (const metrics of result.policies) {
      expect(metrics.leakCount).toBe(0);
    }
  });

  it("default-pii scores higher on operator utility than strict-omit", () => {
    const corpus = loadRedactionCorpus();
    const defaultMetrics = measurePolicy(DEFAULT_PII_POLICY, corpus);
    const strictMetrics = measurePolicy(STRICT_OMIT_POLICY, corpus);
    expect(defaultMetrics.operatorUtilityScore).toBeGreaterThan(
      strictMetrics.operatorUtilityScore,
    );
  });

  it("strict-omit exposes fewer visible fields than default-pii", () => {
    const corpus = loadRedactionCorpus();
    const defaultMetrics = measurePolicy(DEFAULT_PII_POLICY, corpus);
    const strictMetrics = measurePolicy(STRICT_OMIT_POLICY, corpus);
    expect(strictMetrics.visibleFieldCount).toBeLessThan(
      defaultMetrics.visibleFieldCount,
    );
  });

  it("recommends role-based policy when utility and disclosure winners differ", () => {
    const result = compareRedactionPolicies();
    expect(result.winner.recommendation).toContain("role-based");
  });

  it("resolvePolicyForRole maps viewer to strict-omit", () => {
    expect(resolvePolicyForRole("viewer").policyId).toBe("strict-omit");
    expect(resolvePolicyForRole("reviewer").policyId).toBe("default-pii");
  });

  it("getApprovalDetail applies role-based redaction", () => {
    resetDefaultStore();
    const reviewerView = getApprovalDetail("tenant-a", "apr-001", { role: "reviewer" });
    const viewerView = getApprovalDetail("tenant-a", "apr-001", { role: "viewer" });
    expect(reviewerView.redactedPreview.length).toBeGreaterThan(viewerView.redactedPreview.length);
  });
});
