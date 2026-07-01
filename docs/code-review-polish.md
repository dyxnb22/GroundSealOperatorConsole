# Code Review Polish (Post Phase 9)

Summary of hardening applied after full codebase review.

## Correctness

- **Pagination**: `cursor` offset now applied in `getApprovalQueue`; invalid cursor → `INVALID_QUERY`
- **Tenant isolation**: cross-tenant access throws `TENANT_ACCESS_DENIED` (not `NOT_FOUND`)
- **HTTP decision**: path/body `approvalId` must match (same as resubmit)
- **HTTP role param**: invalid role → 400 instead of silent reviewer escalation
- **FileStore**: Zod-validated snapshots; `STORE_LOAD_FAILED` on corrupt files; atomic write via temp + rename

## Architecture

- **Validation layer**: parsers moved to `src/core/validation.ts` (core no longer imports adapter for parsing)
- **Tenant helpers**: `src/adapters/tenant-access.ts` for shared isolation and pagination
- **Store schema**: `src/adapters/store-schema.ts` for snapshot validation
- **Service context**: `getApprovalDetail(tenantId, id, options?, ctx?)` avoids optional-store footgun

## Security

- Email mask now obscures domain (`a***@[domain].com`)
- HTTP request body capped at 1MB
- Deep clone of `rawPayload` on snapshot/restore

## Removed

- Dead `decisionToStatus` helper
- Parser duplication in `memory-store.ts`

## Tests added/updated

- `TENANT_ACCESS_DENIED`, pagination, invalid role, decision id mismatch, corrupt store, HTTP 404 mapping
