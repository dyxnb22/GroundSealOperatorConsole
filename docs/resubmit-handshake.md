# Resubmit Handshake

Platform-initiated transition: `changes_requested → pending`.

## Contract

- Request: [`ResubmitApprovalRequest`](../src/contracts/resubmit.ts) — `tenantContext` + `approvalId`
- Response: `ResubmitApprovalResponse` — `status: pending`, `resubmittedAt`, `auditRef`

## HTTP

```
POST /api/approvals/:approvalId/resubmit
Content-Type: application/json

{
  "tenantContext": { "tenantId": "tenant-a", "operatorId": "platform", "role": "admin" },
  "approvalId": "apr-004"
}
```

## Assumptions

| Party | Responsibility |
|-------|----------------|
| Parent platform | Initiates resubmit after applicant addresses requested changes |
| GroundSealOperatorConsole | Validates state, records audit entry, returns updated status |
| Operator UI | May expose resubmit for admin/platform role only |

## Invariants

- Resubmit ONLY valid when current status is `changes_requested`
- `viewer` role cannot resubmit
- Resubmit appends audit log entry with action `resubmit`

## Out of scope

- Automatic notification to applicant
- Evidence bundle version bump on resubmit (platform adapter concern, Phase 5+)
