# Failure Analysis Plan

## Purpose

This document defines how GroundSealOperatorConsole should study failures instead of merely routing around them.

## Failure Categories

Primary categories (product risk):

- sensitive data exposure
- UI-led contract drift
- operator confusion around approval state
- too much chrome, too little evidence clarity

Evaluation-aligned buckets (see [`evaluation-plan.md`](evaluation-plan.md)):

| Bucket | Example | Regression Test Required |
|--------|---------|--------------------------|
| SensitiveDataExposure | Email plaintext in RedactedView | `tests/policy/redaction.test.ts` |
| ContractDrift | Extra fields accepted on ApprovalDecision | `tests/contracts/*.test.ts` |
| ApprovalStateConfusion | Approve after already approved | `tests/core/approval-state-machine.test.ts` |
| EvidenceClarityGap | Decision without auditRef | `tests/scenarios/approval-flow.test.ts` |
| TenantBoundaryViolation | Tenant A reads Tenant B approval | `tests/scenarios/approval-flow.test.ts` |

## Required Failure Record

Each meaningful failure investigation should capture:
- the triggering input or condition
- the expected behavior
- the observed behavior
- the most likely root cause
- whether the issue is deterministic or intermittent
- what test or guard should prevent recurrence

## Review Cadence

- Review new failures before expanding scope.
- Promote repeated issues into explicit regression tests.
- Update docs when a failure changes the architecture or contract story.

## Anti-Patterns

- Closing failures with vague “needs more work” notes.
- Treating unexplained regressions as acceptable churn.
- Fixing symptoms while leaving contract ambiguity in place.
