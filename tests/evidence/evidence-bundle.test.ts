import { describe, it, expect, beforeEach } from "vitest";
import {
  getEvidenceBundle,
  resetDefaultStore,
} from "../../src/core/approval-service.js";
import { GsocError } from "../../src/contracts/errors.js";

describe("Evidence bundle", () => {
  beforeEach(() => resetDefaultStore());

  it("returns redacted evidence items for tenant", () => {
    const bundle = getEvidenceBundle("tenant-a", "evb-001", { role: "reviewer" });
    expect(bundle.bundleId).toBe("evb-001");
    expect(bundle.items.length).toBe(2);
    expect(bundle.items[0]!.redactedFields.length).toBeGreaterThan(0);
  });

  it("viewer role yields fewer redacted fields than reviewer", () => {
    const reviewer = getEvidenceBundle("tenant-a", "evb-001", { role: "reviewer" });
    const viewer = getEvidenceBundle("tenant-a", "evb-001", { role: "viewer" });
    const reviewerFields = reviewer.items.reduce((n, i) => n + i.redactedFields.length, 0);
    const viewerFields = viewer.items.reduce((n, i) => n + i.redactedFields.length, 0);
    expect(viewerFields).toBeLessThanOrEqual(reviewerFields);
  });

  it("cross-tenant access denied", () => {
    expect(() => getEvidenceBundle("tenant-a", "evb-003")).toThrow(GsocError);
    try {
      getEvidenceBundle("tenant-a", "evb-003");
    } catch (e) {
      expect((e as GsocError).code).toBe("TENANT_ACCESS_DENIED");
    }
  });

  it("missing bundle not found", () => {
    expect(() => getEvidenceBundle("tenant-a", "evb-missing")).toThrow(GsocError);
  });
});
