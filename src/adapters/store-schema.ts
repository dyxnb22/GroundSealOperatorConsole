import { z } from "zod";
import { ApprovalStatusSchema } from "../contracts/approval.js";
import { RunTimelineSchema } from "../contracts/run.js";
import { EvidenceItemKindSchema } from "../contracts/evidence.js";

export const InternalEvidenceItemSchema = z.object({
  itemId: z.string().min(1),
  kind: EvidenceItemKindSchema,
  label: z.string(),
  summary: z.string(),
  contentRef: z.string().nullable().optional(),
  rawPayload: z.record(z.unknown()),
});

export const InternalEvidenceBundleSchema = z.object({
  bundleId: z.string().min(1),
  tenantId: z.string().min(1),
  label: z.string(),
  items: z.array(InternalEvidenceItemSchema),
});

export const InternalApprovalSchema = z.object({
  approvalId: z.string().min(1),
  tenantId: z.string().min(1),
  status: ApprovalStatusSchema,
  subject: z.string(),
  runId: z.string().min(1),
  evidenceBundleIds: z.array(z.string()),
  requestedAction: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  rawPayload: z.record(z.unknown()),
  auditRef: z.string().optional(),
  decidedBy: z.string().optional(),
  decidedAt: z.string().datetime().optional(),
});

export const InternalRunSchema = z.object({
  runId: z.string().min(1),
  tenantId: z.string().min(1),
  timeline: RunTimelineSchema,
});

export const AuditEntrySchema = z.object({
  auditRef: z.string().min(1),
  approvalId: z.string().min(1),
  tenantId: z.string().min(1),
  action: z.enum(["decision", "resubmit"]),
  at: z.string().datetime(),
  operatorId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export const StoreSnapshotSchema = z.object({
  version: z.literal(1),
  approvals: z.array(InternalApprovalSchema),
  runs: z.array(InternalRunSchema),
  auditLog: z.array(AuditEntrySchema),
  evidenceBundles: z.array(InternalEvidenceBundleSchema).optional(),
});

export function parseStoreSnapshot(raw: unknown) {
  return StoreSnapshotSchema.safeParse(raw);
}
