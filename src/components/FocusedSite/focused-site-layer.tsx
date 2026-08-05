import { useEffect, useRef } from "react";
import L from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import { SiteDetailContent } from "@/components/SiteDetail";
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
};

export function FocusedSiteLayer({ site }: FocusedSiteLayerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!site.coordinates) return;

    const { lat, lng } = site.coordinates;
    flyToLocation(map, [lat, lng], FOCUS_ZOOM);

    const openTimer = window.setTimeout(() => {
      markerRef.current?.openPopup();
    }, 800);

    return () => window.clearTimeout(openTimer);
  }, [map, site]);

  if (!site.coordinates) return null;

  return (
    <Marker
      ref={markerRef}
      position={[site.coordinates.lat, site.coordinates.lng]}
      icon={focusedSiteIcon}
      eventHandlers={{
        add: (event) => {
          event.target.openPopup();
        },
      }}
    >
      <Popup minWidth={240}>
        <SiteDetailContent site={site} />
      </Popup>
    </Marker>
  );
}
