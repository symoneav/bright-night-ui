import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/parse";

describe("parseCsv", () => {
  it("parses header rows into RawCsvRow objects", () => {
    const csv = [
      "system_ID,state,zip_code,system_size_DC,azimuth_1,tilt_1,module_quantity_1,efficiency_1,tracking,installation_date,third_party_owned,ground_mounted,latitude,longitude",
      "SITE_00001,CA,90210,5.5,180,20,12,0.19,0,2020-01-15,0,1,34.05,-118.25",
    ].join("\n");

    const rows = parseCsv(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0].system_ID).toBe("SITE_00001");
    expect(rows[0].state).toBe("CA");
    expect(rows[0].latitude).toBe("34.05");
  });

  it("skips empty lines", () => {
    const csv = [
      "system_ID,state,zip_code,system_size_DC,azimuth_1,tilt_1,module_quantity_1,efficiency_1,tracking,installation_date,third_party_owned,ground_mounted,latitude,longitude",
      "",
      "SITE_00002,TX,73301,-1,-1,-1,-1,-1,-1,-1,-1,-1,30.27,-97.74",
      "",
    ].join("\n");

    expect(parseCsv(csv)).toHaveLength(1);
  });

  it("throws when Papa reports parse errors", () => {
    const csv = 'system_ID,state\n"unclosed quote,CA';

    expect(() => parseCsv(csv)).toThrow(/CSV parse failed/);
  });
});
