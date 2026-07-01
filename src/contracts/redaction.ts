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

export type { RedactedField };
