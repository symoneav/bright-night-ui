import type { Ref } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { CleanSite } from "@/types/site";
import { SiteDetailContent } from "./site-detail-content";

type SiteMapMarkerProps = {
  site: CleanSite;
  icon: L.DivIcon;
  markerRef?: Ref<L.Marker>;
  onMarkerAdd?: (marker: L.Marker) => void;
};

export function SiteMapMarker({
  site,
  icon,
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
      <Popup minWidth={240}>
        <SiteDetailContent site={site} />
      </Popup>
    </Marker>
  );
}
