import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";
import { useMap } from "react-leaflet";
import { flyToLocation } from "@/utils/fly-to-location";

type RecenterButtonProps = {
  onRecenter: () => void;
};

 const RecenterButton = ({ onRecenter }: RecenterButtonProps) => {
  return (
    <IconButton
      aria-label="Recenter on your location"
      title="Recenter on your location"
      onClick={onRecenter}
      size="small"
      sx={{
        bgcolor: "background.paper",
        boxShadow: 1,
        border: 1,
        borderColor: "divider",
        "&:hover": { bgcolor: "background.paper" },
      }}
    >
      <SvgIcon fontSize="small">
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7" />
      </SvgIcon>
    </IconButton>
  );
}

type MapRecenterButtonProps = {
  center: [number, number];
  zoom: number;
};

export  const MapRecenterButton = ({ center, zoom }: MapRecenterButtonProps) => {
  const map = useMap();

  return (
    <Box
      sx={{
        position: "absolute",
        top: 96,
        left: 10,
        zIndex: 1000,
      }}
    >
      <RecenterButton
        onRecenter={() => flyToLocation(map, center, zoom)}
      />
    </Box>
  );
}
