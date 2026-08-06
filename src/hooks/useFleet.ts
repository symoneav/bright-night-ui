import { useCallback, useEffect, useState } from "react";
import { addSiteToFleet, addSitesToFleet, loadFleet } from "@/data/fleet";
import type { CleanSite, SiteFormInput } from "@/types/site";

type FleetState = {
  sites: CleanSite[];
  loading: boolean;
  error: string | null;
};

export function useFleet() {
  const [state, setState] = useState<FleetState>({
    sites: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const sites = await loadFleet();
      setState({ sites, loading: false, error: null });
    } catch (error) {
      setState({
        sites: [],
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to load fleet data",
      });
    }
  }, []);

  const addSite = useCallback(async (input: SiteFormInput) => {
    const site = await addSiteToFleet(input);
    setState((prev) => ({
      ...prev,
      sites: [...prev.sites, site],
    }));
    return site;
  }, []);

  const addSites = useCallback(async (inputs: SiteFormInput[]) => {
    const sites = await addSitesToFleet(inputs);
    setState((prev) => ({
      ...prev,
      sites: [...prev.sites, ...sites],
    }));
    return sites;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
    addSite,
    addSites,
  };
}
