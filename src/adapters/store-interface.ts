import type {
  ApprovalDetail,
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalQueueQuery,
  ApprovalQueueResponse,
} from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";
import type { ResubmitApprovalRequest, ResubmitApprovalResponse } from "../contracts/resubmit.js";
import type { StoreSnapshot } from "./store-types.js";

import type { OperatorRole } from "../contracts/tenant.js";

export interface DetailOptions {
  role?: OperatorRole;
}

export interface ApprovalStore {
  getApprovalQueue(query: ApprovalQueueQuery): ApprovalQueueResponse;
  getApprovalDetail(
    tenantId: string,
    approvalId: string,
    options?: DetailOptions,
  ): ApprovalDetail;
  getRunTimeline(tenantId: string, runId: string): RunTimeline;
  submitApprovalDecision(request: ApprovalDecisionRequest): ApprovalDecisionResponse;
  resubmitApproval(request: ResubmitApprovalRequest): ResubmitApprovalResponse;
  snapshot(): StoreSnapshot;
  restore(snapshot: StoreSnapshot): void;
}
