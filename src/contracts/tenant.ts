import { z } from "zod";
import { GsocError } from "./errors.js";

export const OperatorRoleSchema = z.enum(["viewer", "reviewer", "admin"]);

export type OperatorRole = z.infer<typeof OperatorRoleSchema>;

export const TenantContextSchema = z
  .object({
    tenantId: z.string().min(1),
    operatorId: z.string().min(1).optional(),
    role: OperatorRoleSchema,
  })
  .strict();

export type TenantContext = z.infer<typeof TenantContextSchema>;

export function assertCanDecide(role: OperatorRole): void {
  if (role === "viewer") {
    throw new GsocError("INSUFFICIENT_ROLE", "Viewer role cannot submit approval decisions");
  }
}
