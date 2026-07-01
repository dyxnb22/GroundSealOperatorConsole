import type { StoreSnapshot } from "../adapters/store-types.js";
import { MemoryStore } from "../adapters/memory-store.js";

export interface ReplayResult {
  replayedAt: string;
  approvalCount: number;
  auditCount: number;
  matchesBaseline: boolean;
  diffs: string[];
}

/** Replay a snapshot into a fresh store and verify structural integrity. */
export function replaySnapshot(snapshot: StoreSnapshot): ReplayResult {
  const store = new MemoryStore(snapshot);
  const restored = store.snapshot();
  const diffs = diffSnapshots(snapshot, restored);

  for (const approval of snapshot.approvals) {
    store.getApprovalDetail(approval.tenantId, approval.approvalId);
  }

  return {
    replayedAt: new Date().toISOString(),
    approvalCount: restored.approvals.length,
    auditCount: restored.auditLog.length,
    matchesBaseline: diffs.length === 0,
    diffs,
  };
}

export function diffSnapshots(a: StoreSnapshot, b: StoreSnapshot): string[] {
  const diffs: string[] = [];
  if (a.approvals.length !== b.approvals.length) {
    diffs.push(`approvals: ${a.approvals.length} vs ${b.approvals.length}`);
  }
  if (a.runs.length !== b.runs.length) {
    diffs.push(`runs: ${a.runs.length} vs ${b.runs.length}`);
  }
  if (a.auditLog.length !== b.auditLog.length) {
    diffs.push(`auditLog: ${a.auditLog.length} vs ${b.auditLog.length}`);
  }

  for (const approval of a.approvals) {
    const other = b.approvals.find((x) => x.approvalId === approval.approvalId);
    if (!other) {
      diffs.push(`missing approval ${approval.approvalId}`);
      continue;
    }
    if (other.status !== approval.status || other.tenantId !== approval.tenantId) {
      diffs.push(`approval ${approval.approvalId} field mismatch`);
    }
  }

  return diffs;
}
