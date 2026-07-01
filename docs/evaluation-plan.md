# Evaluation Plan

## Purpose

Define how this project will be judged as it evolves.

## Evaluation Goals

- Verify contract correctness.
- Catch regressions early.
- Expose failure patterns instead of hiding them in aggregate scores.
- Produce evidence useful to reviewers and future maintainers.

## Evaluation Layers

1. Schema and contract validation.
2. Deterministic unit tests for core logic.
3. Fixture-based scenario tests.
4. Negative and adversarial tests.
5. Integration-boundary tests.

## Evaluation Case Categories

Each category maps to at least one test file in Phase 2+. Pass criteria are deterministic.

| Category | Example Scenario | Pass Standard | Test Mapping (Phase 2+) |
|----------|------------------|---------------|-------------------------|
| ContractValidation | Missing fields, wrong types in query/decision payloads | Structured reject with ErrorCode; no silent fallback | `tests/contracts/*.test.ts` |
| ApprovalStateMachine | Double decision, transition from terminal state | Fail closed with `INVALID_STATE_TRANSITION` | `tests/core/approval-state-machine.test.ts` |
| RedactionSafety | PII fields in payload | Zero plaintext leakage in RedactedView output | `tests/policy/redaction.test.ts` |
| TenantIsolation | Cross-tenant approvalId or runId access | Reject with `TENANT_ACCESS_DENIED`; no existence leak | `tests/scenarios/approval-flow.test.ts` |
| NegativePath | Malformed trace ordering, empty evidence refs | Observable error code; no partial unsafe response | `tests/scenarios/approval-flow.test.ts` |

## Failure Buckets

Failures discovered during evaluation or review are classified into buckets before fix:

| Bucket | Signal | Required Guard |
|--------|--------|----------------|
| SensitiveDataExposure | RedactedView contains raw email, token, or omitted path value | Redaction regression test |
| ContractDrift | Implementation accepts input docs reject | Schema strict-mode test |
| ApprovalStateConfusion | Terminal approval accepts new decision | State machine negative test |
| EvidenceClarityGap | Detail response missing auditRef or refs after decision | Scenario assertion |
| TenantBoundaryViolation | Resource returned under wrong tenantId | Tenant isolation test |

## Metrics To Track

- Contract pass rate.
- Negative-path correctness.
- Regression count.
- Explainability coverage.
- Unresolved known-risk count.

## Reporting Expectations

Every evaluation run should leave behind:
- what changed
- what was measured
- what regressed or improved
- what is still not covered

## Ratchet Policy

Baselines should move only when the team can explain why the new result is better or when a prior baseline was shown to be wrong.
