/**
 * @vitest-environment node
 */
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { appendSiteToCsv } from "@/lib/append-site";
import { parseCsv } from "@/lib/parse";
import { EMPTY_SITE_FORM_INPUT } from "@/types/site";

const CSV_HEADER =
  "system_ID,state,zip_code,system_size_DC,azimuth_1,tilt_1,module_quantity_1,efficiency_1,tracking,installation_date,third_party_owned,ground_mounted,latitude,longitude";

const existingRow =
  "SITE_00001,TX,75150,4.13,-1.0,-1.0,-1.0,-1.0,0.0,2012-06-16,-1.0,0.0,29.8061,-101.4213";

const validInput = {
  ...EMPTY_SITE_FORM_INPUT,
  systemId: "SITE_99999",
  state: "CA",
  zipCode: "90210",
  lat: "34.05",
  lng: "-118.25",
  systemSizeKw: "5.5",
  azimuthDeg: "180",
  tiltDeg: "20",
  moduleQuantity: "12",
  efficiency: "0.19",
  installationDate: "2020-01-15",
  tracking: false,
  thirdPartyOwned: true,
  groundMounted: false,
};

let tempDir: string | null = null;

async function createTempCsv(): Promise<string> {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "append-site-test-"));
  const csvPath = path.join(tempDir, "sites.csv");
  await writeFile(csvPath, `${CSV_HEADER}\n${existingRow}`, "utf-8");
  return csvPath;
}

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("appendSiteToCsv", () => {
  it("appends a row to the csv file", async () => {
    const csvPath = await createTempCsv();

    await appendSiteToCsv(validInput, ["SITE_00001"], csvPath);

    const rows = parseCsv(await readFile(csvPath, "utf-8"));
    expect(rows).toHaveLength(2);
    expect(rows[1]?.system_ID).toBe("SITE_99999");
  });

  it("does not write when validation fails", async () => {
    const csvPath = await createTempCsv();

    await expect(
      appendSiteToCsv(validInput, ["SITE_00001", "SITE_99999"], csvPath),
    ).rejects.toThrow("Validation failed");

    const rows = parseCsv(await readFile(csvPath, "utf-8"));
    expect(rows).toHaveLength(1);
  });
});
