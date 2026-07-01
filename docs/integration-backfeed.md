# Integration Backfeed

Phase 9 recommendations for parent platform teams consuming GroundSealOperatorConsole.

## Stable integration surfaces

Use the HTTP adapter documented in [`http-api.md`](http-api.md):

| Operation | Endpoint |
|-----------|----------|
| List approvals | `POST /api/approvals/queue` |
| Review detail | `GET /api/approvals/:id?tenantId=&role=` |
| Submit decision | `POST /api/approvals/:id/decision` |
| Resubmit after changes | `POST /api/approvals/:id/resubmit` |
| Run timeline | `GET /api/runs/:runId/timeline?tenantId=` |

Platform-neutral contract types remain in [`contracts/`](contracts/README.md).

## Recommendations for parent platform

### 1. Enforce auth before calling console

GroundSealOperatorConsole validates `TenantContext` shape but does not verify identity. Parent platform MUST:

- Authenticate operator
- Map to tenant + role
- Pass verified `tenantContext` on every request

### 2. Own authoritative storage

Console `FileStore` is for local/dev durability. Production should:

- Persist approvals/runs/traces in platform DB
- Implement `ApprovalStore` adapter backed by platform APIs
- Treat console audit refs as supplementary to platform audit log

### 3. Adopt role-based redaction

From Phase 8 experiment ([`experiments/decision-memo-redaction.md`](experiments/decision-memo-redaction.md)):

- Pass operator role on detail requests
- Do not bypass console redaction by sending pre-redacted payloads that skip policy engine

### 4. Platform-initiated resubmit

When applicant addresses `changes_requested`, platform calls resubmit endpoint — do not mutate approval status directly in shared storage without audit entry.

### 5. Evidence bundles

Console returns bundle IDs in detail. Platform should provide separate evidence fetch API when full bundle UI is required.

## What GroundSealOperatorConsole teaches the platform

| Lesson | Platform action |
|--------|-----------------|
| Contract-first operator flows reduce UX/security drift | Publish shared types with console team |
| Fail-closed errors need machine-readable codes | Map `ErrorCode` to platform observability |
| Redaction policy is a product decision | Centralize policy registry or sync with console |
| Eval ratchet catches regressions | Run console tests in platform CI or consume as submodule |

## Resolved integration questions

| Question | Resolution |
|----------|------------|
| HTTP vs IPC | HTTP implemented (Phase 5); IPC optional future |
| Pagination cursor | Offset-based; production adapter should upgrade to opaque cursor |
| Resubmit ownership | Platform-initiated via `/resubmit` (Phase 3) |
| Redaction policy | Role-based registry (Phase 8) |

## Residual risks

| Risk | Mitigation |
|------|------------|
| Caller-supplied tenant context | Platform auth layer; never trust client-only claims |
| FileStore concurrency | Use platform DB adapter in production |
| Heuristic redaction utility score | User testing for operator workflows |
| No full evidence bundle UI | Phase 10+ or platform-native evidence viewer |
| Hash correlation not cryptographic | Do not use console hash as security token |

## Suggested adoption path

1. Run console locally with fixture store; validate operator journeys
2. Wire HTTP adapter to platform staging APIs via custom `ApprovalStore`
3. Enable CI ratchet (`pnpm eval:ratchet`) in platform pipeline
4. Roll out UI embedded or iframe-hosted against platform-authenticated API gateway
