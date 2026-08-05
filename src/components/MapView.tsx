import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
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
  focusedSite?: CleanSite | null;
};

export default function MapView({ sites, focusedSite = null }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

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
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
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
        center={US_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InitialLocationSync location={userLocation} zoom={USER_LOCATION_ZOOM} />
        {userLocation && (
          <MapRecenterButton center={userLocation} zoom={USER_LOCATION_ZOOM} />
        )}
        <CenterMarker position={userLocation} />
        <NearbySiteMarkers
          sites={nearbySites}
          excludeSystemId={focusedSite?.systemId}
        />
        {focusedSite?.coordinates && <FocusedSiteLayer site={focusedSite} />}
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
