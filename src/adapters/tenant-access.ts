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

export function parseCursorOffset(cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }
  const offset = Number.parseInt(cursor, 10);
  if (!Number.isFinite(offset) || offset < 0) {
    throw new GsocError("INVALID_QUERY", "Invalid pagination cursor");
  }
  return offset;
}

export function nextCursor(offset: number, limit: number, total: number): string | null {
  const next = offset + limit;
  return next < total ? String(next) : null;
}
