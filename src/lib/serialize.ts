import Papa from "papaparse";
import type { CleanSite, RawCsvRow } from "@/types/site";

const CSV_COLUMNS: (keyof RawCsvRow)[] = [
  "system_ID",
  "state",
  "zip_code",
  "system_size_DC",
  "azimuth_1",
  "tilt_1",
  "module_quantity_1",
  "efficiency_1",
  "tracking",
  "installation_date",
  "third_party_owned",
  "ground_mounted",
  "latitude",
  "longitude",
];

function nullableNumberToCsv(value: number | null): string {
  if (value === null) return "-1";
  return String(value);
}

function booleanToCsv(value: boolean | null): string {
  if (value === null) return "-1";
  return value ? "1" : "0";
}

export function cleanSiteToRawCsvRow(site: CleanSite): RawCsvRow {
  return {
    system_ID: site.systemId,
    state: site.state,
    zip_code: site.zipCode,
    system_size_DC: nullableNumberToCsv(site.systemSizeKw),
    azimuth_1: nullableNumberToCsv(site.azimuthDeg),
    tilt_1: nullableNumberToCsv(site.tiltDeg),
    module_quantity_1: nullableNumberToCsv(site.moduleQuantity),
    efficiency_1: nullableNumberToCsv(site.efficiency),
    tracking: booleanToCsv(site.tracking),
    installation_date: site.installationDate ?? "-1",
    third_party_owned: booleanToCsv(site.thirdPartyOwned),
    ground_mounted: booleanToCsv(site.groundMounted),
    latitude: site.coordinates ? String(site.coordinates.lat) : "-9999",
    longitude: site.coordinates ? String(site.coordinates.lng) : "-9999",
  };
}

export function rawCsvRowToLine(row: RawCsvRow): string {
  return Papa.unparse([row], {
    header: false,
    columns: CSV_COLUMNS,
  });
}
