const API_BASE = "";

export interface TenantContext {
  tenantId: string;
  operatorId?: string;
  role: "viewer" | "reviewer" | "admin";
}

export interface ApprovalQueueItem {
  approvalId: string;
  status: string;
  subject: string;
  runId: string;
  createdAt: string;
  summary: string;
}

export interface RedactedField {
  path: string;
  label: string;
  value: string;
}

export interface ApprovalDetail {
  approvalId: string;
  tenantId: string;
  status: string;
  subject: string;
  runId: string;
  evidenceBundleIds: string[];
  requestedAction: string;
  createdAt: string;
  updatedAt: string;
  redactedPreview: RedactedField[];
}

export async function fetchQueue(tenant: TenantContext): Promise<ApprovalQueueItem[]> {
  const res = await fetch(`${API_BASE}/api/approvals/queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantContext: tenant, status: "all", limit: 50 }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.items as ApprovalQueueItem[];
}

export async function fetchDetail(
  tenantId: string,
  approvalId: string,
): Promise<ApprovalDetail> {
  const res = await fetch(
    `${API_BASE}/api/approvals/${encodeURIComponent(approvalId)}?tenantId=${encodeURIComponent(tenantId)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<ApprovalDetail>;
}

export async function submitDecision(
  tenant: TenantContext,
  approvalId: string,
  decision: "approve" | "reject" | "request_changes",
  reason?: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/approvals/${encodeURIComponent(approvalId)}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantContext: tenant, approvalId, decision, reason }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function resubmitApproval(
  tenant: TenantContext,
  approvalId: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/approvals/${encodeURIComponent(approvalId)}/resubmit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantContext: tenant, approvalId }),
  });
  if (!res.ok) throw new Error(await res.text());
}
