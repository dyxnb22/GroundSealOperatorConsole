# Changelog

All notable changes to GroundSealOperatorConsole are documented here.

## [0.1.0] - 2026-07-01

Initial learning-subsystem release (Phases 0–10).

### Added

- Public contracts for approval queue, detail, decision, timeline, redacted presentation, and evidence bundles
- Deterministic approval state machine with tenant-scoped memory and file stores
- Redaction engine with role-based policy registry and comparative experiment
- HTTP integration adapter (`pnpm serve`) with 12 ErrorCodes and negative-path tests
- Minimal React operator UI: queue, detail, timeline, evidence viewer, decision actions
- Platform bridge store with sync hooks for parent platform integration
- Opaque pagination cursors for approval queue
- Eval baseline ratchet (79 tests) and CI gate

### Documentation

- Case study, integration backfeed, platform adapter guide, code-review polish notes
- Known limitations and optional follow-ups clearly separated from initial scope

### Out of scope (documented)

- Auth middleware, live platform HTTP client, per-tenant policy overrides, user studies
