# Experiment: Redaction Policy Comparison

Phase 8 comparative experiment. Hypothesis, observation, and conclusion are evidence-backed via deterministic corpus evaluation.

## Purpose

Compare two redaction policies for operator approval review:

| Policy | ID | Strategy |
|--------|-----|----------|
| **A** | `default-pii` | Mask email/phone, omit SSN/token, hash API key |
| **B** | `strict-omit` | Omit all sensitive paths |

## Corpus

[`fixtures/experiments/redaction-corpus.json`](../../fixtures/experiments/redaction-corpus.json) — 3 entries covering PII, minimal applicant, credentials-only payloads.

## Metrics (per policy)

| Metric | Meaning |
|--------|---------|
| `visibleFieldCount` | Fields shown to operator |
| `omittedFieldCount` | Paths fully hidden |
| `correlationFieldCount` | Hash fields (cross-run correlation without disclosure) |
| `partialMaskCount` | Partially masked values (e.g. email domain visible) |
| `leakCount` | Plaintext sensitive value in output (must be 0) |
| `operatorUtilityScore` | Heuristic: partial mask = 1, full mask = 0.5 |

## How to reproduce

```bash
pnpm eval:experiment    # writes evals/experiments/redaction-comparison.json
pnpm test tests/evals/redaction-comparison.test.ts
```

Implementation: [`src/evals/redaction-comparison.ts`](../../src/evals/redaction-comparison.ts)

## Observed results (representative)

On the fixed corpus:

- **Both policies**: `leakCount = 0` (fail-closed redaction holds)
- **default-pii**: higher `operatorUtilityScore`, more `visibleFieldCount`, includes hash correlation for API keys
- **strict-omit**: lower `visibleFieldCount`, zero partial masks, maximum disclosure minimization

## Controls

- Same corpus and engine (`buildRedactedView`) for both policies
- Leak detection via `assertNoPlaintextLeak` with known sensitive values
- No live data; deterministic fixtures only

## Conclusion pointer

See [`decision-memo-redaction.md`](./decision-memo-redaction.md) for the chosen approach.
