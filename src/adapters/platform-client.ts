import type { ApprovalDecisionRequest, ApprovalDecisionResponse } from "../contracts/approval.js";
import type { ResubmitApprovalRequest, ResubmitApprovalResponse } from "../contracts/resubmit.js";

/** Hooks for syncing console mutations back to a parent platform. */
export interface PlatformSyncHooks {
  onDecision?(response: ApprovalDecisionResponse, request: ApprovalDecisionRequest): void;
  onResubmit?(response: ResubmitApprovalResponse, request: ResubmitApprovalRequest): void;
}

export interface PlatformSyncEvent {
  type: "decision" | "resubmit";
  at: string;
  tenantId: string;
  approvalId: string;
  auditRef: string;
}

/** In-memory hook collector for tests and local platform integration demos. */
export class RecordingPlatformHooks implements PlatformSyncHooks {
  readonly events: PlatformSyncEvent[] = [];

  onDecision(response: ApprovalDecisionResponse, request: ApprovalDecisionRequest): void {
    this.events.push({
      type: "decision",
      at: response.decidedAt,
      tenantId: request.tenantContext.tenantId,
      approvalId: response.approvalId,
      auditRef: response.auditRef,
    });
  }

  onResubmit(response: ResubmitApprovalResponse, request: ResubmitApprovalRequest): void {
    this.events.push({
      type: "resubmit",
      at: response.resubmittedAt,
      tenantId: request.tenantContext.tenantId,
      approvalId: response.approvalId,
      auditRef: response.auditRef,
    });
  }
}
