# Case Study: GroundSealOperatorConsole

Phase 9 summary for external readers. Claims are tied to artifacts in this repository.

## Problem

Governed agent platforms need an operator surface for approval review, run timelines, trace visibility, and evidence browsing — without weakening redaction, tenancy, or fail-closed semantics.

## Approach

Subsystem-first, contract-led delivery across nine phases:

| Phase | Outcome |
|-------|---------|
| 0 | Glossary, five public contracts, evaluation categories |
| 1–2 | Zod schemas, approval state machine, fixture adapter, redaction engine |
| 3 | Full ErrorCode negative suite, resubmit flow |
| 4 | Eval baseline + CI ratchet |
| 5 | HTTP integration adapter |
| 6 | JSON file persistence + replay |
| 7 | Minimal React operator UI |
| 8 | Redaction policy experiment → role-based registry |
| 9 | This case study + integration backfeed |

## What was built

- **Contracts**: Approval queue, detail, decision, timeline, redacted presentation
- **Core**: Deterministic state machine, tenant-scoped store, audit refs on decisions
- **Safety**: Redaction before display; 11 ErrorCodes with regression tests
- **Integration**: `pnpm serve` HTTP API; optional `GSOC_STORE_PATH` persistence
- **UX**: `ui/` — queue, detail, redacted preview, decision actions

## Key lessons

1. **Contracts before UI** prevented presentation-driven drift; UI consumes stable HTTP shapes.
2. **Fail-closed edges** (terminal states, cross-tenant, malformed timelines) matter as much as happy paths.
3. **Redaction is not one-size-fits-all** — experiment showed utility vs disclosure tradeoff; role-based policy was the evidence-backed compromise.
4. **Deterministic fixtures** enabled parallel agent work and CI ratchet without live platform dependency.
5. **Thin adapter layer** kept the subsystem portable; parent platform owns auth, storage, execution.

## Evidence pointers

- 56+ tests, eval ratchet in CI
- Experiment: [`docs/experiments/`](experiments/redaction-policy-comparison.md)
- Failure taxonomy: [`docs/failure-taxonomy.md`](failure-taxonomy.md)
- Known limits: [`docs/known-limitations.md`](known-limitations.md)

## Residual risks

See [`integration-backfeed.md`](integration-backfeed.md#residual-risks).

## Who should read this

- Platform engineers integrating operator console into a larger agent system
- Security reviewers evaluating redaction and tenancy boundaries
- Future maintainers extending beyond Phase 9
