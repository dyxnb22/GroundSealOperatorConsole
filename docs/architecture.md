# Architecture

## Purpose

This document defines the subsystem shape for GroundSealOperatorConsole, including trust
boundaries, main components, and integration seams.

## Core Responsibilities

- approval review UX, run timelines, trace visibility, evidence browsing, redaction-aware presentation, and tenant-safe operator flows
- Provide stable contracts that a larger workflow system can call into.
- Support deterministic local testing and narrow staged implementation.

## Conceptual Components

See [`docs/glossary.md`](glossary.md) for canonical terms. Layers map to public contracts in [`docs/contracts/`](contracts/README.md).

1. Contract layer
   Defines public types: ApprovalQueueQuery, ApprovalDetail, ApprovalDecision, RunTimeline, RedactedPresentation. Implemented in `src/contracts/`.
2. Policy and invariants layer
   RedactionPolicy, approval state transitions, tenant isolation. Implemented in `src/policy/`.
3. Execution layer
   Approval queue, detail, and decision handlers; state machine. Implemented in `src/core/`.
4. Evidence layer
   EvidenceBundle and EvidenceItem references; decision audit records. Consumed via adapter, surfaced in ApprovalDetail.
5. Integration adapter layer
   Thin boundary to parent platform; Phase 2 uses `src/adapters/fixture-store.ts` for deterministic local mode.

## Trust Boundaries

- External inputs are untrusted.
- Local configuration is constrained by subsystem invariants.
- Integration callers may request behavior but must not silently override contracts.
- Debug visibility must not weaken safety or redaction requirements.

## Architectural Preferences

- Typed schemas over ad-hoc dictionaries.
- Deterministic behavior over cleverness.
- Narrow public interfaces over deep cross-module imports.
- Explicit failure modes over silent fallback.

## Initial Build Strategy

Start with the thinnest slice that proves the subsystem contract, then add
richer storage, adapters, or UI only after baseline correctness and evaluation
scaffolding exist.
