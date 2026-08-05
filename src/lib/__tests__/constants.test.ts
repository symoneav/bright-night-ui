/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { isWithinUsBounds, US_LAT_MAX, US_LAT_MIN } from "@/lib/constants";

describe("constants", () => {
  it("isWithinUsBounds accepts coordinates inside US limits", () => {
    expect(isWithinUsBounds(34.05, -118.25)).toBe(true);
  });

  it("isWithinUsBounds rejects coordinates outside US limits", () => {
    expect(isWithinUsBounds(US_LAT_MIN - 1, -118.25)).toBe(false);
    expect(isWithinUsBounds(US_LAT_MAX + 1, -118.25)).toBe(false);
  });
});
