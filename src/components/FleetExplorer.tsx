"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useFleet } from "@/hooks/useFleet";
import { normalizeSiteFormInput } from "@/lib/normalize";
import type { CleanSite, SiteFormInput } from "@/types/site";
import { PVFleetExplorerHeader } from "./PVFleetExplorerHeader/pv-fleet-explorer-header";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function FleetExplorer() {
  const { sites, loading, error, addSite } = useFleet();
  const [focusedSite, setFocusedSite] = useState<CleanSite | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mappableCount = sites.filter(
    (site) => site.coordinates !== null,
  ).length;
  const missingCoordCount = sites.length - mappableCount;

  const handleAddSite = (input: SiteFormInput) => {
    const site = normalizeSiteFormInput(input);
    addSite(site);
    setFocusedSite(site);
    setSuccessMessage(
      site.coordinates
        ? `Successfully added ${site.systemId}. Map centered on the new site.`
        : `Successfully added ${site.systemId}. Coordinates missing, so it was not placed on the map.`,
    );
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
}
