/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  calculateAnnualCarbonOffset,
  canEstimateSiteEnergy,
  estimateSiteEnergy,
} from "@/lib/energy-calculations";
import type { CleanSite } from "@/types/site";

const completeSite: CleanSite = {
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

describe("canEstimateSiteEnergy", () => {
  it("returns true when size, coordinates, and orientation are present", () => {
    expect(canEstimateSiteEnergy(completeSite)).toBe(true);
  });

  it("returns false when orientation is missing", () => {
    expect(
      canEstimateSiteEnergy({ ...completeSite, azimuthDeg: null }),
    ).toBe(false);
  });
});

describe("estimateSiteEnergy", () => {
  it("returns energy and derived carbon for complete sites", () => {
    const result = estimateSiteEnergy(completeSite);

    expect(result.annualEnergyKwh).toBeTypeOf("number");
    expect(result.carbonOffsetTons).toBe(
      calculateAnnualCarbonOffset(result.annualEnergyKwh!),
    );
  });

  it("returns nulls when required inputs are missing", () => {
    expect(
      estimateSiteEnergy({ ...completeSite, systemSizeKw: null }),
    ).toEqual({
      annualEnergyKwh: null,
      carbonOffsetTons: null,
    });
  });
});
