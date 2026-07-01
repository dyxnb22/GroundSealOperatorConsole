import { describe, it, expect } from "vitest";
import {
  encodeCursorOffset,
  parseCursorOffset,
  nextCursor,
} from "../../src/adapters/tenant-access.js";

describe("Opaque pagination cursor", () => {
  it("encodes and decodes offset", () => {
    const encoded = encodeCursorOffset(4);
    expect(encoded).not.toBe("4");
    expect(parseCursorOffset(encoded)).toBe(4);
  });

  it("supports legacy numeric cursor strings", () => {
    expect(parseCursorOffset("2")).toBe(2);
  });

  it("nextCursor returns opaque token", () => {
    const cursor = nextCursor(0, 2, 5);
    expect(cursor).toBeTruthy();
    expect(parseCursorOffset(cursor!)).toBe(2);
  });

  it("nextCursor returns null at end", () => {
    expect(nextCursor(4, 2, 5)).toBeNull();
  });
});
