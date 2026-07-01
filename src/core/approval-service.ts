import type { OperatorRole } from "../contracts/tenant.js";
import type {
  ApprovalDetail,
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalQueueResponse,
} from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";
import type { ResubmitApprovalRequest, ResubmitApprovalResponse } from "../contracts/resubmit.js";
import type { ApprovalStore } from "../adapters/store-interface.js";
import { MemoryStore } from "../adapters/memory-store.js";
import {
  parseApprovalQueueQuery,
  parseApprovalDecisionRequest,
  parseResubmitRequest,
} from "../adapters/memory-store.js";

let defaultStore: ApprovalStore | undefined;

export function getDefaultStore(): ApprovalStore {
  if (!defaultStore) {
    defaultStore = new MemoryStore();
  }
  return defaultStore;
}

export function setDefaultStore(store: ApprovalStore): void {
  defaultStore = store;
}

export function resetDefaultStore(): void {
  defaultStore = new MemoryStore();
}

export function getApprovalQueue(
  rawQuery: unknown,
  store: ApprovalStore = getDefaultStore(),
): ApprovalQueueResponse {
  const query = parseApprovalQueueQuery(rawQuery);
  return store.getApprovalQueue(query);
}

export function getApprovalDetail(
  tenantId: string,
  approvalId: string,
  options?: { role?: OperatorRole },
  store: ApprovalStore = getDefaultStore(),
): ApprovalDetail {
  return store.getApprovalDetail(tenantId, approvalId, options);
}

export function getRunTimeline(
  tenantId: string,
  runId: string,
  store: ApprovalStore = getDefaultStore(),
): RunTimeline {
  return store.getRunTimeline(tenantId, runId);
}

export function submitApprovalDecision(
  request: ApprovalDecisionRequest,
  store: ApprovalStore = getDefaultStore(),
): ApprovalDecisionResponse {
  return store.submitApprovalDecision(request);
}

export function resubmitApproval(
  request: ResubmitApprovalRequest,
  store: ApprovalStore = getDefaultStore(),
): ResubmitApprovalResponse {
  return store.resubmitApproval(request);
}

export {
  parseApprovalQueueQuery,
  parseApprovalDecisionRequest,
  parseResubmitRequest,
};
