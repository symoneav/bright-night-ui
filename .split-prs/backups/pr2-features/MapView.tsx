import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { filterSitesWithinRadius } from "@/lib/geo";
import type { CleanSite } from "@/types/site";
import { NearbySiteMarkers } from "./NearBySiteMarkers";
import { CenterMarker } from "./CenterMarker";
import { FocusedSiteLayer } from "./FocusedSite";
import { InitialLocationSync } from "@/utils/initial-location-sync";
import { MapRecenterButton } from "./RecenterButton";

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

const US_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;
const USER_ZOOM = 10;
const NEARBY_RADIUS_MILES = 100;

type MapViewProps = {
  sites: CleanSite[];
  focusedSite?: CleanSite | null;
  onSiteSelect: (site: CleanSite) => void;
};

export default function MapView({
  sites,
  focusedSite = null,
  onSiteSelect,
}: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationDenied, setLocationDenied] = useState(false);

  const nearbySites = useMemo(() => {
    const radiusSites = userLocation
      ? filterSitesWithinRadius(
          sites,
          { lat: userLocation[0], lng: userLocation[1] },
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
  }, [sites, userLocation, focusedSite]);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationDenied(false);
      },
      () => {
        setLocationDenied(true);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const showNoNearbySites =
    userLocation !== null && nearbySites.length === 0 && sites.length > 0;

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={US_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InitialLocationSync location={userLocation} zoom={USER_ZOOM} />
        {userLocation && (
          <MapRecenterButton center={userLocation} zoom={USER_ZOOM} />
        )}
        <CenterMarker position={userLocation} />
        <NearbySiteMarkers
          sites={nearbySites}
          excludeSystemId={focusedSite?.systemId}
          onSiteSelect={onSiteSelect}
        />
        {focusedSite?.coordinates && (
          <FocusedSiteLayer site={focusedSite} onSiteSelect={onSiteSelect} />
        )}
      </MapContainer>

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          zIndex: 1000,
          maxWidth: 360,
        }}
      >
        {!userLocation && !locationDenied && (
          <Alert severity="info" sx={{ boxShadow: 1 }}>
            Allow location access to see nearby sites.
          </Alert>
        )}

        {locationDenied && (
          <Alert severity="warning" sx={{ boxShadow: 1 }}>
            Location unavailable. Enable location to explore nearby sites, or
            add a site with coordinates to place it on the map.
          </Alert>
        )}

        {userLocation && (
          <Alert severity="info" sx={{ boxShadow: 1, mt: 1 }}>
            {nearbySites.length.toLocaleString()} sites within{" "}
            {NEARBY_RADIUS_MILES} mi. Click a marker to open site details.
          </Alert>
        )}

        {showNoNearbySites && (
          <Alert severity="warning" sx={{ boxShadow: 1, mt: 1 }}>
            No fleet sites within {NEARBY_RADIUS_MILES} mi of your location.
            Pan the map or add a new site nearby.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
