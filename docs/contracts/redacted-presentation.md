# Contract: RedactedPresentation

## Purpose

Transform a raw payload plus RedactionPolicy into an operator-safe RedactedView.

## RedactionPolicy

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| policyId | string | yes | |
| rules | RedactionRule[] | yes | |

### RedactionRule

| Field | Type | Notes |
|-------|------|-------|
| path | string | Dot-separated path |
| action | `mask` \| `omit` \| `hash` | |

## RedactedPresentationRequest

| Field | Type | Required |
|-------|------|----------|
| payload | record | yes |
| policy | RedactionPolicy | yes |

## RedactedPresentationResponse

| Field | Type | Required |
|-------|------|----------|
| fields | RedactedField[] | yes |
| omittedPaths | string[] | yes |
| policyId | string | yes |

### Redaction Actions

- **mask**: Replace value with `[REDACTED]` or partial mask for emails.
- **omit**: Field excluded from output; path listed in `omittedPaths`.
- **hash**: Replace with stable short hash prefix for correlation without disclosure.

## Untrusted Input Handling

- Payload treated as untrusted data container; only paths matching rules are extracted.
- Unknown policy actions → `INVALID_POLICY`.
- Cyclic or excessively nested payload → `PAYLOAD_TOO_DEEP` (max depth 10).

## Invariants

- Output MUST NOT contain literal values for paths with `omit` action.
- Masked paths MUST NOT equal original sensitive values in output.
- Policy is applied deterministically for identical inputs.

## Failure Response

| Code | When |
|------|------|
| INVALID_POLICY | Unknown action or empty rules |
| PAYLOAD_TOO_DEEP | Nesting exceeds limit |

## Example

See [fixtures/scenarios/redaction-pii.json](../../fixtures/scenarios/redaction-pii.json).
