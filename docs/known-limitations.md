# Known Limitations

After Phases 0–9. Optional future extensions listed at bottom.

## Resolved

- Negative-path ErrorCode coverage
- Eval baseline + CI ratchet
- HTTP adapter, file persistence, replay
- Operator UI with role-aware redaction
- Comparative redaction experiment + role-based policy registry

## Remaining limits

- **Auth not verified**: TenantContext is caller-supplied
- **FileStore not multi-process safe**: Use platform DB adapter in production
- **Offset pagination only**: Not production opaque cursor
- **Per-tenant policy overrides**: Role-based only; no tenant-specific registry
- **Evidence bundles**: IDs only; no full bundle viewer
- **Redaction utility score**: Heuristic; not validated by user studies
- **Hash fields**: Correlation aid only; not cryptographic

## Optional future work (post Phase 9)

- Production platform adapter implementing `ApprovalStore`
- Full evidence bundle browser
- User study on operator utility vs strict omit
- Opaque pagination and auth middleware
- IPC adapter alternative to HTTP
