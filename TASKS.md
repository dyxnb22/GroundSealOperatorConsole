# TASKS.md

## Phase 0 — Complete

- [x] Glossary and boundary language ([`docs/glossary.md`](docs/glossary.md))
- [x] Five public contracts with example JSON ([`docs/contracts/`](docs/contracts/README.md))
- [x] Evaluation categories and failure buckets ([`docs/evaluation-plan.md`](docs/evaluation-plan.md))
- [x] Assumption split ([`docs/integration-contract.md`](docs/integration-contract.md))
- [x] Local dev shape ([`docs/local-dev.md`](docs/local-dev.md))

## Phase 1 — Complete

- [x] TypeScript project: package.json, tsconfig, vitest
- [x] Zod schemas in `src/contracts/`
- [x] Domain model doc ([`docs/domain-model.md`](docs/domain-model.md))
- [x] Seven scenario fixtures under `fixtures/scenarios/`
- [x] Schema parse tests (`tests/contracts/fixtures.test.ts`)

## Phase 2 — Complete

- [x] Approval state machine (`src/core/approval-state-machine.ts`)
- [x] Fixture adapter (`src/adapters/fixture-store.ts`)
- [x] Queue, detail, decision service (`src/core/approval-service.ts`)
- [x] Redaction policy engine (`src/policy/redaction.ts`)
- [x] End-to-end scenario tests (`tests/scenarios/approval-flow.test.ts`)
- [x] Known limitations ([`docs/known-limitations.md`](docs/known-limitations.md))

## Now (Phase 3)

- [ ] Expand negative-path regression suite with unified ErrorCode coverage
- [ ] Add failure record template usage for any new issues found
- [ ] Document resubmit handshake assumptions for platform adapter

## Next (Phase 4)

- [ ] Establish eval baseline snapshot (`evals/baseline.json`)
- [ ] Wire CI test ratchet for contract pass rate and negative-path correctness

## Later (Phase 5–7)

- HTTP/IPC integration adapter and boundary tests (Phase 5)
- Persistence and replay (Phase 6)
- Minimal React operator UI (Phase 7)

## Sequencing Rules

- Prefer docs -> contracts -> tests -> implementation.
- Avoid broad implementation until phase exit criteria are explicit.
- Keep tasks small enough for one focused agent round to complete well.
