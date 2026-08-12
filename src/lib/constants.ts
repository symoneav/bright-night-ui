export const MAX_SYSTEM_SIZE_KW = 10_000;
export const COORD_SENTINEL = -9999;
export const MIN_SITES_FOR_COMPARISON = 2;
export const MAX_SITES_FOR_COMPARISON = 5;

export const US_LAT_MIN = 24;
export const US_LAT_MAX = 50;
export const US_LNG_MIN = -125;
export const US_LNG_MAX = -66;

export const EARTH_RADIUS_MILES = 3958.8;

export const US_MAP_CENTER: [number, number] = [39.8283, -98.5795];
export const DEFAULT_MAP_ZOOM = 4;
export const USER_LOCATION_ZOOM = 10;
export const NEARBY_RADIUS_MILES = 100;
export const FOCUS_SITE_ZOOM = 12;

export function isWithinUsBounds(lat: number, lng: number): boolean {
  return (
    lat >= US_LAT_MIN &&
    lat <= US_LAT_MAX &&
    lng >= US_LNG_MIN &&
    lng <= US_LNG_MAX
  );
}
