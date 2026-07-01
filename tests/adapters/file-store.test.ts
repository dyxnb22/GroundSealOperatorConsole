import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { FileStore } from "../../src/adapters/file-store.js";
import { replaySnapshot } from "../../src/core/replay.js";
import { ApprovalDecisionRequestSchema } from "../../src/contracts/approval.js";
import { GsocError } from "../../src/contracts/errors.js";

describe("FileStore persistence and replay", () => {
  let dir: string;
  let filePath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "gsoc-store-"));
    filePath = join(dir, "store.json");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("persists decision across store instances", () => {
    const store1 = new FileStore(filePath);
    store1.submitApprovalDecision(
      ApprovalDecisionRequestSchema.parse({
        tenantContext: { tenantId: "tenant-a", operatorId: "op-1", role: "reviewer" },
        approvalId: "apr-001",
        decision: "approve",
      }),
    );

    expect(existsSync(filePath)).toBe(true);

    const store2 = new FileStore(filePath);
    const detail = store2.getApprovalDetail("tenant-a", "apr-001");
    expect(detail.status).toBe("approved");
  });

  it("replaySnapshot validates restored store", () => {
    const store = new FileStore(filePath);
    const snapshot = store.snapshot();
    const result = replaySnapshot(snapshot);
    expect(result.matchesBaseline).toBe(true);
    expect(result.diffs).toHaveLength(0);
    expect(result.approvalCount).toBeGreaterThan(0);
  });

  it("throws STORE_LOAD_FAILED on corrupt file", () => {
    writeFileSync(filePath, "{ corrupt", "utf-8");
    expect(() => new FileStore(filePath)).toThrow(GsocError);
    try {
      new FileStore(filePath);
    } catch (e) {
      expect((e as GsocError).code).toBe("STORE_LOAD_FAILED");
    }
  });
});
