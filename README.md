# GroundSealOperatorConsole

An operator-facing console for approvals, timelines, evidence, and safety visibility

## Overview

GroundSealOperatorConsole is a long-horizon learning and engineering project focused on approval review UX, run timelines, trace visibility, evidence browsing, redaction-aware presentation, and tenant-safe operator flows.
It is intentionally scoped as a standalone subsystem so it can later plug back
into a governed enterprise-agent platform without inheriting that platform's
full codebase or accidental complexity on day one.

## Why This Exists

A governed agent platform needs an interface that helps humans review, approve, and understand system behavior without weakening the underlying controls. This project isolates that product surface.

## What This Project Is

- A subsystem-first engineering project with explicit contracts.
- A documentation-led project intended for sustained Cursor Cloud Agent work.
- A place to learn one difficult slice of enterprise agent systems deeply.
- A project that should produce reusable contracts, tests, and design notes.

## What This Project Is Not

- rebuilding the backend inside the frontend
- unbounded debug visibility
- consumer-chat UI patterns
- not a generic chatbot wrapper
- not a fast demo optimized for screenshots instead of understanding

## Core Capability Scope

- screen map
- frontend architecture
- API contract assumptions
- redaction display rules
- operator workflow scenarios

## Planned Interfaces

- `approval queue views`
- `run timeline and trace panels`
- `evidence bundle access patterns`
- `tenant- and role-aware navigation`

## Documentation Map

- `PROJECT_BRIEF.md` — project framing, goals, non-goals, and learning value.
- `AGENTS.md` — default execution rules for future agents.
- `TASKS.md` — prioritized task breakdown for now, next, and later.
- `docs/architecture.md` — subsystem map and trust boundaries.
- `docs/design-principles.md` — design rules and tradeoff posture.
- `docs/coding-guidelines.md` — implementation discipline once code starts.
- `docs/roadmap.md` — phased long-term execution plan.
- `docs/evaluation-plan.md` — how quality and regressions will be measured.
- `docs/failure-analysis-plan.md` — how failures are classified and reviewed.
- `docs/execution-rhythm.md` — how to keep long-running agent work disciplined.
- `docs/integration-contract.md` — how this project plugs into larger systems.
- [`docs/case-study.md`](docs/case-study.md) — Phase 9 build summary and lessons.
- [`docs/integration-backfeed.md`](docs/integration-backfeed.md) — platform integration recommendations.
- [`docs/experiments/redaction-policy-comparison.md`](docs/experiments/redaction-policy-comparison.md) — Phase 8 comparative experiment.
- `docs/open-questions.md` — unresolved research and implementation questions.

## Current Stage

**Phases 0–9 complete.** Subsystem includes contracts, core, HTTP adapter, persistence, operator UI, redaction experiment, case study, and platform backfeed recommendations.

See [`docs/case-study.md`](docs/case-study.md) and [`TASKS.md`](TASKS.md).

## Relationship To The Parent Platform

This project is intentionally narrower than the original platform. It should
become better than the parent implementation at its own specialty, then feed
stable contracts and lessons back into the broader system.
