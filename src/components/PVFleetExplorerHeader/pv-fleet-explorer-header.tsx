import type { CleanSite, SiteFormInput } from "@/types/site";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { AddSiteButton } from "../AddSiteButton/add-site-button";
import styles from "@/styles/pv-fleet-explorer-header.module.scss";

export type PVFleetExplorerHeaderProps = {
  loading: boolean;
  error: string | null;
  sites: CleanSite[];
  mappableCount: number;
  missingCoordCount: number;
  onAddSite: (input: SiteFormInput) => Promise<void>;
  onBulkAddSites: (inputs: SiteFormInput[]) => Promise<void>;
};

export const PVFleetExplorerHeader = ({
  loading,
  error,
  sites,
  mappableCount,
  missingCoordCount,
  onAddSite,
  onBulkAddSites,
}: PVFleetExplorerHeaderProps) => {
  return (
    <Box className={styles.header} component="header">
      <div>
        <Typography variant="h6" component="h1">
          PV Fleet Explorer
        </Typography>
        {!loading && !error && sites.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            className={styles.subtitle}
          >
            {sites.length.toLocaleString()} sites loaded (
            {mappableCount.toLocaleString()} on map
            {missingCoordCount > 0
              ? `, ${missingCoordCount.toLocaleString()} missing coordinates`
              : ""}
            )
          </Typography>
        )}
      </div>
      <AddSiteButton
        existingSystemIds={sites.map((site) => site.systemId)}
        onAddSite={onAddSite}
        onBulkAddSites={onBulkAddSites}
      />
    </Box>
  );
};
