import { SiteDetailContent } from "@/components/SiteDetail";
import { CleanSite } from "@/types/site";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

export const NearbySiteMarkers = ({
  sites,
  excludeSystemId,
}: {
  sites: CleanSite[];
  excludeSystemId?: string;
}) => {
  const visibleSites = excludeSystemId
    ? sites.filter((site) => site.systemId !== excludeSystemId)
    : sites;

  if (visibleSites.length === 0) return null;

  const siteIcon = L.divIcon({
    className: "site-marker-icon",
    html: '<div class="site-marker-icon__dot"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  return (
    <MarkerClusterGroup chunkedLoading>
      {visibleSites.map((site) => (
        <Marker
          key={site.systemId}
          position={[site.coordinates!.lat, site.coordinates!.lng]}
          icon={siteIcon}
        >
          <Popup minWidth={240}>
            <SiteDetailContent site={site} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};
