import { z } from "zod";
import { TenantContextSchema } from "./tenant.js";

export const ResubmitApprovalRequestSchema = z
  .object({
    tenantContext: TenantContextSchema,
    approvalId: z.string().min(1),
  })
  .strict();

export type ResubmitApprovalRequest = z.infer<typeof ResubmitApprovalRequestSchema>;

export const ResubmitApprovalResponseSchema = z.object({
  approvalId: z.string().min(1),
  status: z.literal("pending"),
  resubmittedAt: z.string().datetime(),
  auditRef: z.string().min(1),
});

export type ResubmitApprovalResponse = z.infer<typeof ResubmitApprovalResponseSchema>;
