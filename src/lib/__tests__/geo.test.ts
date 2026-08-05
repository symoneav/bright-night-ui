/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  filterSitesWithinRadius,
  haversineDistanceMiles,
} from "@/lib/geo";
import type { CleanSite } from "@/types/site";

function makeSite(
  systemId: string,
  lat: number | null,
  lng: number | null,
): CleanSite {
  return {
    systemId,
    state: "CA",
    zipCode: "90210",
    systemSizeKw: 5,
    azimuthDeg: 180,
    tiltDeg: 20,
    moduleQuantity: 10,
    efficiency: 0.19,
    tracking: false,
    installationDate: "2020-01-01",
    thirdPartyOwned: false,
    groundMounted: false,
    coordinates:
      lat !== null && lng !== null ? { lat, lng } : null,
    confidence: 100,
    flags: [],
  };
}

describe("haversineDistanceMiles", () => {
  it("returns ~0 for identical points", () => {
    const point = { lat: 34.05, lng: -118.25 };
    expect(haversineDistanceMiles(point, point)).toBeCloseTo(0, 5);
  });

  it("returns a plausible distance between LA and San Francisco", () => {
    const la = { lat: 34.05, lng: -118.25 };
    const sf = { lat: 37.77, lng: -122.42 };

    expect(haversineDistanceMiles(la, sf)).toBeGreaterThan(300);
    expect(haversineDistanceMiles(la, sf)).toBeLessThan(400);
  });
});

describe("filterSitesWithinRadius", () => {
  const origin = { lat: 34.05, lng: -118.25 };
  const nearby = makeSite("NEAR", 34.06, -118.26);
  const far = makeSite("FAR", 40.71, -74.01);
  const missingCoords = makeSite("MISSING", null, null);

  it("includes sites within the radius and excludes distant ones", () => {
    const results = filterSitesWithinRadius(
      [nearby, far, missingCoords],
      origin,
      100,
    );

    expect(results.map((site) => site.systemId)).toEqual(["NEAR"]);
  });

  it("omits sites without coordinates", () => {
    const results = filterSitesWithinRadius([missingCoords], origin, 1000);
    expect(results).toEqual([]);
  });
});
