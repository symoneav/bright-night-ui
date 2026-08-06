/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  isFutureIsoDateOnly,
  normalizeIsoDateOnly,
  parseIsoDateOnly,
} from "@/lib/date-only";

describe("parseIsoDateOnly", () => {
  it("parses YYYY-MM-DD as a local calendar date", () => {
    const parsed = parseIsoDateOnly("2026-08-05");

    expect(parsed?.iso).toBe("2026-08-05");
    expect(parsed?.date.getFullYear()).toBe(2026);
    expect(parsed?.date.getMonth()).toBe(7);
    expect(parsed?.date.getDate()).toBe(5);
  });

  it("rejects invalid calendar dates", () => {
    expect(parseIsoDateOnly("2026-02-30")).toBeNull();
    expect(parseIsoDateOnly("not-a-date")).toBeNull();
  });
});

describe("isFutureIsoDateOnly", () => {
  it("treats today as not future", () => {
    const now = new Date(2026, 7, 5, 15, 30, 0);

    expect(isFutureIsoDateOnly("2026-08-05", now)).toBe(false);
    expect(normalizeIsoDateOnly("2026-08-05")).toBe("2026-08-05");
  });

  it("treats tomorrow as future without grace", () => {
    const now = new Date(2026, 7, 5, 15, 30, 0);

    expect(isFutureIsoDateOnly("2026-08-06", now)).toBe(true);
  });

  it("allows tomorrow with one-day grace", () => {
    const now = new Date(2026, 7, 5, 15, 30, 0);

    expect(
      isFutureIsoDateOnly("2026-08-06", now, { graceDays: 1 }),
    ).toBe(false);
  });
});
