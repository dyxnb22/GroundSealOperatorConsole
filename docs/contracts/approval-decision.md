# Contract: ApprovalDecision

## Purpose

Record an operator decision on a pending approval.

## ApprovalDecisionRequest

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| tenantContext | TenantContext | yes | |
| approvalId | string | yes | |
| decision | `approve` \| `reject` \| `request_changes` | yes | |
| reason | string | conditional | Required non-empty for reject and request_changes |

### Untrusted Input Handling

- Validate decision enum strictly.
- Trim `reason`; reject if empty when required.
- Reject decisions on terminal approvals → `INVALID_STATE_TRANSITION`.

## ApprovalDecisionResponse

| Field | Type | Required |
|-------|------|----------|
| approvalId | string | yes |
| status | ApprovalStatus | yes |
| decidedAt | ISO8601 string | yes |
| decidedBy | string | yes |
| auditRef | string | yes |

## State Transitions

```
pending → approved          (decision: approve)
pending → rejected          (decision: reject, reason required)
pending → changes_requested (decision: request_changes, reason required)
changes_requested → pending (external resubmit; not via this contract in Phase 2)
approved | rejected → (terminal, no further transitions)
```

## Invariants

- Only `reviewer` or `admin` roles may submit decisions.
- Duplicate decision on same approval → `INVALID_STATE_TRANSITION`.
- Decision MUST append an audit record (auditRef).

## Failure Response

| Code | When |
|------|------|
| NOT_FOUND | Approval not found |
| INVALID_STATE_TRANSITION | Terminal or invalid transition |
| INVALID_DECISION | Missing reason or bad enum |
| TENANT_ACCESS_DENIED | Cross-tenant |
| INSUFFICIENT_ROLE | viewer role |

## Example

See [fixtures/scenarios/approval-decision-approve.json](../../fixtures/scenarios/approval-decision-approve.json).
