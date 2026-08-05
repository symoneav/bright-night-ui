import type { CleanSite } from "@/types/site";

type DerivedInput = Omit<CleanSite, "confidence" | "flags">;

const CONFIDENCE_WEIGHTS = {
  coordinates: 25,
  systemSizeKw: 20,
  azimuthDeg: 15,
  tiltDeg: 15,
  installationDate: 15,
  tracking: 10,
} as const;

export function computeConfidence(site: DerivedInput): number {
  let score = 0;

  if (site.coordinates !== null) score += CONFIDENCE_WEIGHTS.coordinates;
  if (site.systemSizeKw !== null) score += CONFIDENCE_WEIGHTS.systemSizeKw;
  if (site.azimuthDeg !== null) score += CONFIDENCE_WEIGHTS.azimuthDeg;
  if (site.tiltDeg !== null) score += CONFIDENCE_WEIGHTS.tiltDeg;
  if (site.installationDate !== null)
    score += CONFIDENCE_WEIGHTS.installationDate;
  if (site.tracking !== null) score += CONFIDENCE_WEIGHTS.tracking;

  return score;
}

export function computeFlags(site: DerivedInput): string[] {
  const flags: string[] = [];

  if (site.coordinates === null) {
    flags.push("Missing coordinates — not shown on map");
  }

  if (site.azimuthDeg === null && site.tiltDeg === null) {
    flags.push("Missing orientation (azimuth/tilt)");
  }

  if (site.tracking === true) {
    flags.push("Tracking system — do not treat as fixed-tilt");
  }

  if (site.installationDate !== null) {
    const year = new Date(site.installationDate).getFullYear();
    if (year < 2005) {
      flags.push("Installed before 2005 — very old system");
    }
  }

  if (site.thirdPartyOwned === true) {
    flags.push("Third-party owned");
  }

  if (site.systemSizeKw === null) {
    flags.push("Implausible or missing system size");
  }

  if (site.installationDate === null) {
    flags.push("Future or missing install date");
  }

  return flags;
}
