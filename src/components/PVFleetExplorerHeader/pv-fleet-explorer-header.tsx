import { CleanSite } from "@/types/site";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { AddSiteButton } from "../AddSiteButton/add-site-button";
import styles from "./pv-fleet-explorer-header.module.scss";

export type PVFleetExplorerHeaderProps = {
  loading: boolean;
  error: string | null;
  sites: CleanSite[];
  mappableCount: number;
  missingCoordCount: number;
};

export const PVFleetExplorerHeader = ({
  loading,
  error,
  sites,
  mappableCount,
  missingCoordCount,
}: PVFleetExplorerHeaderProps) => {
  return (
    <Box
      className={styles.pvFleetExplorerHeader}
      component="header"
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <div>
        <Typography variant="h6" component="h1">
          PV Fleet Explorer
        </Typography>
        {!loading && !error && sites.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {sites.length.toLocaleString()} sites loaded (
            {mappableCount.toLocaleString()} on map
            {missingCoordCount > 0
              ? `, ${missingCoordCount.toLocaleString()} missing coordinates`
              : ""}
            )
          </Typography>
        )}
      </div>
      <AddSiteButton />
    </Box>
  );
};
