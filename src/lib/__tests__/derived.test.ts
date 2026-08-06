/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { computeConfidence, computeFlags } from "@/lib/derived";
import type { CleanSite } from "@/types/site";

type DerivedInput = Omit<CleanSite, "confidence" | "flags">;

const emptySite: DerivedInput = {
  systemId: "SITE_00001",
  state: "CA",
  zipCode: "90210",
  systemSizeKw: null,
  azimuthDeg: null,
  tiltDeg: null,
  moduleQuantity: null,
  efficiency: null,
  tracking: null,
  installationDate: null,
  thirdPartyOwned: null,
  groundMounted: null,
  coordinates: null,
};

const fullSite: DerivedInput = {
  ...emptySite,
  systemSizeKw: 5.5,
  azimuthDeg: 180,
  tiltDeg: 20,
  tracking: false,
  installationDate: "2020-01-15",
  coordinates: { lat: 34.05, lng: -118.25 },
};

describe("computeConfidence", () => {
  it("returns 0 for a site with no scored fields", () => {
    expect(computeConfidence(emptySite)).toBe(0);
  });

  it("returns 100 for a fully populated site", () => {
    expect(computeConfidence(fullSite)).toBe(100);
  });

  it("adds partial weights for partially populated sites", () => {
    expect(
      computeConfidence({
        ...emptySite,
        coordinates: { lat: 34.05, lng: -118.25 },
        systemSizeKw: 5.5,
      }),
    ).toBe(45);
  });
});

describe("computeFlags", () => {
  it("flags missing coordinates", () => {
    expect(computeFlags(emptySite)).toContain(
      "Missing coordinates — not shown on map",
    );
  });

  it("flags missing orientation when azimuth and tilt are absent", () => {
    expect(computeFlags(emptySite)).toContain(
      "Missing orientation (azimuth/tilt)",
    );
  });

  it("flags tracking systems", () => {
    expect(computeFlags({ ...fullSite, tracking: true })).toContain(
      "Tracking system — do not treat as fixed-tilt",
    );
  });

  it("flags very old systems", () => {
    expect(
      computeFlags({ ...fullSite, installationDate: "2000-06-01" }),
    ).toContain("Installed before 2005 — very old system");
  });

  it("flags third-party owned sites", () => {
    expect(computeFlags({ ...fullSite, thirdPartyOwned: true })).toContain(
      "Third-party owned",
    );
  });

  it("flags missing system size", () => {
    expect(computeFlags(emptySite)).toContain(
      "Implausible or missing system size",
    );
  });

  it("flags missing install date", () => {
    expect(computeFlags(emptySite)).toContain("Missing install date");
  });

  it("does not flag orientation when only azimuth is present", () => {
    const flags = computeFlags({ ...emptySite, azimuthDeg: 180 });
    expect(flags).not.toContain("Missing orientation (azimuth/tilt)");
  });
});
