import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { SiteMapMarker } from "@/components/SiteDetail";
import { FOCUS_SITE_ZOOM } from "@/lib/constants";
import { focusedSiteMarkerIcon } from "@/lib/marker-icons";
import type { CleanSite } from "@/types/site";
import { flyToLocation } from "@/utils/fly-to-location";

type FocusedSiteLayerProps = {
  site: CleanSite;
};

export function FocusedSiteLayer({ site }: FocusedSiteLayerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!site.coordinates) return;

    const { lat, lng } = site.coordinates;
    flyToLocation(map, [lat, lng], FOCUS_SITE_ZOOM);

    const openTimer = window.setTimeout(() => {
      markerRef.current?.openPopup();
    }, 800);

    return () => window.clearTimeout(openTimer);
  }, [map, site]);

  return (
    <SiteMapMarker
      site={site}
      icon={focusedSiteMarkerIcon}
      markerRef={markerRef}
      onMarkerAdd={(marker) => marker.openPopup()}
    />
  );
}
