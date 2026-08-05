import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { flyToLocation } from "@/utils/fly-to-location";

type InitialLocationSyncProps = {
  location: [number, number] | null;
  zoom: number;
};

export function InitialLocationSync({
  location,
  zoom,
}: InitialLocationSyncProps) {
  const map = useMap();
  const didSync = useRef(false);

  useEffect(() => {
    if (!location || didSync.current) return;

    didSync.current = true;
    flyToLocation(map, location, zoom);
  }, [map, location, zoom]);

  return null;
}
