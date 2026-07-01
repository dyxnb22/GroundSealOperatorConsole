# TASKS.md

## Phases 0–7 — Complete

See [`docs/roadmap.md`](docs/roadmap.md) and git history.

## Phase 8 — Complete

- [x] Compare redaction policies (`default-pii` vs `strict-omit`) with deterministic corpus
- [x] Experiment docs ([`docs/experiments/redaction-policy-comparison.md`](docs/experiments/redaction-policy-comparison.md))
- [x] Decision memo ([`docs/experiments/decision-memo-redaction.md`](docs/experiments/decision-memo-redaction.md))
- [x] Role-based policy registry (`src/policy/policy-registry.ts`)
- [x] Eval harness (`pnpm eval:experiment`, `tests/evals/redaction-comparison.test.ts`)

## Phase 9 — Complete

- [x] Case study ([`docs/case-study.md`](docs/case-study.md))
- [x] Integration backfeed ([`docs/integration-backfeed.md`](docs/integration-backfeed.md))
- [x] Updated integration contract with resolved questions

## Project complete (Phases 0–9)

All roadmap phases through case study and backfeed are documented and tested. Future work is optional extension (production adapter, full evidence UI, user studies).

## Sequencing Rules

- Prefer docs -> contracts -> tests -> implementation.
- Run `pnpm eval:ratchet` before merging; update baseline when adding tests intentionally.
- Run `pnpm eval:experiment` when changing redaction policies.
