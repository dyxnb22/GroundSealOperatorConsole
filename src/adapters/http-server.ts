import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { ApprovalStore } from "./store-interface.js";
import {
  parseApprovalQueueQuery,
  parseApprovalDecisionRequest,
  parseResubmitRequest,
  parseOperatorRole,
  assertPathBodyIdMatch,
} from "../core/validation.js";
import { toErrorResponse, isGsocError } from "../policy/error-taxonomy.js";
import { GsocError } from "../contracts/errors.js";

const MAX_BODY_BYTES = 1_048_576;

export interface HttpServerOptions {
  store: ApprovalStore;
  port?: number;
  host?: string;
}

export function createGsocHttpServer(options: HttpServerOptions) {
  const { store, port = 3100, host = "127.0.0.1" } = options;

  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res, store);
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  return {
    server,
    listen: () =>
      new Promise<{ port: number; host: string }>((resolve, reject) => {
        server.listen(port, host, () => resolve({ port, host }));
        server.on("error", reject);
      }),
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  store: ApprovalStore,
): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = req.method ?? "GET";
  const path = url.pathname;

  if (method === "GET" && path === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  if (method === "POST" && path === "/api/approvals/queue") {
    const body = await readBody(req);
    const query = parseApprovalQueueQuery(body);
    return sendJson(res, 200, store.getApprovalQueue(query));
  }

  const decisionMatch = path.match(/^\/api\/approvals\/([^/]+)\/decision$/);
  if (method === "POST" && decisionMatch) {
    const body = await readBody(req);
    const request = parseApprovalDecisionRequest(body);
    const pathId = decodeURIComponent(decisionMatch[1]!);
    assertPathBodyIdMatch(pathId, request.approvalId, "approvalId");
    return sendJson(res, 200, store.submitApprovalDecision(request));
  }

  const resubmitMatch = path.match(/^\/api\/approvals\/([^/]+)\/resubmit$/);
  if (method === "POST" && resubmitMatch) {
    const body = await readBody(req);
    const request = parseResubmitRequest(body);
    const pathId = decodeURIComponent(resubmitMatch[1]!);
    assertPathBodyIdMatch(pathId, request.approvalId, "approvalId");
    return sendJson(res, 200, store.resubmitApproval(request));
  }

  const approvalMatch = path.match(/^\/api\/approvals\/([^/]+)$/);
  if (method === "GET" && approvalMatch) {
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) {
      return sendJson(res, 400, {
        code: "INVALID_QUERY",
        message: "tenantId query param required",
      });
    }
    try {
      const role = parseOperatorRole(url.searchParams.get("role"));
      return sendJson(
        res,
        200,
        store.getApprovalDetail(tenantId, decodeURIComponent(approvalMatch[1]!), { role }),
      );
    } catch (error) {
      return sendError(res, 400, error);
    }
  }

  const runMatch = path.match(/^\/api\/runs\/([^/]+)\/timeline$/);
  if (method === "GET" && runMatch) {
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) {
      return sendJson(res, 400, {
        code: "INVALID_QUERY",
        message: "tenantId query param required",
      });
    }
    return sendJson(res, 200, store.getRunTimeline(tenantId, decodeURIComponent(runMatch[1]!)));
  }

  const evidenceMatch = path.match(/^\/api\/evidence\/([^/]+)$/);
  if (method === "GET" && evidenceMatch) {
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) {
      return sendJson(res, 400, {
        code: "INVALID_QUERY",
        message: "tenantId query param required",
      });
    }
    try {
      const role = parseOperatorRole(url.searchParams.get("role"));
      return sendJson(
        res,
        200,
        store.getEvidenceBundle(tenantId, decodeURIComponent(evidenceMatch[1]!), { role }),
      );
    } catch (error) {
      return sendError(res, 400, error);
    }
  }

  sendJson(res, 404, { code: "NOT_FOUND", message: "Route not found" });
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;

    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new GsocError("INVALID_QUERY", "Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new GsocError("INVALID_QUERY", "Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendError(res: ServerResponse, status: number, error: unknown): void {
  const payload = toErrorResponse(error);
  const httpStatus = isGsocError(error)
    ? error.code === "NOT_FOUND" || error.code === "RUN_NOT_FOUND"
      ? 404
      : error.code.startsWith("INVALID") ||
          error.code === "INSUFFICIENT_ROLE" ||
          error.code === "TENANT_ACCESS_DENIED" ||
          error.code === "STORE_LOAD_FAILED"
        ? 400
        : 422
    : status;
  sendJson(res, httpStatus, payload);
}
