import { z } from "zod";
import { TenantContextSchema } from "./tenant.js";

export const ApprovalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "changes_requested",
]);

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

export const TERMINAL_STATUSES: ReadonlySet<ApprovalStatus> = new Set([
  "approved",
  "rejected",
]);

export const RedactedFieldSchema = z.object({
  path: z.string(),
  label: z.string(),
  value: z.string(),
});

export type RedactedField = z.infer<typeof RedactedFieldSchema>;

export const ApprovalQueueItemSchema = z.object({
  approvalId: z.string().min(1),
  status: ApprovalStatusSchema,
  subject: z.string(),
  runId: z.string().min(1),
  createdAt: z.string().datetime(),
  summary: z.string(),
});

export type ApprovalQueueItem = z.infer<typeof ApprovalQueueItemSchema>;

export const ApprovalQueueQuerySchema = z
  .object({
    tenantContext: TenantContextSchema,
    status: z.union([ApprovalStatusSchema, z.literal("all")]).default("pending"),
    limit: z.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
  })
  .strict();

export type ApprovalQueueQuery = z.infer<typeof ApprovalQueueQuerySchema>;

export const ApprovalQueueResponseSchema = z.object({
  items: z.array(ApprovalQueueItemSchema),
  nextCursor: z.string().nullable(),
});

export type ApprovalQueueResponse = z.infer<typeof ApprovalQueueResponseSchema>;

export const ApprovalDetailSchema = z.object({
  approvalId: z.string().min(1),
  tenantId: z.string().min(1),
  status: ApprovalStatusSchema,
  subject: z.string(),
  runId: z.string().min(1),
  evidenceBundleIds: z.array(z.string()),
  requestedAction: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  redactedPreview: z.array(RedactedFieldSchema),
});

export type ApprovalDetail = z.infer<typeof ApprovalDetailSchema>;

export const ApprovalDecisionTypeSchema = z.enum([
  "approve",
  "reject",
  "request_changes",
]);

export type ApprovalDecisionType = z.infer<typeof ApprovalDecisionTypeSchema>;

export const ApprovalDecisionRequestSchema = z
  .object({
    tenantContext: TenantContextSchema,
    approvalId: z.string().min(1),
    decision: ApprovalDecisionTypeSchema,
    reason: z.string().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (
      (val.decision === "reject" || val.decision === "request_changes") &&
      (!val.reason || val.reason.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "reason is required for reject and request_changes",
        path: ["reason"],
      });
    }
  });

export type ApprovalDecisionRequest = z.infer<typeof ApprovalDecisionRequestSchema>;

export const ApprovalDecisionResponseSchema = z.object({
  approvalId: z.string().min(1),
  status: ApprovalStatusSchema,
  decidedAt: z.string().datetime(),
  decidedBy: z.string().min(1),
  auditRef: z.string().min(1),
});

export type ApprovalDecisionResponse = z.infer<typeof ApprovalDecisionResponseSchema>;
