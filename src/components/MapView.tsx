import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import { filterSitesWithinRadius } from "@/lib/geo";
import {
  DEFAULT_MAP_ZOOM,
  NEARBY_RADIUS_MILES,
  US_MAP_CENTER,
  USER_LOCATION_ZOOM,
} from "@/lib/constants";
import type { CleanSite } from "@/types/site";
import { NearbySiteMarkers } from "./NearBySiteMarkers";
import { CenterMarker } from "./CenterMarker";
import { FocusedSiteLayer } from "./FocusedSite";
import { InitialLocationSync } from "@/utils/initial-location-sync";
import { MapRecenterButton } from "./RecenterButton";
import styles from "@/styles/map-view.module.scss";



// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type MapViewProps = {
  sites: CleanSite[];
  compareSites: CleanSite[];
  focusedSite?: CleanSite | null;
  onSiteExpand: (site: CleanSite) => void;
};

function FitBoundsToPolygon({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds);
  }, [map, positions]);
  return null;
}
export default function MapView({
  sites,
  focusedSite = null,
  onSiteExpand,
  compareSites,
}: MapViewProps) {
  const REGION_BOUNDS = compareSites.length > 0 ?
    compareSites.map((site) => [site.coordinates?.lat, site.coordinates?.lng]): null;
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [filterCenter, setFilterCenter] = useState<[number, number] | null>(
    null,
  );

  const nearbySites = useMemo(() => {
    const radiusSites = filterCenter
      ? filterSitesWithinRadius(
          sites,
          { lat: filterCenter[0], lng: filterCenter[1] },
          NEARBY_RADIUS_MILES,
        )
      : [];

    if (
      focusedSite?.coordinates &&
      !radiusSites.some((site) => site.systemId === focusedSite.systemId)
    ) {
      return [...radiusSites, focusedSite];
    }

    return radiusSites;
  }, [sites, filterCenter, focusedSite]);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(coords);
        setFilterCenter(coords);
      },
      () => {
        // Permission denied or unavailable — keep US fallback
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const handleRecenterToUser = () => {
    if (!userLocation) return;
    setFilterCenter(userLocation);
  };


  return (
    <Box className={styles.root}>
      <MapContainer
        center={US_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        className={styles.map}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InitialLocationSync location={userLocation} zoom={USER_LOCATION_ZOOM} />
        {userLocation && (
          <MapRecenterButton
            center={userLocation}
            zoom={USER_LOCATION_ZOOM}
            onRecenter={handleRecenterToUser}
          />
        )}
        <CenterMarker
          position={filterCenter}
          onPositionChange={setFilterCenter}
        />
        <NearbySiteMarkers
          sites={nearbySites}
          excludeSystemId={focusedSite?.systemId}
          onSiteExpand={onSiteExpand}
        
        />
        {focusedSite?.coordinates && (
          <FocusedSiteLayer site={focusedSite} onSiteExpand={onSiteExpand} />
        )}
        {REGION_BOUNDS && <Polygon positions={REGION_BOUNDS as LatLngExpression[]} pathOptions={{ color: "red" }} />}
        {REGION_BOUNDS && <FitBoundsToPolygon positions={REGION_BOUNDS as LatLngExpression[]} />}
      </MapContainer>
      <Box className={styles.statusOverlay}>
        <Typography variant="body2" color="text.secondary">
          {filterCenter
            ? `${nearbySites.length.toLocaleString()} sites within ${NEARBY_RADIUS_MILES} mi of pin`
            : "Allow location access to see nearby sites"}
        </Typography>
        {filterCenter && (
          <Typography variant="caption" color="text.secondary">
            Drag the pin to search another area
          </Typography>
        )}
      </Box>
    </Box>
  );
};
