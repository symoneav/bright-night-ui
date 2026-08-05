"use client";

import type { Ref } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { CleanSite } from "@/types/site";
import { SiteDetailPopup } from "./site-detail-popup";

type SiteMapMarkerProps = {
  site: CleanSite;
  icon: L.DivIcon;
  onExpand: (site: CleanSite) => void;
  markerRef?: Ref<L.Marker>;
  onMarkerAdd?: (marker: L.Marker) => void;
};

export function SiteMapMarker({
  site,
  icon,
  onExpand,
  markerRef,
  onMarkerAdd,
}: SiteMapMarkerProps) {
  if (!site.coordinates) return null;

  return (
    <Marker
      ref={markerRef}
      position={[site.coordinates.lat, site.coordinates.lng]}
      icon={icon}
      eventHandlers={
        onMarkerAdd
          ? {
              add: (event) => {
                onMarkerAdd(event.target);
              },
            }
          : undefined
      }
    >
      <Popup minWidth={220} maxHeight={220}>
        <SiteDetailPopup site={site} onExpand={onExpand} />
      </Popup>
    </Marker>
  );
}
