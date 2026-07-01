import { describe, it, expect } from "vitest";
import { transitionApprovalStatus } from "../../src/core/approval-state-machine.js";
import { GsocError } from "../../src/contracts/errors.js";

describe("ApprovalStateMachine", () => {
  it("transitions pending to approved on approve", () => {
    expect(transitionApprovalStatus("pending", "approve")).toBe("approved");
  });

  it("transitions pending to rejected on reject", () => {
    expect(transitionApprovalStatus("pending", "reject")).toBe("rejected");
  });

  it("transitions pending to changes_requested on request_changes", () => {
    expect(transitionApprovalStatus("pending", "request_changes")).toBe(
      "changes_requested",
    );
  });

  it("rejects transition from approved (terminal)", () => {
    expect(() => transitionApprovalStatus("approved", "approve")).toThrow(GsocError);
    try {
      transitionApprovalStatus("approved", "approve");
    } catch (e) {
      expect((e as GsocError).code).toBe("INVALID_STATE_TRANSITION");
    }
  });

  it("rejects transition from rejected (terminal)", () => {
    expect(() => transitionApprovalStatus("rejected", "reject")).toThrow(GsocError);
  });

  it("rejects decision on changes_requested in Phase 2", () => {
    expect(() =>
      transitionApprovalStatus("changes_requested", "approve"),
    ).toThrow(GsocError);
  });
});
