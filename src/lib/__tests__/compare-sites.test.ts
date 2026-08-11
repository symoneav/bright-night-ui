/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  buildComparisonChartData,
  canAddToComparison,
  MAX_COMPARE_SITES,
  resolveCompareSites,
  toggleCompareSelection,
} from "@/lib/compare-sites";
import type { CleanSite } from "@/types/site";

const siteA: CleanSite = {
  systemId: "SITE_A",
  state: "CA",
  zipCode: "90210",
  systemSizeKw: 5.5,
  azimuthDeg: 180,
  tiltDeg: 20,
  moduleQuantity: 12,
  efficiency: 0.19,
  tracking: false,
  installationDate: "2020-01-15",
  thirdPartyOwned: false,
  groundMounted: true,
  coordinates: { lat: 34.05, lng: -118.25 },
  confidence: 100,
  flags: [],
};

const siteB: CleanSite = {
  ...siteA,
  systemId: "SITE_B",
  systemSizeKw: null,
  azimuthDeg: null,
  confidence: 45,
};

describe("buildComparisonChartData", () => {
  it("includes estimated energy and carbon when inputs are complete", () => {
    const [rowA] = buildComparisonChartData([siteA]);

    expect(rowA.systemId).toBe("SITE_A");
    expect(rowA.annualEnergyKwh).toBeTypeOf("number");
    expect(rowA.carbonOffsetTons).toBeTypeOf("number");
    expect(rowA.azimuthDeg).toBe(180);
    expect(rowA.tiltDeg).toBe(20);
  });

  it("returns null energy and carbon when estimation inputs are missing", () => {
    const [rowB] = buildComparisonChartData([siteB]);

    expect(rowB).toEqual({
      systemId: "SITE_B",
      annualEnergyKwh: null,
      carbonOffsetTons: null,
      azimuthDeg: null,
      tiltDeg: 20,
    });
  });
});

describe("toggleCompareSelection", () => {
  it("adds a site when under the limit", () => {
    expect(toggleCompareSelection([], "SITE_A")).toEqual(["SITE_A"]);
  });

  it("removes a site when already selected", () => {
    expect(toggleCompareSelection(["SITE_A", "SITE_B"], "SITE_A")).toEqual([
      "SITE_B",
    ]);
  });

  it("does not exceed the max selection size", () => {
    const full = Array.from(
      { length: MAX_COMPARE_SITES },
      (_, index) => `SITE_${index}`,
    );

    expect(toggleCompareSelection(full, "SITE_NEW")).toEqual(full);
  });
});

describe("canAddToComparison", () => {
  it("allows toggling off an already selected site", () => {
    expect(canAddToComparison(["SITE_A"], "SITE_A")).toBe(true);
  });

  it("blocks adding when at capacity", () => {
    const full = Array.from(
      { length: MAX_COMPARE_SITES },
      (_, index) => `SITE_${index}`,
    );

    expect(canAddToComparison(full, "SITE_NEW")).toBe(false);
  });
});

describe("resolveCompareSites", () => {
  it("returns sites in selection order and drops unknown ids", () => {
    expect(
      resolveCompareSites([siteA, siteB], ["SITE_B", "UNKNOWN", "SITE_A"]),
    ).toEqual([siteB, siteA]);
  });
});
