# TASKS.md

## Phases 0–9 — Complete

See [`docs/case-study.md`](docs/case-study.md) and git history.

## Phase 10 — Complete

- [x] EvidenceBundle contract and `getEvidenceBundle` ([`docs/contracts/evidence-bundle.md`](docs/contracts/evidence-bundle.md))
- [x] HTTP `GET /api/evidence/:bundleId`
- [x] UI evidence viewer + run timeline panel
- [x] PlatformBridgeStore + PlatformSyncHooks ([`docs/platform-adapter.md`](docs/platform-adapter.md))
- [x] Opaque pagination cursors (legacy numeric supported)

## Post-review polish — Complete

See [`docs/code-review-polish.md`](docs/code-review-polish.md).

## Optional follow-ups

- Live platform HTTP client implementation (replace RecordingPlatformHooks)
- Auth middleware in front of HTTP server
- Per-tenant redaction policy overrides
- User study on redaction utility heuristic

## Sequencing Rules

- Prefer docs -> contracts -> tests -> implementation.
- Run `pnpm eval:ratchet` before merging; update baseline when adding tests intentionally.
