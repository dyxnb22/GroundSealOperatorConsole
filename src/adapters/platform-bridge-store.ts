import type { ApprovalStore } from "./store-interface.js";
import type { PlatformSyncHooks } from "./platform-client.js";
import type {
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalQueueQuery,
  ApprovalQueueResponse,
  ApprovalDetail,
} from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";
import type { ResubmitApprovalRequest, ResubmitApprovalResponse } from "../contracts/resubmit.js";
import type { EvidenceBundle } from "../contracts/evidence.js";
import type { DetailOptions } from "./store-interface.js";
import type { StoreSnapshot } from "./store-types.js";

/**
 * Decorator store that delegates reads/writes to an inner store and notifies
 * platform hooks on mutations. Use in production to sync audit events upstream.
 */
export class PlatformBridgeStore implements ApprovalStore {
  constructor(
    private readonly inner: ApprovalStore,
    private readonly hooks: PlatformSyncHooks = {},
  ) {}

  getApprovalQueue(query: ApprovalQueueQuery): ApprovalQueueResponse {
    return this.inner.getApprovalQueue(query);
  }

  getApprovalDetail(tenantId: string, approvalId: string, options?: DetailOptions): ApprovalDetail {
    return this.inner.getApprovalDetail(tenantId, approvalId, options);
  }

  getRunTimeline(tenantId: string, runId: string): RunTimeline {
    return this.inner.getRunTimeline(tenantId, runId);
  }

  getEvidenceBundle(
    tenantId: string,
    bundleId: string,
    options?: DetailOptions,
  ): EvidenceBundle {
    return this.inner.getEvidenceBundle(tenantId, bundleId, options);
  }

  submitApprovalDecision(request: ApprovalDecisionRequest): ApprovalDecisionResponse {
    const response = this.inner.submitApprovalDecision(request);
    this.hooks.onDecision?.(response, request);
    return response;
  }

  resubmitApproval(request: ResubmitApprovalRequest): ResubmitApprovalResponse {
    const response = this.inner.resubmitApproval(request);
    this.hooks.onResubmit?.(response, request);
    return response;
  }

  snapshot(): StoreSnapshot {
    return this.inner.snapshot();
  }

  restore(snapshot: StoreSnapshot): void {
    this.inner.restore(snapshot);
  }
}
