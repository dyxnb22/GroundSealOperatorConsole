import { z } from "zod";
import type { RedactedField } from "./approval.js";

export const RedactionActionSchema = z.enum(["mask", "omit", "hash"]);

export type RedactionAction = z.infer<typeof RedactionActionSchema>;

export const RedactionRuleSchema = z.object({
  path: z.string().min(1),
  action: RedactionActionSchema,
});

export type RedactionRule = z.infer<typeof RedactionRuleSchema>;

export const RedactionPolicySchema = z.object({
  policyId: z.string().min(1),
  rules: z.array(RedactionRuleSchema).min(1),
});

export type RedactionPolicy = z.infer<typeof RedactionPolicySchema>;

export const RedactedPresentationRequestSchema = z.object({
  payload: z.record(z.unknown()),
  policy: RedactionPolicySchema,
});

export type RedactedPresentationRequest = z.infer<
  typeof RedactedPresentationRequestSchema
>;

export const RedactedPresentationResponseSchema = z.object({
  fields: z.array(
    z.object({
      path: z.string(),
      label: z.string(),
      value: z.string(),
    }),
  ),
  omittedPaths: z.array(z.string()),
  policyId: z.string().min(1),
});

export type RedactedPresentationResponse = z.infer<
  typeof RedactedPresentationResponseSchema
>;

export const DEFAULT_PII_POLICY: RedactionPolicy = {
  policyId: "default-pii",
  rules: [
    { path: "applicant.email", action: "mask" },
    { path: "applicant.phone", action: "mask" },
    { path: "applicant.ssn", action: "omit" },
    { path: "credentials.token", action: "omit" },
    { path: "credentials.apiKey", action: "hash" },
  ],
};

/** Alternative policy: maximum omission, minimum disclosure (Phase 8 experiment). */
export const STRICT_OMIT_POLICY: RedactionPolicy = {
  policyId: "strict-omit",
  rules: [
    { path: "applicant.email", action: "omit" },
    { path: "applicant.phone", action: "omit" },
    { path: "applicant.ssn", action: "omit" },
    { path: "credentials.token", action: "omit" },
    { path: "credentials.apiKey", action: "omit" },
  ],
};

export const REDACTION_POLICIES = {
  "default-pii": DEFAULT_PII_POLICY,
  "strict-omit": STRICT_OMIT_POLICY,
} as const;

export type RedactionPolicyId = keyof typeof REDACTION_POLICIES;

export type { RedactedField };
