import type { Map } from "leaflet";

const FLY_DURATION_SEC = 0.75;

export function flyToLocation(
  map: Map,
  center: [number, number],
  zoom: number,
): void {
  map.flyTo(center, zoom, { duration: FLY_DURATION_SEC });
}
