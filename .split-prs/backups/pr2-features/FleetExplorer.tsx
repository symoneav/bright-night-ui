"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useFleet } from "@/hooks/useFleet";
import {
  ADD_SITE_SUPPORT_MESSAGE,
  isAddSiteUserError,
} from "@/data/fleet";
import {
  resolveCompareSites,
  toggleCompareSelection,
} from "@/lib/compare-sites";
import type { CleanSite, SiteFormInput } from "@/types/site";
import { PVFleetExplorerHeader } from "./PVFleetExplorerHeader/pv-fleet-explorer-header";
import { SiteDetailDrawer } from "./SiteDetail";
import { SiteCompareChart } from "./SiteCompare";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export const FleetExplorer = () => {
  const { sites, loading, error, addSite } = useFleet();
  const [focusedSite, setFocusedSite] = useState<CleanSite | null>(null);
  const [selectedSite, setSelectedSite] = useState<CleanSite | null>(null);
  const [compareSiteIds, setCompareSiteIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addSiteError, setAddSiteError] = useState<string | null>(null);

  const mappableCount = sites.filter(
    (site) => site.coordinates !== null,
  ).length;
  const missingCoordCount = sites.length - mappableCount;

  const compareSites = useMemo(
    () => resolveCompareSites(sites, compareSiteIds),
    [sites, compareSiteIds],
  );

  const handleSiteSelect = useCallback((site: CleanSite) => {
    setSelectedSite(site);
  }, []);

  const handleToggleCompare = useCallback((siteId: string) => {
    setCompareSiteIds((current) => toggleCompareSelection(current, siteId));
  }, []);

  const handleRemoveFromCompare = useCallback((siteId: string) => {
    setCompareSiteIds((current) => current.filter((id) => id !== siteId));
  }, []);

  const handleAddSite = async (input: SiteFormInput) => {
    setAddSiteError(null);
    setSuccessMessage(null);

    try {
      const site = await addSite(input);
      setFocusedSite(site);
      setSelectedSite(site);
      setCompareSiteIds((current) => toggleCompareSelection(current, site.systemId));
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

      {!loading && !error && sites.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Alert severity="info">
            No sites in the fleet yet. Use Add Site to create the first entry.
          </Alert>
        </Box>
      )}

      {!loading && !error && sites.length > 0 && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
            <MapView
              sites={sites}
              focusedSite={focusedSite}
              onSiteSelect={handleSiteSelect}
            />
          </Box>

          <SiteCompareChart
            sites={compareSites}
            onRemoveSite={handleRemoveFromCompare}
          />
        </Box>
      )}

      <SiteDetailDrawer
        site={selectedSite}
        compareSiteIds={compareSiteIds}
        onClose={() => setSelectedSite(null)}
        onToggleCompare={handleToggleCompare}
      />
    </Box>
  );
};
