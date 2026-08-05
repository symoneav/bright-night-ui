import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { filterSitesWithinRadius } from "@/lib/geo";
import type { CleanSite } from "@/types/site";
import { NearbySiteMarkers } from "./NearBySiteMarkers";
import { CenterMarker } from "./CenterMarker";
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
};

export default function MapView({ sites }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  const nearbySites = useMemo(() => {
    if (!userLocation) return [];

    return filterSitesWithinRadius(
      sites,
      { lat: userLocation[0], lng: userLocation[1] },
      NEARBY_RADIUS_MILES,
    );
  }, [sites, userLocation]);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      () => {
        // Permission denied or unavailable — keep US fallback
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

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
        <NearbySiteMarkers sites={nearbySites} />
      </MapContainer>
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          zIndex: 1000,
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {userLocation
            ? `${nearbySites.length.toLocaleString()} sites within ${NEARBY_RADIUS_MILES} mi`
            : "Allow location access to see nearby sites"}
        </Typography>
      </Box>
    </Box>
  );
}
