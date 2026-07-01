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
pnpm test          # run all tests
pnpm test:watch    # watch mode
pnpm typecheck     # tsc --noEmit
```

## Deterministic Local Mode

Phase 2 uses `src/adapters/fixture-store.ts` as the integration adapter. It loads seeded approvals, runs, and evidence from an in-memory registry initialized from fixture data. Same inputs always produce same outputs.

## What Is Explicitly Out of Scope (Phase 2)

- PostgreSQL or other persistence
- OAuth / SSO
- HTTP server or React UI
- Live parent platform connection

## Phase Progression

| Phase | Local dev adds |
|-------|----------------|
| 1 | Schemas, fixture parse tests |
| 2 | Core service, fixture adapter, scenario tests |
| 5+ | HTTP adapter, optional CI eval baseline |
| 7 | React operator UI consuming `src/contracts` types |

## Environment Variables

None required for Phase 1–2. Future phases may add `GSOC_ADAPTER_URL` for integration testing.
