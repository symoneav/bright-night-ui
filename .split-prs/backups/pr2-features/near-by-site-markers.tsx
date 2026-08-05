import { CleanSite } from "@/types/site";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

export const NearbySiteMarkers = ({
  sites,
  excludeSystemId,
  onSiteSelect,
}: {
  sites: CleanSite[];
  excludeSystemId?: string;
  onSiteSelect: (site: CleanSite) => void;
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
          eventHandlers={{
            click: () => onSiteSelect(site),
          }}
        />
      ))}
    </MarkerClusterGroup>
  );
};
