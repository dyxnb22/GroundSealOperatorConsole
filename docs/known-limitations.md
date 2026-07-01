# Known Limitations

Scope boundaries after Phase 7. Update as phases progress.

## Resolved in Phases 3–7

- Negative-path regression suite with ErrorCode coverage (`tests/negative/`)
- Eval baseline ratchet (`evals/baseline.json`, CI)
- HTTP adapter for parent platform integration (`src/adapters/http-server.ts`)
- JSON file persistence and replay (`FileStore`, `src/core/replay.ts`)
- Minimal React operator UI (`ui/`)

## Remaining Runtime Limits

- **Auth not verified**: TenantContext is caller-supplied; no OAuth/SSO
- **Single-node file store**: FileStore is not safe for concurrent multi-process writes
- **Pagination simplified**: Cursor is offset-based, not opaque production token
- **Default redaction policy only**: Per-tenant policy selection not implemented
- **No evidence bundle loading**: Detail returns bundle IDs only

## Phase 8+ (Not started)

- Comparative policy experiments
- Case study and integration backfeed
- Production-grade cursor, auth integration, multi-tenant policy registry
