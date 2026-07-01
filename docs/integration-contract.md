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

## Resolved Questions (Phase 0–9)

| Question | Decision |
|----------|----------|
| Which types stay platform-neutral? | The five public contracts above |
| Where is tenancy enforced? | Validated on every request in core layer; adapter scopes lookups by tenantId |
| Shared vs local models? | Public contracts shared; fixture registry and internal indexes are subsystem-local |
| Default evidence flow? | ApprovalDetail returns evidence bundle IDs; full bundle load is platform adapter concern |
| HTTP vs IPC adapter shape? | HTTP implemented — see [`docs/http-api.md`](http-api.md) |
| Pagination cursor encoding? | Offset string in Phase 2–7; production adapter may use opaque cursor |
| Resubmit ownership? | Platform-initiated — see [`docs/resubmit-handshake.md`](resubmit-handshake.md) |
| Redaction policy selection? | Role-based — see [`docs/experiments/decision-memo-redaction.md`](experiments/decision-memo-redaction.md) |

## Backfeed

Platform integration recommendations: [`docs/integration-backfeed.md`](integration-backfeed.md)

Case study: [`docs/case-study.md`](case-study.md)
