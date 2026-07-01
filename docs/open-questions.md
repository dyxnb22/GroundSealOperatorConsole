# Open Questions

- Which parts of GroundSealOperatorConsole must be deterministic from day one, and which can be deferred?
- What is the smallest implementation slice that will still teach something real?
- Which failure modes deserve dedicated fixtures instead of informal notes?
- Where should integration boundaries stop to avoid subsystem creep?
- Which tradeoffs are likely to be architecture-defining rather than local?

## Resolved Defaults (Phase 0)

- **Stack**: TypeScript strict mode, Zod schemas, Vitest, pnpm
- **First journey**: Approval queue (list → detail → decision)
- **Phase 2 scope**: Contracts + state machine + redaction; UI deferred to Phase 7

## Questions That Should Be Answered Before Broad Implementation

- ~~what is the authoritative contract surface~~ → see [`docs/contracts/README.md`](contracts/README.md)
- ~~what inputs are untrusted and how they are normalized~~ → see contract docs and [`docs/glossary.md`](glossary.md)
- what evidence must always be preserved → auditRef on every decision (Phase 2)
- what counts as an acceptable fallback path → fail closed only; no silent defaults

## Questions Best Deferred Until After A Baseline Exists

- performance optimization tradeoffs
- richer UX or service wrappers
- storage or framework expansion beyond the minimum viable shape
