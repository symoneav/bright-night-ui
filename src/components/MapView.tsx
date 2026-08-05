"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import type { CleanSite } from "@/types/site";

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

type MapViewProps = {
  sites: CleanSite[];
};

export default function MapView({ sites }: MapViewProps) {
  useEffect(() => {
    // Leaflet requires a sized container on mount
    window.dispatchEvent(new Event("resize"));
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
          {sites.filter((s) => s.coordinates).length.toLocaleString()} sites ready
          for map — markers in a later phase
        </Typography>
      </Box>
    </Box>
  );
}
