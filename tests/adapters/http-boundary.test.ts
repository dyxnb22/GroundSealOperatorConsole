import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createGsocHttpServer } from "../../src/adapters/http-server.js";
import { MemoryStore } from "../../src/adapters/memory-store.js";
import { GsocError } from "../../src/contracts/errors.js";

describe("HTTP integration boundary", () => {
  let baseUrl: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const app = createGsocHttpServer({ store: new MemoryStore(), port: 0, host: "127.0.0.1" });
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
    const { status, json } = await get("/api/approvals/apr-001?tenantId=tenant-a&role=reviewer");
    expect(status).toBe(200);
    expect(json.approvalId).toBe("apr-001");
    expect(json.redactedPreview).toBeDefined();
  });

  it("GET detail rejects invalid role with 400", async () => {
    const { status, json } = await get("/api/approvals/apr-001?tenantId=tenant-a&role=superuser");
    expect(status).toBe(400);
    expect(json.code).toBe("INVALID_QUERY");
  });

  it("GET detail cross-tenant returns TENANT_ACCESS_DENIED", async () => {
    const { status, json } = await get("/api/approvals/apr-003?tenantId=tenant-a");
    expect(status).toBe(400);
    expect(json.code).toBe("TENANT_ACCESS_DENIED");
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

  it("POST decision rejects path/body id mismatch", async () => {
    const { status, json } = await post("/api/approvals/apr-001/decision", {
      tenantContext: { tenantId: "tenant-a", operatorId: "op-http", role: "reviewer" },
      approvalId: "apr-999",
      decision: "approve",
    });
    expect(status).toBe(400);
    expect(json.code).toBe("INVALID_QUERY");
  });

  it("POST resubmit on apr-004 returns pending", async () => {
    const { status, json } = await post("/api/approvals/apr-004/resubmit", {
      tenantContext: { tenantId: "tenant-a", operatorId: "op-http", role: "admin" },
      approvalId: "apr-004",
    });
    expect(status).toBe(200);
    expect(json.status).toBe("pending");
  });

  it("GET evidence bundle returns items", async () => {
    const { status, json } = await get("/api/evidence/evb-001?tenantId=tenant-a&role=reviewer");
    expect(status).toBe(200);
    expect(json.bundleId).toBe("evb-001");
    expect(json.items.length).toBeGreaterThan(0);
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

  it("returns 400 for invalid JSON body", async () => {
    const res = await fetch(`${baseUrl}/api/approvals/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json",
    });
    expect(res.status).toBe(400);
  });
});

describe("HTTP error status mapping", () => {
  it("maps NOT_FOUND to 404", async () => {
    const store = {
      getApprovalDetail: () => {
        throw new GsocError("NOT_FOUND", "missing");
      },
    } as unknown as MemoryStore;
    const app = createGsocHttpServer({ store, port: 0 });
    await new Promise<void>((resolve) => app.server.listen(0, "127.0.0.1", resolve));
    const addr = app.server.address();
    const port = typeof addr === "object" && addr ? addr.port : 3100;
    const res = await fetch(`http://127.0.0.1:${port}/api/approvals/x?tenantId=tenant-a`);
    expect(res.status).toBe(404);
    await app.close();
  });
});
