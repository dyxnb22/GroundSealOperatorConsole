import { z } from "zod";
import { RedactedFieldSchema } from "./approval.js";

export const EvidenceItemKindSchema = z.enum([
  "log_excerpt",
  "tool_output",
  "document_ref",
  "policy_check",
]);

export type EvidenceItemKind = z.infer<typeof EvidenceItemKindSchema>;

export const EvidenceItemSchema = z.object({
  itemId: z.string().min(1),
  kind: EvidenceItemKindSchema,
  label: z.string(),
  summary: z.string(),
  contentRef: z.string().nullable().optional(),
  redactedFields: z.array(RedactedFieldSchema),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const EvidenceBundleSchema = z.object({
  bundleId: z.string().min(1),
  tenantId: z.string().min(1),
  label: z.string(),
  items: z.array(EvidenceItemSchema),
});

export type EvidenceBundle = z.infer<typeof EvidenceBundleSchema>;
