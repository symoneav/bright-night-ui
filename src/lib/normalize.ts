import { computeConfidence, computeFlags } from "@/lib/derived";
import type { CleanSite, RawCsvRow, SiteFormInput } from "@/types/site";

const MAX_SYSTEM_SIZE_KW = 10_000;
const COORD_SENTINEL = -9999;
const US_LAT_MIN = 24;
const US_LAT_MAX = 50;
const US_LNG_MIN = -125;
const US_LNG_MAX = -66;

function isSentinel(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "-1" || trimmed === "-1.0";
}

function parseNumber(value: string): number | null {
  if (isSentinel(value)) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseBoolean(value: string): boolean | null {
  if (isSentinel(value)) return null;
  const num = Number(value);
  if (num === 1) return true;
  if (num === 0) return false;
  return null;
}

function parseAzimuth(value: string): number | null {
  const num = parseNumber(value);
  if (num === null || num < 0 || num > 359) return null;
  return num;
}

function parseTilt(value: string): number | null {
  const num = parseNumber(value);
  if (num === null || num < 0 || num > 90) return null;
  return num;
}

function parseSystemSize(value: string): number | null {
  const num = parseNumber(value);
  if (num === null || num <= 0 || num > MAX_SYSTEM_SIZE_KW) return null;
  return num;
}

function parsePositiveInt(value: string): number | null {
  const num = parseNumber(value);
  if (num === null || num <= 0 || !Number.isInteger(num)) return null;
  return num;
}

function parseEfficiency(value: string): number | null {
  const num = parseNumber(value);
  if (num === null || num <= 0 || num > 1) return null;
  return num;
}

function parseInstallationDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || isSentinel(trimmed)) return null;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return null;

  return trimmed;
}

function parseCoordinates(
  latValue: string,
  lngValue: string,
): { lat: number; lng: number } | null {
  const lat = parseNumber(latValue);
  const lng = parseNumber(lngValue);

  if (
    lat === null ||
    lng === null ||
    lat === COORD_SENTINEL ||
    lng === COORD_SENTINEL ||
    lat < US_LAT_MIN ||
    lat > US_LAT_MAX ||
    lng < US_LNG_MIN ||
    lng > US_LNG_MAX
  ) {
    return null;
  }

  return { lat, lng };
}

export function normalizeSite(row: RawCsvRow): CleanSite {
  const base: Omit<CleanSite, "confidence" | "flags"> = {
    systemId: row.system_ID.trim(),
    state: row.state.trim(),
    zipCode: row.zip_code.trim(),
    systemSizeKw: parseSystemSize(row.system_size_DC),
    azimuthDeg: parseAzimuth(row.azimuth_1),
    tiltDeg: parseTilt(row.tilt_1),
    moduleQuantity: parsePositiveInt(row.module_quantity_1),
    efficiency: parseEfficiency(row.efficiency_1),
    tracking: parseBoolean(row.tracking),
    installationDate: parseInstallationDate(row.installation_date),
    thirdPartyOwned: parseBoolean(row.third_party_owned),
    groundMounted: parseBoolean(row.ground_mounted),
    coordinates: parseCoordinates(row.latitude, row.longitude),
  };

  return {
    ...base,
    confidence: computeConfidence(base),
    flags: computeFlags(base),
  };
}

export function normalizeFleet(rows: RawCsvRow[]): CleanSite[] {
  return rows.map(normalizeSite);
}

function booleanToCsv(value: boolean | null): string {
  if (value === null) return "-1";
  return value ? "1" : "0";
}

export function normalizeSiteFormInput(input: SiteFormInput): CleanSite {
  return normalizeSite({
    system_ID: input.systemId.trim(),
    state: input.state.trim(),
    zip_code: input.zipCode.trim(),
    system_size_DC: input.systemSizeKw.trim() || "-1",
    azimuth_1: input.azimuthDeg.trim() || "-1",
    tilt_1: input.tiltDeg.trim() || "-1",
    module_quantity_1: input.moduleQuantity.trim() || "-1",
    efficiency_1: input.efficiency.trim() || "-1",
    tracking: booleanToCsv(input.tracking),
    installation_date: input.installationDate.trim() || "-1",
    third_party_owned: booleanToCsv(input.thirdPartyOwned),
    ground_mounted: booleanToCsv(input.groundMounted),
    latitude: input.lat.trim(),
    longitude: input.lng.trim(),
  });
}
