"use client";

import { useCallback, useEffect, useState } from "react";
import { loadFleet } from "@/data/fleet";
import type { CleanSite } from "@/types/site";

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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}
