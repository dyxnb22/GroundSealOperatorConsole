import { GsocError, type ErrorCode } from "../contracts/errors.js";

/** Maps each ErrorCode to the evaluation category and typical trigger. */
export const ERROR_TAXONOMY: Record<
  ErrorCode,
  { category: string; trigger: string; failMode: "closed" }
> = {
  INVALID_QUERY: {
    category: "ContractValidation",
    trigger: "Malformed queue query payload",
    failMode: "closed",
  },
  INVALID_TENANT_CONTEXT: {
    category: "ContractValidation",
    trigger: "Missing or empty tenantId",
    failMode: "closed",
  },
  TENANT_ACCESS_DENIED: {
    category: "TenantIsolation",
    trigger: "Explicit cross-tenant denial (reserved for auth layer)",
    failMode: "closed",
  },
  NOT_FOUND: {
    category: "NegativePath",
    trigger: "Resource absent or wrong tenant scope",
    failMode: "closed",
  },
  RUN_NOT_FOUND: {
    category: "NegativePath",
    trigger: "Approval references missing run",
    failMode: "closed",
  },
  INVALID_STATE_TRANSITION: {
    category: "ApprovalStateMachine",
    trigger: "Decision or resubmit on invalid status",
    failMode: "closed",
  },
  INVALID_DECISION: {
    category: "ContractValidation",
    trigger: "Decision payload failed semantic validation",
    failMode: "closed",
  },
  INSUFFICIENT_ROLE: {
    category: "TenantIsolation",
    trigger: "Viewer role attempted mutation",
    failMode: "closed",
  },
  MALFORMED_TIMELINE: {
    category: "NegativePath",
    trigger: "Trace events out of timestamp order",
    failMode: "closed",
  },
  INVALID_POLICY: {
    category: "RedactionSafety",
    trigger: "Empty or unknown redaction policy",
    failMode: "closed",
  },
  PAYLOAD_TOO_DEEP: {
    category: "RedactionSafety",
    trigger: "Nested payload exceeds max depth",
    failMode: "closed",
  },
};

export function isGsocError(error: unknown): error is GsocError {
  return error instanceof GsocError;
}

export function toErrorResponse(error: unknown): {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
} {
  if (isGsocError(error)) {
    return error.toResponse();
  }
  return {
    code: "INVALID_QUERY",
    message: error instanceof Error ? error.message : "Unknown error",
  };
}
