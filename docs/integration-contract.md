# Integration Contract

## Role In A Larger System

GroundSealOperatorConsole should plug into a parent platform as a specialized subsystem rather than a hidden helper module.

## Integration Expectations

- Callers provide typed input, not arbitrary prompts.
- Callers receive typed output plus enough evidence to understand the result.
- Subsystem invariants remain enforced even when the parent platform wants convenience.
- Failure states are explicit and machine-readable.

## Desired Boundary Shape

- thin adapter layer
- explicit request and response schemas
- deterministic local mode for testing
- minimal assumptions about the rest of the platform

## Assumption Split

### Parent Platform Provides

- Identity and authentication (who the operator is)
- Authoritative tenant membership and role assignment
- Persistent storage for runs, traces, evidence bundles, and approval records
- Final policy enforcement for workflow execution (GroundSealOperatorConsole does not execute agent actions)
- Raw payload stores referenced by `payloadRef` and evidence IDs

### GroundSealOperatorConsole Owns

- Operator-facing presentation models (queue, detail, timeline views)
- Approval UX state transitions and decision submission semantics
- Redaction view synthesis via RedactionPolicy
- Operator-facing error codes and audit references for decisions
- Deterministic local mode for offline testing (fixture adapter)

### Shared Contracts (Platform-Neutral)

These five public types are stable integration surfaces; see [`docs/contracts/README.md`](contracts/README.md):

1. ApprovalQueueQuery / ApprovalQueueResponse
2. ApprovalDetail
3. ApprovalDecision
4. RunTimeline
5. RedactedPresentation

Platform-specific identifiers (internal DB keys, auth tokens) MUST NOT leak into these contracts. Adapters translate at the boundary.

## Resolved Questions (Phase 0)

| Question | Decision |
|----------|----------|
| Which types stay platform-neutral? | The five public contracts above |
| Where is tenancy enforced? | Validated on every request in core layer; adapter scopes lookups by tenantId |
| Shared vs local models? | Public contracts shared; fixture registry and internal indexes are subsystem-local |
| Default evidence flow? | ApprovalDetail returns evidence bundle IDs; full bundle load is a separate adapter call in later phases |

## Questions To Resolve Later

- HTTP vs IPC adapter shape (Phase 5)
- Pagination cursor encoding for production adapters
- Whether resubmit (`changes_requested → pending`) is platform-initiated or console-initiated
