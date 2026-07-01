# Contract: ApprovalQueueQuery / ApprovalQueueResponse

## Purpose

List approvals visible to an operator within a tenant, with optional status filter and cursor pagination.

## ApprovalQueueQuery

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| tenantContext | TenantContext | yes | Untrusted; validated and enforced |
| status | ApprovalStatus \| `all` | no | Default `pending` |
| limit | integer 1–100 | no | Default 20 |
| cursor | string | no | Opaque pagination token |

### Untrusted Input Handling

- Reject unknown fields (strict parsing).
- Normalize `limit` to default when missing; clamp to max 100.
- Invalid `status` enum → `INVALID_QUERY`.
- Missing or malformed `tenantContext` → `INVALID_TENANT_CONTEXT`.

### Invariants

- Response items MUST belong to `tenantContext.tenantId`.
- Items MUST NOT include raw sensitive payload fields; use refs and redacted summaries only.

## ApprovalQueueResponse

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| items | ApprovalQueueItem[] | yes | Ordered by `createdAt` desc |
| nextCursor | string \| null | yes | null when no more pages |

### ApprovalQueueItem

| Field | Type | Required |
|-------|------|----------|
| approvalId | string | yes |
| status | ApprovalStatus | yes |
| subject | string | yes |
| runId | string | yes |
| createdAt | ISO8601 string | yes |
| summary | string | yes |

## Failure Response

| Code | When |
|------|------|
| INVALID_QUERY | Malformed query fields |
| INVALID_TENANT_CONTEXT | Missing tenantId or invalid role |
| TENANT_ACCESS_DENIED | Operator cannot access tenant |

## Example

See [fixtures/scenarios/approval-queue-query.json](../../fixtures/scenarios/approval-queue-query.json).
