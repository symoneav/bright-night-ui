import L from "leaflet";

export const defaultSiteMarkerIcon = L.divIcon({
  className: "site-marker-icon",
  html: '<div class="site-marker-icon__dot"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export const focusedSiteMarkerIcon = L.divIcon({
  className: "site-marker-icon",
  html: '<div class="site-marker-icon__dot site-marker-icon__dot--focused"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
