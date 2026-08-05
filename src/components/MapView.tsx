"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { filterSitesWithinRadius } from "@/lib/geo";
import type { CleanSite } from "@/types/site";
import { NearbySiteMarkers } from "./NearBySiteMarkers";
import { CenterMarker } from "./CenterMarker";

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

function RecenterMap({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}



export default function MapView({ sites }: MapViewProps) {
  const [center, setCenter] = useState<[number, number]>(US_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
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
        const location: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setCenter(location);
        setUserLocation(location);
        setZoom(USER_ZOOM);
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
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} zoom={zoom} />
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
