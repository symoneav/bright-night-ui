import { CleanSite } from "@/types/site";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

export const NearbySiteMarkers = ({ sites }: { sites: CleanSite[] }) => {
  if (sites.length === 0) return null;

  const siteIcon = L.divIcon({
    className: "site-marker-icon",
    html: '<div class="site-marker-icon__dot"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  return (
    <MarkerClusterGroup chunkedLoading>
      {sites.map((site) => (
        <Marker
          key={site.systemId}
          position={[site.coordinates!.lat, site.coordinates!.lng]}
          icon={siteIcon}
        >
          <Popup>
            <strong>{site.systemId}</strong>
            <br />
            {site.state} {site.zipCode}
            {site.systemSizeKw !== null && (
              <>
                <br />
                {site.systemSizeKw.toFixed(1)} kW
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};
