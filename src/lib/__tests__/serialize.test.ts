/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { normalizeSite } from "@/lib/normalize";
import { cleanSiteToRawCsvRow, rawCsvRowToLine } from "@/lib/serialize";
import type { RawCsvRow } from "@/types/site";

describe("serialize", () => {
  it("round-trips a clean site to CSV columns", () => {
    const site = normalizeSite({
      system_ID: "SITE_99999",
      state: "CA",
      zip_code: "90210",
      system_size_DC: "5.5",
      azimuth_1: "180",
      tilt_1: "20",
      module_quantity_1: "12",
      efficiency_1: "0.19",
      tracking: "0",
      installation_date: "2020-01-15",
      third_party_owned: "1",
      ground_mounted: "0",
      latitude: "34.05",
      longitude: "-118.25",
    });

    const row = cleanSiteToRawCsvRow(site);
    expect(row.system_ID).toBe("SITE_99999");
    expect(row.latitude).toBe("34.05");
    expect(row.longitude).toBe("-118.25");

    const line = rawCsvRowToLine(row);
    expect(line).toContain("SITE_99999");
    expect(line).toContain("90210");
  });

  it("uses -9999 for missing coordinates", () => {
    const site = normalizeSite({
      system_ID: "SITE_99998",
      state: "CA",
      zip_code: "90210",
      system_size_DC: "-1",
      azimuth_1: "-1",
      tilt_1: "-1",
      module_quantity_1: "-1",
      efficiency_1: "-1",
      tracking: "-1",
      installation_date: "-1",
      third_party_owned: "-1",
      ground_mounted: "-1",
      latitude: "-9999",
      longitude: "-9999",
    } satisfies RawCsvRow);

    const row = cleanSiteToRawCsvRow(site);
    expect(row.latitude).toBe("-9999");
    expect(row.longitude).toBe("-9999");
  });
});
