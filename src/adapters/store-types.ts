import type { ApprovalStatus } from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";

export interface InternalApproval {
  approvalId: string;
  tenantId: string;
  status: ApprovalStatus;
  subject: string;
  runId: string;
  evidenceBundleIds: string[];
  requestedAction: string;
  createdAt: string;
  updatedAt: string;
  rawPayload: Record<string, unknown>;
  auditRef?: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface InternalRun {
  runId: string;
  tenantId: string;
  timeline: RunTimeline;
}

export interface AuditEntry {
  auditRef: string;
  approvalId: string;
  tenantId: string;
  action: "decision" | "resubmit";
  at: string;
  operatorId?: string;
  details?: Record<string, unknown>;
}

export interface StoreSnapshot {
  version: 1;
  approvals: InternalApproval[];
  runs: InternalRun[];
  auditLog: AuditEntry[];
}
