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
import { PVFleetExplorerHeader } from "./PVFleetExplorerHeader/pv-fleet-explorer-header";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export const FleetExplorer = () => {
  const { sites, loading, error, addSite } = useFleet();
  const [focusedSite, setFocusedSite] = useState<CleanSite | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addSiteError, setAddSiteError] = useState<string | null>(null);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PVFleetExplorerHeader
        loading={loading}
        error={error}
        sites={sites}
        mappableCount={mappableCount}
        missingCoordCount={missingCoordCount}
        onAddSite={handleAddSite}
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={32} />
          <Typography color="text.secondary">Loading fleet data…</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && !error && (
        <Box sx={{ flex: 1, position: "relative" }}>
          <MapView sites={sites} focusedSite={focusedSite} />
        </Box>
      )}
    </Box>
  );
};
