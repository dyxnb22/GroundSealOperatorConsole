import type { OperatorRole } from "../contracts/tenant.js";
import {
  DEFAULT_PII_POLICY,
  STRICT_OMIT_POLICY,
  type RedactionPolicy,
  type RedactionPolicyId,
} from "../contracts/redaction.js";

const ROLE_POLICY_MAP: Record<OperatorRole, RedactionPolicyId> = {
  viewer: "strict-omit",
  reviewer: "default-pii",
  admin: "default-pii",
};

const POLICIES: Record<RedactionPolicyId, RedactionPolicy> = {
  "default-pii": DEFAULT_PII_POLICY,
  "strict-omit": STRICT_OMIT_POLICY,
};

export function resolvePolicyForRole(role: OperatorRole): RedactionPolicy {
  return POLICIES[ROLE_POLICY_MAP[role]];
}

export function resolvePolicyById(policyId: RedactionPolicyId): RedactionPolicy {
  return POLICIES[policyId];
}

export function listRegisteredPolicies(): RedactionPolicyId[] {
  return Object.keys(POLICIES) as RedactionPolicyId[];
}
