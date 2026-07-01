# Evaluation Baseline

Phase 4 ratcheted evaluation path.

## Baseline file

[`evals/baseline.json`](../evals/baseline.json) captures:

- `testsPassed` — minimum count that must not regress
- `testsFailed` — must stay 0
- `contractPassRate` / `negativePathCorrectness` — 1.0 when healthy
- `evaluationCategories` — mapped from failure taxonomy

## Commands

```bash
pnpm test              # run all tests
pnpm eval:baseline     # regenerate baseline (after intentional test additions)
pnpm eval:ratchet      # fail if metrics regressed vs baseline
```

## Ratchet policy

From [`docs/evaluation-plan.md`](evaluation-plan.md):

- Baselines move only when the team explains why a new result is better
- Run `pnpm eval:baseline` after adding tests, then commit updated `evals/baseline.json`
- CI runs `pnpm eval:ratchet` on every push

## CI

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs typecheck, test, and eval ratchet.
