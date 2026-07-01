import { z } from "zod";

export const ErrorCodeSchema = z.enum([
  "INVALID_QUERY",
  "INVALID_TENANT_CONTEXT",
  "TENANT_ACCESS_DENIED",
  "NOT_FOUND",
  "RUN_NOT_FOUND",
  "INVALID_STATE_TRANSITION",
  "INVALID_DECISION",
  "INSUFFICIENT_ROLE",
  "MALFORMED_TIMELINE",
  "INVALID_POLICY",
  "PAYLOAD_TOO_DEEP",
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorResponseSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export class GsocError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "GsocError";
    this.code = code;
    this.details = details;
  }

  toResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
