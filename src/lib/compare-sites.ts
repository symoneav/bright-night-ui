import { estimateSiteEnergy } from "@/lib/energy-calculations";
import type { CleanSite } from "@/types/site";

export const MIN_COMPARE_SITES = 2;
export const MAX_COMPARE_SITES = 5;

export type ComparisonChartRow = {
  systemId: string;
  annualEnergyKwh: number | null;
  carbonOffsetTons: number | null;
  azimuthDeg: number | null;
  tiltDeg: number | null;
};

export function buildComparisonChartData(
  sites: CleanSite[],
): ComparisonChartRow[] {
  return sites.map((site) => {
    const { annualEnergyKwh, carbonOffsetTons } = estimateSiteEnergy(site);

    return {
      systemId: site.systemId,
      annualEnergyKwh,
      carbonOffsetTons,
      azimuthDeg: site.azimuthDeg,
      tiltDeg: site.tiltDeg,
    };
  });
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
