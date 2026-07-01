# Public Contract Index

Phase 1–10 public contract surfaces. Each linked document defines fields, invariants, untrusted input handling, and failure response shapes.

| # | Contract | Purpose | Document |
|---|----------|---------|----------|
| 1 | ApprovalQueueQuery / ApprovalQueueResponse | List pending and recent approvals with pagination | [approval-queue.md](./approval-queue.md) |
| 2 | ApprovalDetail | Single approval with run and evidence references | [approval-detail.md](./approval-detail.md) |
| 3 | ApprovalDecision | Submit approve / reject / request_changes | [approval-decision.md](./approval-decision.md) |
| 4 | RunTimeline | Ordered trace events for a run | [run-timeline.md](./run-timeline.md) |
| 5 | RedactedPresentation | Policy-driven safe display model | [redacted-presentation.md](./redacted-presentation.md) |
| 6 | EvidenceBundle | Redacted evidence items for review | [evidence-bundle.md](./evidence-bundle.md) |

## Shared Types

- **TenantContext**: `{ tenantId, operatorId?, role }` — required on all mutating and scoped read operations.
- **ErrorResponse**: `{ code, message, details? }` — machine-readable failure; see each contract for allowed codes.

## Implementation Mapping

| Contract layer (architecture) | Code location (Phase 1+) |
|------------------------------|---------------------------|
| Schemas and validators | `src/contracts/` |
| Invariant enforcement | `src/policy/` |
| State transitions | `src/core/approval-state-machine.ts` |
| Deterministic local adapter | `src/adapters/fixture-store.ts` |

## Example Fixtures

JSON examples live under `fixtures/scenarios/` and are referenced from each contract document.
