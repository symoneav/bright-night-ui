"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useFleet } from "@/hooks/useFleet";
import {
  ADD_SITE_SUPPORT_MESSAGE,
  isAddSiteUserError,
} from "@/data/fleet";
import type { CleanSite, SiteFormInput } from "@/types/site";
import { SiteDetailDrawer } from "./SiteDetail/site-detail-drawer";
import { PVFleetExplorerHeader } from "./PVFleetExplorerHeader/pv-fleet-explorer-header";
import styles from "@/styles/fleet-explorer.module.scss";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export const FleetExplorer = () => {
  const { sites, loading, error, addSite, addSites } = useFleet();
  const [focusedSite, setFocusedSite] = useState<CleanSite | null>(null);
  const [selectedSite, setSelectedSite] = useState<CleanSite | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addSiteError, setAddSiteError] = useState<string | null>(null);

  const handleSiteExpand = (site: CleanSite) => {
    setSelectedSite(site);
  };

  const mappableCount = sites.filter(
    (site) => site.coordinates !== null,
  ).length;
  const missingCoordCount = sites.length - mappableCount;

  const handleAddSite = async (input: SiteFormInput) => {
    setAddSiteError(null);
    setSuccessMessage(null);

    try {
      const site = await addSite(input);
      setFocusedSite(site);
      setSuccessMessage(
        site.coordinates
          ? `Successfully added ${site.systemId}. Map centered on the new site.`
          : `Successfully added ${site.systemId}. Coordinates missing, so it was not placed on the map.`,
      );
    } catch (error) {
      if (isAddSiteUserError(error)) {
        throw error;
      }

      setAddSiteError(ADD_SITE_SUPPORT_MESSAGE);
      throw error;
    }
  };

  const handleBulkAddSites = async (inputs: SiteFormInput[]) => {
    setAddSiteError(null);
    setSuccessMessage(null);

    try {
      const addedSites = await addSites(inputs);
      setSuccessMessage(
        addedSites.length === 1
          ? `Successfully added ${addedSites[0].systemId}.`
          : `Successfully added ${addedSites.length.toLocaleString()} sites.`,
      );
    } catch (error) {
      if (isAddSiteUserError(error)) {
        throw error;
      }

      setAddSiteError(ADD_SITE_SUPPORT_MESSAGE);
      throw error;
    }
  };

  return (
    <Box className={styles.root}>
      <PVFleetExplorerHeader
        loading={loading}
        error={error}
        sites={sites}
        mappableCount={mappableCount}
        missingCoordCount={missingCoordCount}
        onAddSite={handleAddSite}
        onBulkAddSites={handleBulkAddSites}
      />

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {addSiteError && (
        <Alert severity="error" onClose={() => setAddSiteError(null)}>
          {addSiteError === ADD_SITE_SUPPORT_MESSAGE ? (
            <>
              Something went wrong while adding the site. Please contact{" "}
              <a href="mailto:engineer@brightnight.com">
                engineer@brightnight.com
              </a>{" "}
              for help.
            </>
          ) : (
            addSiteError
          )}
        </Alert>
      )}

      {loading && (
        <Box className={styles.loading}>
          <CircularProgress size={32} />
          <Typography color="text.secondary">Loading fleet data…</Typography>
        </Box>
      )}

      {error && (
        <Box className={styles.error}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && !error && (
        <Box className={styles.mapContainer}>
          <MapView
            sites={sites}
            focusedSite={focusedSite}
            onSiteExpand={handleSiteExpand}
          />
        </Box>
      )}

      <SiteDetailDrawer
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
      />
    </Box>
  );
};
