import { describe, expect, it } from "vitest";
import { normalizeSite } from "@/lib/normalize";
import type { RawCsvRow } from "@/types/site";

const messyRow: RawCsvRow = {
  system_ID: "SITE_99999",
  state: "CA",
  zip_code: "90210",
  system_size_DC: "-1",
  azimuth_1: "-1.0",
  tilt_1: "-1",
  module_quantity_1: "-1",
  efficiency_1: "-1.0",
  tracking: "-1.0",
  installation_date: "-1",
  third_party_owned: "0.0",
  ground_mounted: "1.0",
  latitude: "-9999",
  longitude: "-9999",
};

describe("normalizeSite", () => {
  it("converts sentinel values to null and computes derived confidence/flags", () => {
    const site = normalizeSite(messyRow);

    expect(site.systemSizeKw).toBeNull();
    expect(site.azimuthDeg).toBeNull();
    expect(site.tiltDeg).toBeNull();
    expect(site.tracking).toBeNull();
    expect(site.installationDate).toBeNull();
    expect(site.coordinates).toBeNull();
    expect(site.thirdPartyOwned).toBe(false);
    expect(site.groundMounted).toBe(true);
    expect(site.confidence).toBe(0);
    expect(site.flags).toEqual(
      expect.arrayContaining([
        "Missing coordinates — not shown on map",
        "Missing orientation (azimuth/tilt)",
        "Implausible or missing system size",
        "Future or missing install date",
      ]),
    );
  });

  it("computes full confidence for a clean row", () => {
    const site = normalizeSite({
      ...messyRow,
      system_size_DC: "5.5",
      azimuth_1: "180",
      tilt_1: "20",
      tracking: "0",
      installation_date: "2020-01-15",
      latitude: "34.05",
      longitude: "-118.25",
    });

    expect(site.confidence).toBe(100);
    expect(site.coordinates).toEqual({ lat: 34.05, lng: -118.25 });
    expect(site.flags).not.toContain("Missing coordinates — not shown on map");
    expect(site.flags).not.toContain("Missing orientation (azimuth/tilt)");
  });
});
