import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createGsocHttpServer } from "../../src/adapters/http-server.js";
import { MemoryStore } from "../../src/adapters/memory-store.js";

describe("HTTP integration boundary", () => {
  let baseUrl: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const store = new MemoryStore();
    const app = createGsocHttpServer({ store, port: 0, host: "127.0.0.1" });
    await new Promise<void>((resolve) => {
      app.server.listen(0, "127.0.0.1", resolve);
    });
    const addr = app.server.address();
    const port = typeof addr === "object" && addr ? addr.port : 3100;
    baseUrl = `http://127.0.0.1:${port}`;
    close = app.close;
  });

  afterAll(async () => {
    await close();
  });

  async function post(path: string, body: unknown) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  }

  async function get(path: string) {
    const res = await fetch(`${baseUrl}${path}`);
    return { status: res.status, json: await res.json() };
  }

  it("GET /health returns ok", async () => {
    const { status, json } = await get("/health");
    expect(status).toBe(200);
    expect(json.status).toBe("ok");
  });

  it("POST /api/approvals/queue returns pending items", async () => {
    const { status, json } = await post("/api/approvals/queue", {
      tenantContext: { tenantId: "tenant-a", role: "reviewer" },
      status: "pending",
    });
    expect(status).toBe(200);
    expect(json.items.length).toBeGreaterThan(0);
  });

  it("GET /api/approvals/:id returns detail", async () => {
    const { status, json } = await get("/api/approvals/apr-001?tenantId=tenant-a");
    expect(status).toBe(200);
    expect(json.approvalId).toBe("apr-001");
    expect(json.redactedPreview).toBeDefined();
  });

  it("POST decision returns auditRef", async () => {
    const { status, json } = await post("/api/approvals/apr-001/decision", {
      tenantContext: { tenantId: "tenant-a", operatorId: "op-http", role: "reviewer" },
      approvalId: "apr-001",
      decision: "approve",
    });
    expect(status).toBe(200);
    expect(json.auditRef).toMatch(/^audit-/);
  });

  it("POST resubmit on apr-004 returns pending", async () => {
    const { status, json } = await post("/api/approvals/apr-004/resubmit", {
      tenantContext: { tenantId: "tenant-a", operatorId: "op-http", role: "admin" },
      approvalId: "apr-004",
    });
    expect(status).toBe(200);
    expect(json.status).toBe("pending");
  });

  it("returns 404 for unknown route", async () => {
    const { status } = await get("/api/unknown");
    expect(status).toBe(404);
  });

  it("returns 400 for invalid queue body", async () => {
    const { status, json } = await post("/api/approvals/queue", { bad: true });
    expect(status).toBe(400);
    expect(json.code).toBeDefined();
  });
});
