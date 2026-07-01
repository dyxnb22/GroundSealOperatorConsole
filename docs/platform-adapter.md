# Platform Adapter

Phase 10 production integration pattern for syncing console mutations to a parent platform.

## PlatformBridgeStore

[`src/adapters/platform-bridge-store.ts`](../src/adapters/platform-bridge-store.ts) wraps any `ApprovalStore` and invokes hooks after mutations:

```typescript
import { MemoryStore } from "../adapters/memory-store.js";
import { PlatformBridgeStore } from "../adapters/platform-bridge-store.js";
import { RecordingPlatformHooks } from "../adapters/platform-client.js";

const hooks = new RecordingPlatformHooks();
const store = new PlatformBridgeStore(new MemoryStore(), hooks);

// After submitApprovalDecision, hooks.events contains audit sync payload
```

## PlatformSyncHooks

| Hook | When | Use |
|------|------|-----|
| `onDecision` | After successful approval decision | Push audit ref to platform log |
| `onResubmit` | After successful resubmit | Notify platform workflow engine |

Implement hooks to call platform HTTP APIs, message queues, or webhooks. Hooks are synchronous; async platform calls should be queued by the hook implementation.

## Production wiring

```typescript
// src/cli/serve.ts (example)
const inner = process.env.GSOC_STORE_PATH
  ? new FileStore(process.env.GSOC_STORE_PATH)
  : new MemoryStore();

const hooks: PlatformSyncHooks = {
  onDecision(response, request) {
    // platformClient.postAudit({ ...response, tenantId: request.tenantContext.tenantId })
  },
};

const store = new PlatformBridgeStore(inner, hooks);
createGsocHttpServer({ store }).listen();
```

## What stays in the platform

- Authentication and tenant membership
- Authoritative approval/run/evidence storage (optional read-through later)
- Workflow execution after approve/reject

## Tests

[`tests/adapters/platform-bridge.test.ts`](../tests/adapters/platform-bridge.test.ts)
