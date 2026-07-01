import type { TenantContext, RedactedField } from "./api";

const API_BASE = "";

export interface TraceEvent {
  eventId: string;
  timestamp: string;
  kind: string;
  summary: string;
  payloadRef?: string | null;
}

export interface RunTimeline {
  runId: string;
  tenantId: string;
  events: TraceEvent[];
}

export interface EvidenceItem {
  itemId: string;
  kind: string;
  label: string;
  summary: string;
  contentRef?: string | null;
  redactedFields: RedactedField[];
}

export interface EvidenceBundle {
  bundleId: string;
  tenantId: string;
  label: string;
  items: EvidenceItem[];
}

export async function fetchRunTimeline(
  tenantId: string,
  runId: string,
): Promise<RunTimeline> {
  const res = await fetch(
    `${API_BASE}/api/runs/${encodeURIComponent(runId)}/timeline?tenantId=${encodeURIComponent(tenantId)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<RunTimeline>;
}

export async function fetchEvidenceBundle(
  tenantId: string,
  bundleId: string,
  role: TenantContext["role"] = "reviewer",
): Promise<EvidenceBundle> {
  const res = await fetch(
    `${API_BASE}/api/evidence/${encodeURIComponent(bundleId)}?tenantId=${encodeURIComponent(tenantId)}&role=${encodeURIComponent(role)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<EvidenceBundle>;
}
