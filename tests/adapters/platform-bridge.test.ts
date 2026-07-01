import { describe, it, expect } from "vitest";
import { PlatformBridgeStore } from "../../src/adapters/platform-bridge-store.js";
import { RecordingPlatformHooks } from "../../src/adapters/platform-client.js";
import { MemoryStore } from "../../src/adapters/memory-store.js";
import { ApprovalDecisionRequestSchema } from "../../src/contracts/approval.js";

describe("PlatformBridgeStore", () => {
  it("records decision events via platform hooks", () => {
    const hooks = new RecordingPlatformHooks();
    const store = new PlatformBridgeStore(new MemoryStore(), hooks);

    store.submitApprovalDecision(
      ApprovalDecisionRequestSchema.parse({
        tenantContext: { tenantId: "tenant-a", operatorId: "op-p", role: "reviewer" },
        approvalId: "apr-001",
        decision: "approve",
      }),
    );

    expect(hooks.events).toHaveLength(1);
    expect(hooks.events[0]!.type).toBe("decision");
    expect(hooks.events[0]!.approvalId).toBe("apr-001");
  });

  it("delegates reads to inner store", () => {
    const store = new PlatformBridgeStore(new MemoryStore());
    const detail = store.getApprovalDetail("tenant-a", "apr-001");
    expect(detail.approvalId).toBe("apr-001");
  });
});
