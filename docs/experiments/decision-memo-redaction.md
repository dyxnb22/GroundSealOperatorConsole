# Decision Memo: Redaction Policy Selection

**Date**: Phase 8  
**Decision owner**: GroundSealOperatorConsole subsystem  
**Status**: Accepted

## Options compared

1. **default-pii** — balanced operator utility with layered actions (mask / omit / hash)
2. **strict-omit** — minimum disclosure; no partial visibility

## Evidence

From [`redaction-policy-comparison.md`](./redaction-policy-comparison.md) and `pnpm eval:experiment`:

| Criterion | default-pii | strict-omit |
|-----------|-------------|-------------|
| Leak-free on corpus | yes | yes |
| Operator utility | higher | lower |
| Visible sensitive surface | larger (masked) | smallest |
| Cross-run correlation | hash on apiKey | none |

## Tradeoffs

**default-pii wins when** operators must distinguish applicants or domains (e.g. `a***@example.com`) without seeing full PII.

**strict-omit wins when** role is read-only or regulatory context demands zero partial disclosure.

Neither policy alone optimizes both utility and minimum disclosure.

## Decision

Adopt **role-based policy resolution**:

| OperatorRole | Policy |
|--------------|--------|
| viewer | strict-omit |
| reviewer | default-pii |
| admin | default-pii |

Implemented in [`src/policy/policy-registry.ts`](../../src/policy/policy-registry.ts). HTTP detail endpoint accepts `?role=` query param; UI passes tenant role.

## Remaining uncertainty

- Per-tenant policy overrides not implemented
- Utility score is heuristic, not user-study validated
- Hash strength is correlation-only, not cryptographic

## Revisit triggers

- New sensitive field types (e.g. biometrics)
- Regulatory audit requiring proof of omit-vs-mask
- Operator confusion reports in Phase 9+ field feedback
