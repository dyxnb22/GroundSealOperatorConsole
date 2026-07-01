import { useCallback, useEffect, useState } from "react";
import type { TenantContext, ApprovalQueueItem, ApprovalDetail } from "./api";
import {
  fetchQueue,
  fetchDetail,
  submitDecision,
  resubmitApproval,
} from "./api";
import {
  fetchRunTimeline,
  fetchEvidenceBundle,
  type RunTimeline,
  type EvidenceBundle,
} from "./api-evidence";

const DEFAULT_TENANT: TenantContext = {
  tenantId: "tenant-a",
  operatorId: "op-ui",
  role: "reviewer",
};

export function App() {
  const [tenant] = useState<TenantContext>(DEFAULT_TENANT);
  const [items, setItems] = useState<ApprovalQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApprovalDetail | null>(null);
  const [timeline, setTimeline] = useState<RunTimeline | null>(null);
  const [evidence, setEvidence] = useState<EvidenceBundle | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queue = await fetchQueue(tenant);
      setItems(queue);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  const loadDetail = useCallback(
    async (approvalId: string) => {
      setLoading(true);
      setError(null);
      try {
        const d = await fetchDetail(tenant.tenantId, approvalId, tenant.role);
        setDetail(d);
        setSelectedId(approvalId);

        const tl = await fetchRunTimeline(tenant.tenantId, d.runId);
        setTimeline(tl);

        if (d.evidenceBundleIds[0]) {
          const ev = await fetchEvidenceBundle(
            tenant.tenantId,
            d.evidenceBundleIds[0],
            tenant.role,
          );
          setEvidence(ev);
        } else {
          setEvidence(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load detail");
      } finally {
        setLoading(false);
      }
    },
    [tenant.tenantId],
  );

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  async function handleDecision(decision: "approve" | "reject" | "request_changes") {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      await submitDecision(tenant, selectedId, decision, reason || undefined);
      setReason("");
      await loadQueue();
      await loadDetail(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResubmit() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      await resubmitApproval({ ...tenant, role: "admin" }, selectedId);
      await loadQueue();
      await loadDetail(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resubmit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <header>
        <h1>GroundSeal Operator Console</h1>
        <p className="subtitle">
          Tenant: {tenant.tenantId} · Role: {tenant.role}
        </p>
      </header>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading…</div>}

      <div className="panels">
        <section className="panel queue">
          <h2>Approval Queue</h2>
          <button type="button" onClick={() => void loadQueue()}>
            Refresh
          </button>
          <ul>
            {items.map((item) => (
              <li key={item.approvalId}>
                <button
                  type="button"
                  className={selectedId === item.approvalId ? "selected" : ""}
                  onClick={() => void loadDetail(item.approvalId)}
                >
                  <strong>{item.subject}</strong>
                  <span className={`status status-${item.status}`}>{item.status}</span>
                  <span className="meta">{item.summary}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel detail">
          <h2>Review Detail</h2>
          {!detail ? (
            <p className="placeholder">Select an approval to review.</p>
          ) : (
            <>
              <dl>
                <dt>Subject</dt>
                <dd>{detail.subject}</dd>
                <dt>Status</dt>
                <dd>{detail.status}</dd>
                <dt>Requested action</dt>
                <dd>{detail.requestedAction}</dd>
                <dt>Run</dt>
                <dd>{detail.runId}</dd>
                <dt>Evidence bundles</dt>
                <dd>{detail.evidenceBundleIds.join(", ") || "none"}</dd>
              </dl>

              <h3>Run timeline</h3>
              {!timeline || timeline.events.length === 0 ? (
                <p className="placeholder">No trace events.</p>
              ) : (
                <ol className="timeline">
                  {timeline.events.map((e) => (
                    <li key={e.eventId}>
                      <time>{e.timestamp}</time>
                      <strong>{e.kind}</strong>
                      <span>{e.summary}</span>
                    </li>
                  ))}
                </ol>
              )}

              <h3>Evidence</h3>
              {!evidence ? (
                <p className="placeholder">No evidence bundle linked.</p>
              ) : (
                <div className="evidence">
                  <p>
                    <strong>{evidence.label}</strong> ({evidence.bundleId})
                  </p>
                  <ul>
                    {evidence.items.map((item) => (
                      <li key={item.itemId}>
                        <strong>{item.label}</strong> — {item.summary}
                        {item.redactedFields.length > 0 && (
                          <ul className="redacted">
                            {item.redactedFields.map((f) => (
                              <li key={f.path}>
                                {f.label}: {f.value}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h3>Redacted preview</h3>
              <ul className="redacted">
                {detail.redactedPreview.map((f) => (
                  <li key={f.path}>
                    <strong>{f.label}</strong>: {f.value}
                  </li>
                ))}
              </ul>

              {detail.status === "pending" && (
                <div className="actions">
                  <textarea
                    placeholder="Reason (required for reject / request changes)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                  <div className="buttons">
                    <button type="button" onClick={() => void handleDecision("approve")}>
                      Approve
                    </button>
                    <button type="button" onClick={() => void handleDecision("reject")}>
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDecision("request_changes")}
                    >
                      Request changes
                    </button>
                  </div>
                </div>
              )}

              {detail.status === "changes_requested" && (
                <div className="actions">
                  <button type="button" onClick={() => void handleResubmit()}>
                    Resubmit (platform)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
