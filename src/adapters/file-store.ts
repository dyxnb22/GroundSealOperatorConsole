import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { MemoryStore } from "./memory-store.js";
import type { ApprovalStore, DetailOptions } from "./store-interface.js";
import type { StoreSnapshot } from "./store-types.js";
import { parseStoreSnapshot } from "./store-schema.js";
import { GsocError } from "../contracts/errors.js";

export class FileStore implements ApprovalStore {
  private readonly inner: MemoryStore;
  private readonly filePath: string;

  constructor(filePath: string, initialSnapshot?: StoreSnapshot) {
    this.filePath = filePath;
    if (initialSnapshot) {
      this.inner = new MemoryStore(initialSnapshot);
      this.persist();
    } else if (existsSync(filePath)) {
      this.inner = new MemoryStore(this.load());
    } else {
      this.inner = new MemoryStore();
      this.persist();
    }
  }

  private load(): StoreSnapshot {
    try {
      const raw = readFileSync(this.filePath, "utf-8");
      const parsed = parseStoreSnapshot(JSON.parse(raw));
      if (!parsed.success) {
        throw new GsocError("STORE_LOAD_FAILED", parsed.error.message);
      }
      return parsed.data;
    } catch (error) {
      if (error instanceof GsocError) {
        throw error;
      }
      throw new GsocError("STORE_LOAD_FAILED", `Failed to load store from ${this.filePath}`);
    }
  }

  persist(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const tmpPath = join(dir, `.${this.filePath.split("/").pop()}.tmp`);
    writeFileSync(tmpPath, JSON.stringify(this.inner.snapshot(), null, 2), "utf-8");
    renameSync(tmpPath, this.filePath);
  }

  getApprovalQueue(...args: Parameters<ApprovalStore["getApprovalQueue"]>) {
    return this.inner.getApprovalQueue(...args);
  }

  getApprovalDetail(
    tenantId: string,
    approvalId: string,
    options?: DetailOptions,
  ) {
    return this.inner.getApprovalDetail(tenantId, approvalId, options);
  }

  getRunTimeline(...args: Parameters<ApprovalStore["getRunTimeline"]>) {
    return this.inner.getRunTimeline(...args);
  }

  getEvidenceBundle(...args: Parameters<ApprovalStore["getEvidenceBundle"]>) {
    return this.inner.getEvidenceBundle(...args);
  }

  submitApprovalDecision(...args: Parameters<ApprovalStore["submitApprovalDecision"]>) {
    const result = this.inner.submitApprovalDecision(...args);
    this.persist();
    return result;
  }

  resubmitApproval(...args: Parameters<ApprovalStore["resubmitApproval"]>) {
    const result = this.inner.resubmitApproval(...args);
    this.persist();
    return result;
  }

  snapshot(): StoreSnapshot {
    return this.inner.snapshot();
  }

  restore(snapshot: StoreSnapshot): void {
    this.inner.restore(snapshot);
    this.persist();
  }
}
