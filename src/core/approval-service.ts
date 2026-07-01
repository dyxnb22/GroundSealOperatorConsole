import type {
  ApprovalDetail,
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalQueueQuery,
  ApprovalQueueResponse,
} from "../contracts/approval.js";
import type { RunTimeline } from "../contracts/run.js";
import { FixtureStore, parseApprovalQueueQuery } from "../adapters/fixture-store.js";

let defaultStore: FixtureStore | undefined;

export function getDefaultStore(): FixtureStore {
  if (!defaultStore) {
    defaultStore = new FixtureStore();
  }
  return defaultStore;
}

export function resetDefaultStore(): void {
  defaultStore = new FixtureStore();
}

export function getApprovalQueue(
  rawQuery: unknown,
  store: FixtureStore = getDefaultStore(),
): ApprovalQueueResponse {
  const query = parseApprovalQueueQuery(rawQuery);
  return store.getApprovalQueue(query);
}

export function getApprovalDetail(
  tenantId: string,
  approvalId: string,
  store: FixtureStore = getDefaultStore(),
): ApprovalDetail {
  return store.getApprovalDetail(tenantId, approvalId);
}

export function getRunTimeline(
  tenantId: string,
  runId: string,
  store: FixtureStore = getDefaultStore(),
): RunTimeline {
  return store.getRunTimeline(tenantId, runId);
}

export function submitApprovalDecision(
  request: ApprovalDecisionRequest,
  store: FixtureStore = getDefaultStore(),
): ApprovalDecisionResponse {
  return store.submitApprovalDecision(request);
}

export { parseApprovalQueueQuery };
