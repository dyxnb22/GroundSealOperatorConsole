import type { StoreSnapshot } from "../adapters/store-types.js";
import { MemoryStore } from "../adapters/memory-store.js";

export interface ReplayResult {
  replayedAt: string;
  approvalCount: number;
  auditCount: number;
  matchesBaseline: boolean;
}

/** Replay a snapshot into a fresh store and verify structural integrity. */
export function replaySnapshot(snapshot: StoreSnapshot): ReplayResult {
  const store = new MemoryStore(snapshot);
  const restored = store.snapshot();

  const matchesBaseline =
    restored.approvals.length === snapshot.approvals.length &&
    restored.runs.length === snapshot.runs.length &&
    restored.auditLog.length === snapshot.auditLog.length;

  for (const approval of snapshot.approvals) {
    store.getApprovalDetail(approval.tenantId, approval.approvalId);
  }

  return {
    replayedAt: new Date().toISOString(),
    approvalCount: restored.approvals.length,
    auditCount: restored.auditLog.length,
    matchesBaseline,
  };
}

export function diffSnapshots(a: StoreSnapshot, b: StoreSnapshot): string[] {
  const diffs: string[] = [];
  if (a.approvals.length !== b.approvals.length) {
    diffs.push(`approvals: ${a.approvals.length} vs ${b.approvals.length}`);
  }
  if (a.auditLog.length !== b.auditLog.length) {
    diffs.push(`auditLog: ${a.auditLog.length} vs ${b.auditLog.length}`);
  }
  return diffs;
}
