import type { DragEndEvent } from "leaflet";
import { Marker } from "react-leaflet";

type CenterMarkerProps = {
  position: [number, number] | null;
  onPositionChange?: (position: [number, number]) => void;
};

export const CenterMarker = ({
  position,
  onPositionChange,
}: CenterMarkerProps) => {
  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable={Boolean(onPositionChange)}
      eventHandlers={{
        dragend: (event: DragEndEvent) => {
          const { lat, lng } = event.target.getLatLng();
          onPositionChange?.([lat, lng]);
        },
      }}
    />
  );
};
