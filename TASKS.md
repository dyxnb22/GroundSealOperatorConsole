# TASKS.md

## Phase 0–2 — Complete

See git history and [`docs/roadmap.md`](docs/roadmap.md).

## Phase 3 — Complete

- [x] Failure taxonomy ([`docs/failure-taxonomy.md`](docs/failure-taxonomy.md))
- [x] ErrorCode negative-path regression suite (`tests/negative/error-codes.test.ts`)
- [x] Resubmit handshake (`changes_requested → pending`) — [`docs/resubmit-handshake.md`](docs/resubmit-handshake.md)

## Phase 4 — Complete

- [x] Eval baseline (`evals/baseline.json`, `pnpm eval:baseline`)
- [x] CI ratchet ([`.github/workflows/ci.yml`](.github/workflows/ci.yml), `pnpm eval:ratchet`)

## Phase 5 — Complete

- [x] HTTP adapter ([`docs/http-api.md`](docs/http-api.md), `src/adapters/http-server.ts`)
- [x] Boundary tests (`tests/adapters/http-boundary.test.ts`)

## Phase 6 — Complete

- [x] File persistence ([`docs/persistence.md`](docs/persistence.md), `src/adapters/file-store.ts`)
- [x] Replay validation (`src/core/replay.ts`, `tests/adapters/file-store.test.ts`)

## Phase 7 — Complete

- [x] Minimal React operator UI ([`docs/operator-ui.md`](docs/operator-ui.md), `ui/`)
- [x] Queue list, detail panel, redacted preview, decision actions

## Now (Phase 8)

- [ ] Compare at least two redaction policy approaches with evidence
- [ ] Document tradeoffs in experiment memo

## Later (Phase 9)

- Case study and integration backfeed to parent platform understanding

## Sequencing Rules

- Prefer docs -> contracts -> tests -> implementation.
- Run `pnpm eval:ratchet` before merging; update baseline when adding tests intentionally.
