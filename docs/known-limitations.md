# Known Limitations

After Phases 0–10. Optional future extensions listed at bottom.

## Resolved

- Negative-path ErrorCode coverage (12 codes)
- Eval baseline + CI ratchet (79 tests)
- HTTP adapter, file persistence, replay
- Operator UI with role-aware redaction, run timeline, and evidence viewer
- Comparative redaction experiment + role-based policy registry
- Opaque pagination cursors (legacy numeric offset still accepted)
- Evidence bundle load via `GET /api/evidence/:id` with redaction
- Platform bridge hooks for decision/resubmit sync (`PlatformBridgeStore`)

## Remaining limits

- **Auth not verified**: TenantContext is caller-supplied; no auth middleware on HTTP server
- **FileStore not multi-process safe**: Use platform DB adapter in production
- **Per-tenant policy overrides**: Role-based only; no tenant-specific registry
- **Live platform client**: `RecordingPlatformHooks` only; no production HTTP client
- **Redaction utility score**: Heuristic; not validated by user studies
- **Hash fields**: Correlation aid only; not cryptographic

## Optional future work

- Production platform adapter implementing live `PlatformSyncHooks`
- Auth middleware in front of HTTP server
- Per-tenant redaction policy overrides
- User study on operator utility vs strict omit
- IPC adapter alternative to HTTP
