const MAX_DEPTH = 10;

export function getValueAtPath(payload: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = payload;

  for (const part of parts) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

export function assertPayloadDepth(payload: unknown, depth = 0): void {
  if (depth > MAX_DEPTH) {
    throw new GsocError("PAYLOAD_TOO_DEEP", `Payload nesting exceeds ${MAX_DEPTH}`);
  }

  if (payload !== null && typeof payload === "object") {
    if (Array.isArray(payload)) {
      for (const item of payload) {
        assertPayloadDepth(item, depth + 1);
      }
    } else {
      for (const value of Object.values(payload as Record<string, unknown>)) {
        assertPayloadDepth(value, depth + 1);
      }
    }
  }
}

function maskValue(value: unknown): string {
  if (typeof value === "string") {
    if (value.includes("@")) {
      const parts = value.split("@");
      const local = parts[0] ?? "";
      const domain = parts[1] ?? "";
      const maskedLocal =
        local.length <= 1 ? "*" : `${local[0]}${"*".repeat(Math.min(local.length - 1, 3))}`;
      return `${maskedLocal}@${domain}`;
    }
    return "[REDACTED]";
  }
  return "[REDACTED]";
}

function hashValue(value: unknown): string {
  const str = String(value);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return `#${hash.toString(16).slice(0, 8)}`;
}

function pathToLabel(path: string): string {
  const last = path.split(".").pop() ?? path;
  return last.charAt(0).toUpperCase() + last.slice(1);
}

import type {
  RedactedPresentationRequest,
  RedactedPresentationResponse,
  RedactionPolicy,
} from "../contracts/redaction.js";
import { GsocError } from "../contracts/errors.js";

export function buildRedactedView(
  request: RedactedPresentationRequest,
): RedactedPresentationResponse {
  assertPayloadDepth(request.payload);
  validatePolicy(request.policy);

  const fields: RedactedPresentationResponse["fields"] = [];
  const omittedPaths: string[] = [];

  for (const rule of request.policy.rules) {
    const raw = getValueAtPath(request.payload, rule.path);
    if (raw === undefined) {
      continue;
    }

    switch (rule.action) {
      case "omit":
        omittedPaths.push(rule.path);
        break;
      case "mask":
        fields.push({
          path: rule.path,
          label: pathToLabel(rule.path),
          value: maskValue(raw),
        });
        break;
      case "hash":
        fields.push({
          path: rule.path,
          label: pathToLabel(rule.path),
          value: hashValue(raw),
        });
        break;
    }
  }

  return {
    fields,
    omittedPaths,
    policyId: request.policy.policyId,
  };
}

function validatePolicy(policy: RedactionPolicy): void {
  if (policy.rules.length === 0) {
    throw new GsocError("INVALID_POLICY", "Redaction policy must have at least one rule");
  }

  for (const rule of policy.rules) {
    if (!["mask", "omit", "hash"].includes(rule.action)) {
      throw new GsocError("INVALID_POLICY", `Unknown redaction action: ${rule.action}`);
    }
  }
}

export function assertNoPlaintextLeak(
  response: RedactedPresentationResponse,
  sensitiveValues: string[],
): void {
  const output = JSON.stringify(response);
  for (const value of sensitiveValues) {
    if (value.length > 0 && output.includes(value)) {
      throw new Error(`Sensitive value leaked in redacted output: ${value}`);
    }
  }

  for (const omitted of response.omittedPaths) {
    for (const field of response.fields) {
      if (field.path === omitted) {
        throw new Error(`Omitted path ${omitted} present in fields output`);
      }
    }
  }
}
