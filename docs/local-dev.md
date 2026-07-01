# Local Development

Minimal development shape for Phase 1–2. No database, real auth, or external APIs.

## Directory Layout

```
ground-seal-operator-console/
  src/
    contracts/       # Zod schemas + TypeScript types
    policy/          # Redaction rules, invariant helpers
    core/            # Approval state machine and service
    adapters/        # Fixture-backed store (deterministic local mode)
  fixtures/
    scenarios/       # JSON scenario payloads for docs and tests
  tests/
    contracts/
    core/
    policy/
    scenarios/
  docs/
  package.json
  tsconfig.json
  vitest.config.ts
```

## Prerequisites

- Node.js 20+
- pnpm 9+

## Commands

```bash
pnpm install
pnpm test              # run all tests (50+)
pnpm test:watch        # watch mode
pnpm typecheck         # tsc --noEmit
pnpm serve             # HTTP API on :3100
pnpm eval:baseline     # regenerate evals/baseline.json
pnpm eval:ratchet      # verify no regression vs baseline
```

## Operator UI

```bash
pnpm serve             # terminal 1
cd ui && pnpm install && pnpm dev   # terminal 2 → http://localhost:5173
```

See [`docs/operator-ui.md`](operator-ui.md) and [`docs/local-dev.md`](local-dev.md).

## Phase Progression

| Phase | Local dev adds |
|-------|----------------|
| 1–2 | Schemas, fixture adapter, scenario tests |
| 3 | Negative-path suite, resubmit flow |
| 4 | Eval baseline + CI ratchet |
| 5 | HTTP server (`pnpm serve`) |
| 6 | File persistence (`GSOC_STORE_PATH`) |
| 7 | React UI in `ui/` |

## Environment Variables

None required for Phase 1–2. Future phases may add `GSOC_ADAPTER_URL` for integration testing.
