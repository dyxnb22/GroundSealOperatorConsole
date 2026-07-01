import type { ApprovalDecisionType, ApprovalStatus } from "../contracts/approval.js";
import { TERMINAL_STATUSES } from "../contracts/approval.js";
import { GsocError } from "../contracts/errors.js";

const TRANSITIONS: Record<
  ApprovalStatus,
  Partial<Record<ApprovalDecisionType, ApprovalStatus>>
> = {
  pending: {
    approve: "approved",
    reject: "rejected",
    request_changes: "changes_requested",
  },
  approved: {},
  rejected: {},
  changes_requested: {},
};

export function transitionApprovalStatus(
  current: ApprovalStatus,
  decision: ApprovalDecisionType,
): ApprovalStatus {
  if (TERMINAL_STATUSES.has(current)) {
    throw new GsocError(
      "INVALID_STATE_TRANSITION",
      `Cannot transition from terminal status '${current}'`,
    );
  }

  const next = TRANSITIONS[current][decision];
  if (!next) {
    throw new GsocError(
      "INVALID_STATE_TRANSITION",
      `Decision '${decision}' is not valid for status '${current}'`,
    );
  }

  return next;
}

export function transitionResubmitStatus(current: ApprovalStatus): ApprovalStatus {
  if (current !== "changes_requested") {
    throw new GsocError(
      "INVALID_STATE_TRANSITION",
      `Resubmit only valid from changes_requested, got '${current}'`,
    );
  }
  return "pending";
}

export function decisionToStatus(decision: ApprovalDecisionType): ApprovalStatus {
  switch (decision) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "request_changes":
      return "changes_requested";
  }
}
