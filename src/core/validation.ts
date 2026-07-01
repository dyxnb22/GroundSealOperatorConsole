import {
  ApprovalQueueQuerySchema,
  ApprovalDecisionRequestSchema,
  type ApprovalQueueQuery,
  type ApprovalDecisionRequest,
} from "../contracts/approval.js";
import { ResubmitApprovalRequestSchema, type ResubmitApprovalRequest } from "../contracts/resubmit.js";
import { OperatorRoleSchema, type OperatorRole } from "../contracts/tenant.js";
import { GsocError } from "../contracts/errors.js";

export function parseApprovalQueueQuery(raw: unknown): ApprovalQueueQuery {
  const result = ApprovalQueueQuerySchema.safeParse(raw);
  if (!result.success) {
    const emptyTenant = result.error.issues.some(
      (i) =>
        i.path.join(".") === "tenantContext.tenantId" &&
        (i.code === "too_small" || i.code === "invalid_type"),
    );
    throw new GsocError(
      emptyTenant ? "INVALID_TENANT_CONTEXT" : "INVALID_QUERY",
      result.error.message,
    );
  }
  return result.data;
}

export function parseApprovalDecisionRequest(raw: unknown): ApprovalDecisionRequest {
  const result = ApprovalDecisionRequestSchema.safeParse(raw);
  if (!result.success) {
    const reasonIssue = result.error.issues.find((i) => i.path.join(".") === "reason");
    throw new GsocError(
      reasonIssue ? "INVALID_DECISION" : "INVALID_QUERY",
      result.error.message,
    );
  }
  return result.data;
}

export function parseResubmitRequest(raw: unknown): ResubmitApprovalRequest {
  const result = ResubmitApprovalRequestSchema.safeParse(raw);
  if (!result.success) {
    throw new GsocError("INVALID_QUERY", result.error.message);
  }
  return result.data;
}

export function parseOperatorRole(raw: string | null): OperatorRole {
  if (raw === null) {
    return "reviewer";
  }
  const result = OperatorRoleSchema.safeParse(raw);
  if (!result.success) {
    throw new GsocError("INVALID_QUERY", `Invalid role: ${raw}`);
  }
  return result.data;
}

export function assertPathBodyIdMatch(pathId: string, bodyId: string, field: string): void {
  if (pathId !== bodyId) {
    throw new GsocError("INVALID_QUERY", `${field} in path and body must match`);
  }
}
