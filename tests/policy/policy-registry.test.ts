import { describe, it, expect } from "vitest";
import { listRegisteredPolicies, resolvePolicyById } from "../../src/policy/policy-registry.js";

describe("Policy registry", () => {
  it("lists both experiment policies", () => {
    expect(listRegisteredPolicies()).toEqual(
      expect.arrayContaining(["default-pii", "strict-omit"]),
    );
  });

  it("resolves policy by id", () => {
    expect(resolvePolicyById("strict-omit").rules.every((r) => r.action === "omit")).toBe(true);
  });
});
