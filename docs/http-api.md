# HTTP API

Phase 5 integration surface. Deterministic local mode via Node `http` server.

## Start server

```bash
pnpm serve
# or with persistence:
GSOC_STORE_PATH=./data/store.json pnpm serve
```

Default: `http://127.0.0.1:3100`

## Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/health` | — | `{ status: "ok" }` |
| POST | `/api/approvals/queue` | ApprovalQueueQuery | ApprovalQueueResponse |
| GET | `/api/approvals/:id?tenantId=&role=` | — | ApprovalDetail (role selects redaction policy) |
| POST | `/api/approvals/:id/decision` | ApprovalDecisionRequest | ApprovalDecisionResponse |
| POST | `/api/approvals/:id/resubmit` | ResubmitApprovalRequest | ResubmitApprovalResponse |
| GET | `/api/runs/:runId/timeline?tenantId=` | — | RunTimeline |

## Error shape

```json
{
  "code": "INVALID_STATE_TRANSITION",
  "message": "Cannot transition from terminal status 'approved'",
  "details": {}
}
```

HTTP status: 400 for validation/role errors, 404 for NOT_FOUND, 422 for state/timeline errors.

## Boundary tests

[`tests/adapters/http-boundary.test.ts`](../tests/adapters/http-boundary.test.ts)

## UI proxy

The React dev server (`ui/`) proxies `/api` and `/health` to port 3100.
