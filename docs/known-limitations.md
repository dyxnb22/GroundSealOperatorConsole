# Known Limitations

Honest scope boundaries for Phase 2. Update as phases progress.

## Runtime

- **No persistence**: Approval state lives in in-memory `FixtureStore`; restart resets data.
- **No concurrency guarantees**: FixtureStore is not safe for concurrent writes.
- **No HTTP server**: Core functions are library calls only; no REST/IPC adapter yet (Phase 5).
- **No authentication**: TenantContext is caller-supplied and validated for shape, not cryptographically verified.

## Features

- **No Web UI**: Operator views deferred to Phase 7.
- **No evidence bundle loading**: ApprovalDetail returns bundle IDs only; full EvidenceItem fetch not implemented.
- **No resubmit flow**: `changes_requested → pending` transition is platform-owned, not exposed in Phase 2 API.
- **Single default redaction policy**: `DEFAULT_PII_POLICY` only; per-tenant policy selection not implemented.
- **Pagination simplified**: Cursor is a numeric offset string; not production-grade opaque cursor.

## Testing

- All data is fixture-seeded; no live parent platform integration.
- Redaction leak detection covers fixture-defined sensitive values; not exhaustive for all PII patterns.

## Evaluation

- No CI baseline ratchet yet (Phase 4).
- Negative-path coverage is initial set from evaluation categories, not exhaustive adversarial suite (Phase 3).
