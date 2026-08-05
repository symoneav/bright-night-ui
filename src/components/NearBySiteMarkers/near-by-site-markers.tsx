import { SiteMapMarker } from "@/components/SiteDetail";
import { defaultSiteMarkerIcon } from "@/lib/marker-icons";
import { CleanSite } from "@/types/site";
import MarkerClusterGroup from "react-leaflet-cluster";

export const NearbySiteMarkers = ({
  sites,
  excludeSystemId,
}: {
  sites: CleanSite[];
  excludeSystemId?: string;
}) => {
  const visibleSites = (excludeSystemId
    ? sites.filter((site) => site.systemId !== excludeSystemId)
    : sites
  ).filter((site) => site.coordinates !== null);

  if (visibleSites.length === 0) return null;

  return (
    <MarkerClusterGroup chunkedLoading>
      {visibleSites.map((site) => (
        <SiteMapMarker
          key={site.systemId}
          site={site}
          icon={defaultSiteMarkerIcon}
        />
      ))}
    </MarkerClusterGroup>
  );
};
