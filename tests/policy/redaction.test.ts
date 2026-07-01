import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildRedactedView, assertNoPlaintextLeak } from "../../src/policy/redaction.js";
import { GsocError } from "../../src/contracts/errors.js";
import type { RedactionPolicy } from "../../src/contracts/redaction.js";
import { RedactionPolicySchema } from "../../src/contracts/redaction.js";

const fixturesDir = join(process.cwd(), "fixtures/scenarios");

describe("RedactionSafety", () => {
  it("redacts PII per default policy without plaintext leak", () => {
    const fixture = JSON.parse(
      readFileSync(join(fixturesDir, "redaction-pii.json"), "utf-8"),
    ) as {
      payload: Record<string, unknown>;
      policy: RedactionPolicy;
      expectedSensitiveValues: string[];
    };

    const policy = RedactionPolicySchema.parse(fixture.policy);

    const response = buildRedactedView({
      payload: fixture.payload,
      policy,
    });

    expect(response.omittedPaths).toContain("applicant.ssn");
    expect(response.omittedPaths).toContain("credentials.token");
    expect(response.fields.find((f) => f.path === "applicant.email")?.value).not.toBe(
      "alex@example.com",
    );

    assertNoPlaintextLeak(response, fixture.expectedSensitiveValues);
  });

  it("omitted paths do not appear in fields", () => {
    const response = buildRedactedView({
      payload: { secret: "top-secret-value" },
      policy: {
        policyId: "test",
        rules: [{ path: "secret", action: "omit" }],
      },
    });

    expect(response.fields).toHaveLength(0);
    expect(response.omittedPaths).toContain("secret");
    assertNoPlaintextLeak(response, ["top-secret-value"]);
  });

  it("rejects payload exceeding max depth", () => {
    let nested: Record<string, unknown> = { value: "leaf" };
    for (let i = 0; i < 12; i++) {
      nested = { child: nested };
    }

    expect(() =>
      buildRedactedView({
        payload: nested,
        policy: { policyId: "test", rules: [{ path: "value", action: "mask" }] },
      }),
    ).toThrow(GsocError);
  });

  it("rejects empty policy rules", () => {
    expect(() =>
      buildRedactedView({
        payload: { a: 1 },
        policy: { policyId: "empty", rules: [] },
      }),
    ).toThrow(GsocError);
  });
});
