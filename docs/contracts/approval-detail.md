# Contract: ApprovalDetail

## Purpose

Return full review context for one approval: metadata, run reference, evidence bundle refs, and redacted field previews.

## ApprovalDetail

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| approvalId | string | yes | |
| tenantId | string | yes | Must match request tenant |
| status | ApprovalStatus | yes | |
| subject | string | yes | |
| runId | string | yes | Must resolve in adapter |
| evidenceBundleIds | string[] | yes | May be empty |
| requestedAction | string | yes | Human-readable action summary |
| createdAt | ISO8601 string | yes | |
| updatedAt | ISO8601 string | yes | |
| redactedPreview | RedactedField[] | yes | Safe preview fields only |

### RedactedField

| Field | Type | Notes |
|-------|------|-------|
| path | string | JSON path, e.g. `applicant.email` |
| label | string | Display label |
| value | string | Already redacted value |

## Untrusted Input Handling

- `approvalId` must be non-empty string; no path traversal patterns.
- TenantContext validated before lookup.

## Invariants

- `runId` MUST exist in the backing store for the same tenant.
- `redactedPreview` MUST be produced via RedactedPresentation policy, never raw platform payload.
- Cross-tenant `approvalId` lookup → `TENANT_ACCESS_DENIED` (do not leak existence).

## State Transitions

ApprovalDetail is read-only. Mutations go through ApprovalDecision.

## Failure Response

| Code | When |
|------|------|
| NOT_FOUND | Approval absent or wrong tenant |
| INVALID_TENANT_CONTEXT | Bad tenant context |
| TENANT_ACCESS_DENIED | Cross-tenant access |
| RUN_NOT_FOUND | runId missing for tenant |

## Example

See [fixtures/scenarios/approval-detail.json](../../fixtures/scenarios/approval-detail.json).
