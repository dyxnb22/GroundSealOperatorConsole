import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { RedactionPolicy } from "../contracts/redaction.js";
import { DEFAULT_PII_POLICY, STRICT_OMIT_POLICY } from "../contracts/redaction.js";
import {
  buildRedactedView,
  assertNoPlaintextLeak,
} from "../policy/redaction.js";

export interface RedactionCorpusEntry {
  id: string;
  payload: Record<string, unknown>;
  sensitiveValues: string[];
}

export interface PolicyMetrics {
  policyId: string;
  visibleFieldCount: number;
  omittedFieldCount: number;
  correlationFieldCount: number;
  partialMaskCount: number;
  leakCount: number;
  operatorUtilityScore: number;
}

export interface ComparisonResult {
  corpusSize: number;
  policies: PolicyMetrics[];
  winner: {
    operatorUtility: string;
    minimumDisclosure: string;
    recommendation: string;
  };
}

const POLICIES: RedactionPolicy[] = [DEFAULT_PII_POLICY, STRICT_OMIT_POLICY];

export function loadRedactionCorpus(): RedactionCorpusEntry[] {
  const fixturePath = join(process.cwd(), "fixtures/experiments/redaction-corpus.json");
  const raw = JSON.parse(readFileSync(fixturePath, "utf-8")) as {
    entries: RedactionCorpusEntry[];
  };
  return raw.entries;
}

export function measurePolicy(
  policy: RedactionPolicy,
  corpus: RedactionCorpusEntry[],
): PolicyMetrics {
  let visibleFieldCount = 0;
  let omittedFieldCount = 0;
  let correlationFieldCount = 0;
  let partialMaskCount = 0;
  let leakCount = 0;
  let operatorUtilityScore = 0;

  for (const entry of corpus) {
    const response = buildRedactedView({ payload: entry.payload, policy });
    visibleFieldCount += response.fields.length;
    omittedFieldCount += response.omittedPaths.length;

    for (const field of response.fields) {
      if (field.value.startsWith("#")) correlationFieldCount++;
      if (field.value.includes("@") && !entry.sensitiveValues.includes(field.value)) {
        partialMaskCount++;
        operatorUtilityScore += 1;
      }
      if (field.value === "[REDACTED]") operatorUtilityScore += 0.5;
    }

    try {
      assertNoPlaintextLeak(response, entry.sensitiveValues);
    } catch {
      leakCount++;
    }
  }

  return {
    policyId: policy.policyId,
    visibleFieldCount,
    omittedFieldCount,
    correlationFieldCount,
    partialMaskCount,
    leakCount,
    operatorUtilityScore,
  };
}

export function compareRedactionPolicies(
  corpus: RedactionCorpusEntry[] = loadRedactionCorpus(),
): ComparisonResult {
  const policies = POLICIES.map((p) => measurePolicy(p, corpus));

  const byUtility = [...policies].sort(
    (a, b) => b.operatorUtilityScore - a.operatorUtilityScore,
  );
  const byDisclosure = [...policies].sort(
    (a, b) => a.visibleFieldCount - b.visibleFieldCount,
  );

  const utilityWinner = byUtility[0]!;
  const disclosureWinner = byDisclosure[0]!;

  return {
    corpusSize: corpus.length,
    policies,
    winner: {
      operatorUtility: utilityWinner.policyId,
      minimumDisclosure: disclosureWinner.policyId,
      recommendation:
        utilityWinner.policyId === disclosureWinner.policyId
          ? utilityWinner.policyId
          : "role-based: reviewer→default-pii, viewer→strict-omit",
    },
  };
}
