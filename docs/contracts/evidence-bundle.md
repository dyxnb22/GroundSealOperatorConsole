# Contract: EvidenceBundle

## Purpose

Load verifiable evidence items linked from ApprovalDetail, with role-aware redaction applied per item.

## EvidenceBundle

| Field | Type | Required |
|-------|------|----------|
| bundleId | string | yes |
| tenantId | string | yes |
| label | string | yes |
| items | EvidenceItem[] | yes |

### EvidenceItem

| Field | Type | Notes |
|-------|------|-------|
| itemId | string | |
| kind | log_excerpt \| tool_output \| document_ref \| policy_check | |
| label | string | Display label |
| summary | string | Safe summary text |
| contentRef | string \| null | Reference to full content store |
| redactedFields | RedactedField[] | Policy-applied fields only |

## HTTP

```
GET /api/evidence/:bundleId?tenantId=&role=
```

## Invariants

- Raw item payloads never returned; only `redactedFields` from policy engine
- Cross-tenant access → `TENANT_ACCESS_DENIED`
- Missing bundle → `NOT_FOUND`

## Example

See seeded bundle `evb-001` in [`src/adapters/memory-store.ts`](../../src/adapters/memory-store.ts).
