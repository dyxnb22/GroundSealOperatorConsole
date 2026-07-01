import type {
  ApprovalDetail,
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalQueueResponse,
} from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";
import type { EvidenceBundle } from "../contracts/evidence.js";
import type { ResubmitApprovalRequest, ResubmitApprovalResponse } from "../contracts/resubmit.js";
import type { ApprovalStore, DetailOptions } from "../adapters/store-interface.js";
import { MemoryStore } from "../adapters/memory-store.js";
import {
  parseApprovalQueueQuery,
  parseApprovalDecisionRequest,
  parseResubmitRequest,
} from "../core/validation.js";

export interface ServiceContext {
  store?: ApprovalStore;
}

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

function resolveStore(ctx?: ServiceContext): ApprovalStore {
  return ctx?.store ?? getDefaultStore();
}

export function getApprovalQueue(
  rawQuery: unknown,
  ctx?: ServiceContext,
): ApprovalQueueResponse {
  const query = parseApprovalQueueQuery(rawQuery);
  return resolveStore(ctx).getApprovalQueue(query);
}

export function getApprovalDetail(
  tenantId: string,
  approvalId: string,
  options?: DetailOptions,
  ctx?: ServiceContext,
): ApprovalDetail {
  return resolveStore(ctx).getApprovalDetail(tenantId, approvalId, options);
}

export function getRunTimeline(
  tenantId: string,
  runId: string,
  ctx?: ServiceContext,
): RunTimeline {
  return resolveStore(ctx).getRunTimeline(tenantId, runId);
}

export function getEvidenceBundle(
  tenantId: string,
  bundleId: string,
  options?: DetailOptions,
  ctx?: ServiceContext,
): EvidenceBundle {
  return resolveStore(ctx).getEvidenceBundle(tenantId, bundleId, options);
}

export function submitApprovalDecision(
  request: ApprovalDecisionRequest,
  ctx?: ServiceContext,
): ApprovalDecisionResponse {
  return resolveStore(ctx).submitApprovalDecision(request);
}

export function resubmitApproval(
  request: ResubmitApprovalRequest,
  ctx?: ServiceContext,
): ResubmitApprovalResponse {
  return resolveStore(ctx).resubmitApproval(request);
}

export {
  parseApprovalQueueQuery,
  parseApprovalDecisionRequest,
  parseResubmitRequest,
};
