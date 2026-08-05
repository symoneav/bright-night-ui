import type { CleanSite } from "@/types/site";

export const MIN_COMPARE_SITES = 2;
export const MAX_COMPARE_SITES = 5;

export type ComparisonChartRow = {
  systemId: string;
  systemSizeKw: number | null;
  azimuthDeg: number | null;
  tiltDeg: number | null;
  confidence: number;
};

export function buildComparisonChartData(
  sites: CleanSite[],
): ComparisonChartRow[] {
  return sites.map((site) => ({
    systemId: site.systemId,
    systemSizeKw: site.systemSizeKw,
    azimuthDeg: site.azimuthDeg,
    tiltDeg: site.tiltDeg,
    confidence: site.confidence,
  }));
}

export function toggleCompareSelection(
  selectedIds: readonly string[],
  siteId: string,
  max: number = MAX_COMPARE_SITES,
): string[] {
  if (selectedIds.includes(siteId)) {
    return selectedIds.filter((id) => id !== siteId);
  }

  if (selectedIds.length >= max) {
    return [...selectedIds];
  }

  return [...selectedIds, siteId];
}

export function canAddToComparison(
  selectedIds: readonly string[],
  siteId: string,
  max: number = MAX_COMPARE_SITES,
): boolean {
  return selectedIds.includes(siteId) || selectedIds.length < max;
}

export function resolveCompareSites(
  sites: CleanSite[],
  selectedIds: readonly string[],
): CleanSite[] {
  const byId = new Map(sites.map((site) => [site.systemId, site]));
  return selectedIds
    .map((id) => byId.get(id))
    .filter((site): site is CleanSite => site !== undefined);
}
