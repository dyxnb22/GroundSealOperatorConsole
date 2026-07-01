import { GsocError } from "../contracts/errors.js";

/** Fail closed on cross-tenant access without revealing resource existence. */
export function assertTenantMatch(
  resourceTenantId: string | undefined,
  requestTenantId: string,
  resourceLabel: string,
): void {
  if (resourceTenantId === undefined) {
    throw new GsocError("NOT_FOUND", `${resourceLabel} not found`);
  }
  if (resourceTenantId !== requestTenantId) {
    throw new GsocError("TENANT_ACCESS_DENIED", `${resourceLabel} not found`);
  }
}

interface CursorPayload {
  o: number;
}

function decodeOpaqueCursor(cursor: string): number {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as CursorPayload;
    if (typeof parsed.o !== "number" || !Number.isFinite(parsed.o) || parsed.o < 0) {
      throw new Error("invalid");
    }
    return parsed.o;
  } catch {
    throw new GsocError("INVALID_QUERY", "Invalid pagination cursor");
  }
}

export function encodeCursorOffset(offset: number): string {
  const payload: CursorPayload = { o: offset };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/** Accept opaque base64url cursor; legacy numeric string cursors still supported. */
export function parseCursorOffset(cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }
  if (/^\d+$/.test(cursor)) {
    return Number.parseInt(cursor, 10);
  }
  return decodeOpaqueCursor(cursor);
}

export function nextCursor(offset: number, limit: number, total: number): string | null {
  const next = offset + limit;
  return next < total ? encodeCursorOffset(next) : null;
}
