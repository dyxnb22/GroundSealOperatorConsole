# Failure Taxonomy

Maps every `ErrorCode` to evaluation category, trigger, and fail mode. Implemented in [`src/policy/error-taxonomy.ts`](../src/policy/error-taxonomy.ts).

| ErrorCode | Category | Fail mode |
|-----------|----------|-----------|
| INVALID_QUERY | ContractValidation | closed |
| INVALID_TENANT_CONTEXT | ContractValidation | closed |
| TENANT_ACCESS_DENIED | TenantIsolation | closed |
| NOT_FOUND | NegativePath | closed |
| RUN_NOT_FOUND | NegativePath | closed |
| INVALID_STATE_TRANSITION | ApprovalStateMachine | closed |
| INVALID_DECISION | ContractValidation | closed |
| INSUFFICIENT_ROLE | TenantIsolation | closed |
| MALFORMED_TIMELINE | NegativePath | closed |
| INVALID_POLICY | RedactionSafety | closed |
| PAYLOAD_TOO_DEEP | RedactionSafety | closed |

Regression coverage: [`tests/negative/error-codes.test.ts`](../tests/negative/error-codes.test.ts).

## Failure Record Template

When investigating a new failure, capture:

```markdown
## Failure Record

- **Date**:
- **Bucket**: (SensitiveDataExposure | ContractDrift | ...)
- **Triggering input**:
- **Expected behavior**:
- **Observed behavior**:
- **Root cause hypothesis**:
- **Deterministic?**: yes / no
- **Guard added**: (test file + description)
```

Store records under `notes/failures/` when investigations occur; do not commit scratch notes unless promoted to canonical docs.
