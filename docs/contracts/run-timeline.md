# Contract: RunTimeline

## Purpose

Provide ordered trace events for operator review of a run linked to an approval.

## RunTimeline

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| runId | string | yes | |
| tenantId | string | yes | |
| events | TraceEvent[] | yes | Strictly ascending by timestamp |

### TraceEvent

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| eventId | string | yes | |
| timestamp | ISO8601 string | yes | |
| kind | string | yes | e.g. `tool_call`, `model_step`, `policy_check` |
| summary | string | yes | Redacted-safe summary |
| payloadRef | string \| null | no | Reference to full payload store |

## Untrusted Input Handling

- Lookup keyed by `(tenantId, runId)` only after tenant validation.
- Events array must be sorted; malformed order from store → `MALFORMED_TIMELINE`.

## Invariants

- Events MUST NOT embed raw sensitive payloads in the public contract.
- Timestamps MUST be non-decreasing; equal timestamps allowed.
- Empty events array is valid (run started, no steps yet).

## Failure Response

| Code | When |
|------|------|
| NOT_FOUND | Run not found for tenant |
| MALFORMED_TIMELINE | Events out of order |
| TENANT_ACCESS_DENIED | Cross-tenant |

## Example

See [fixtures/scenarios/run-timeline.json](../../fixtures/scenarios/run-timeline.json).
