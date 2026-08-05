import { useEffect, useRef } from "react";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";
import type { CleanSite } from "@/types/site";
import { flyToLocation } from "@/utils/fly-to-location";

const FOCUS_ZOOM = 12;

const focusedSiteIcon = L.divIcon({
  className: "site-marker-icon",
  html: '<div class="site-marker-icon__dot site-marker-icon__dot--focused"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type FocusedSiteLayerProps = {
  site: CleanSite;
  onSiteSelect?: (site: CleanSite) => void;
};

export function FocusedSiteLayer({ site, onSiteSelect }: FocusedSiteLayerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!site.coordinates) return;

    const { lat, lng } = site.coordinates;
    flyToLocation(map, [lat, lng], FOCUS_ZOOM);
  }, [map, site]);

  if (!site.coordinates) return null;

  return (
    <Marker
      ref={markerRef}
      position={[site.coordinates.lat, site.coordinates.lng]}
      icon={focusedSiteIcon}
      eventHandlers={{
        click: () => onSiteSelect?.(site),
      }}
    />
  );
}
