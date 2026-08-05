import type { CleanSite } from "@/types/site";

const EARTH_RADIUS_MILES = 3958.8;

export type LatLng = {
  lat: number;
  lng: number;
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMiles(from: LatLng, to: LatLng): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

export function filterSitesWithinRadius(
  sites: CleanSite[],
  origin: LatLng,
  radiusMiles: number,
): CleanSite[] {
  return sites.filter((site) => {
    if (!site.coordinates) return false;

    return haversineDistanceMiles(origin, site.coordinates) <= radiusMiles;
  });
}
