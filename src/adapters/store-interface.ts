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

export interface ApprovalStore {
  getApprovalQueue(query: ApprovalQueueQuery): ApprovalQueueResponse;
  getApprovalDetail(tenantId: string, approvalId: string): ApprovalDetail;
  getRunTimeline(tenantId: string, runId: string): RunTimeline;
  submitApprovalDecision(request: ApprovalDecisionRequest): ApprovalDecisionResponse;
  resubmitApproval(request: ResubmitApprovalRequest): ResubmitApprovalResponse;
  snapshot(): StoreSnapshot;
  restore(snapshot: StoreSnapshot): void;
}
