import { Marker } from "react-leaflet";

export const CenterMarker = ({
  position,
}: {
  position: [number, number] | null;
}) => {
  if (!position) return null;
  return <Marker position={position} />;
};
