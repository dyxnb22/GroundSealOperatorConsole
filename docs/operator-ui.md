# Operator UI

Phase 7 minimal React operator console.

## Location

[`ui/`](../ui/) — Vite + React, consumes HTTP API from Phase 5.

## Features

- Approval queue list (all statuses, tenant-scoped)
- Detail panel with redacted preview fields
- Run timeline panel (trace events for linked run)
- Evidence bundle viewer (first linked bundle, role-aware redaction)
- Approve / reject / request changes for `pending` items
- Resubmit button for `changes_requested` items (admin role)

## Run locally

Terminal 1 — API:

```bash
pnpm serve
```

Terminal 2 — UI:

```bash
cd ui && pnpm install && pnpm dev
```

Open `http://localhost:5173`. Vite proxies API calls to port 3100.

## Design notes

- No consumer-chat patterns; review-centric layout
- Redacted preview only — raw payloads never rendered
- Tenant and role shown in header; defaults to `tenant-a` / `reviewer` for local dev

## Build

```bash
cd ui && pnpm build
```

Output: `ui/dist/` (static assets; requires API server separately).
