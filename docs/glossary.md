# Glossary

Canonical vocabulary for GroundSealOperatorConsole. Use these terms consistently across docs, contracts, and code.

## Core Domain Terms

### Approval

A governance gate requiring human review before a workflow action proceeds. In code and contracts, **Approval** refers to the reviewable unit; **ApprovalRequest** is the inbound payload that creates or updates an approval record.

### ApprovalRequest

Typed input from the parent platform describing what needs review: subject, run reference, evidence references, and requested action summary. Untrusted until validated.

### ApprovalStatus

Lifecycle state of an approval: `pending`, `approved`, `rejected`, or `changes_requested`. Terminal states (`approved`, `rejected`) cannot transition further without a new approval cycle.

### ApprovalDecision

Operator action on a pending approval: `approve`, `reject`, or `request_changes`. Must include a non-empty reason for `reject` and `request_changes`.

### Run

A single agent or workflow execution instance. Identified by `runId`. GroundSealOperatorConsole reads run metadata and trace references; it does not execute runs.

### Trace

An ordered sequence of **TraceEvent** records describing steps taken during a run. Used for operator visibility, not unbounded debug dumps.

### TraceEvent

One step in a run timeline: timestamp, kind, summary, and a **payloadRef** (reference to stored payload, not raw sensitive content in the public contract).

### EvidenceBundle

A collection of **EvidenceItem** records supporting an approval decision. Bundles are referenced by ID; contents are loaded through the adapter layer.

### EvidenceItem

A single verifiable artifact (log excerpt, tool output reference, document snippet ref). May require redaction before presentation.

### RedactionPolicy

Rule set mapping field paths to redaction actions (`mask`, `omit`, `hash`). Applied before any operator-facing display.

### RedactedView

Output of applying a **RedactionPolicy** to a payload. Contains only fields safe for the requesting **OperatorRole** and **TenantContext**.

### TenantContext

Caller-provided tenant scope: `tenantId`, optional `operatorId`, and **OperatorRole**. All queries and mutations must carry tenant context; cross-tenant access is rejected.

### OperatorRole

Role determining visibility boundaries: `viewer`, `reviewer`, or `admin`. Does not override redaction policy; narrows what may be shown within policy limits.

## Architectural Layer Terms

| Layer | Maps to glossary |
|-------|------------------|
| Contract layer | Public types: ApprovalQueueQuery, ApprovalDetail, ApprovalDecision, RunTimeline, RedactedPresentation |
| Policy and invariants layer | RedactionPolicy, state transition rules, tenant isolation |
| Execution layer | Approval state machine, queue/detail/decision handlers |
| Evidence layer | EvidenceBundle, EvidenceItem, decision audit records |
| Integration adapter layer | Fixture store, future HTTP/IPC adapters |

## Trust Boundary Language

- **Untrusted input**: All caller payloads, including ApprovalRequest, ApprovalDecision, and TenantContext claims. Validated at contract boundaries.
- **Trusted after validation**: Parsed, normalized values that passed schema and invariant checks within the current request scope.
- **Never trusted for safety**: Raw trace payloads, evidence content, and operator-supplied free text beyond length/format checks. Redaction applies regardless of caller assertions.
- **Fail closed**: Ambiguous high-risk paths reject with structured errors rather than permissive defaults.

## Non-Goals (Terminology)

Do not use these patterns as subsystem responsibilities:

- **Backend rebuild**: GroundSealOperatorConsole consumes platform data; it does not replace workflow execution or storage.
- **Unbounded debug visibility**: Trace panels show structured events with refs, not full internal dumps.
- **Consumer-chat UI**: Operator flows are review-centric, not open-ended conversation.
