"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  canAddToComparison,
  resolveCompareSites,
  toggleCompareSelection,
} from "@/lib/compare-sites";
import type { CleanSite } from "@/types/site";

type CompareContextValue = {
  compareSiteIds: readonly string[];
  compareSites: CleanSite[];
  toggleCompare: (siteId: string) => void;
  removeFromCompare: (siteId: string) => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

type CompareProviderProps = {
  sites: CleanSite[];
  children: ReactNode;
};

export function CompareProvider({ sites, children }: CompareProviderProps) {
  const [compareSiteIds, setCompareSiteIds] = useState<string[]>([]);

  const compareSites = useMemo(
    () => resolveCompareSites(sites, compareSiteIds),
    [sites, compareSiteIds],
  );

  const toggleCompare = useCallback((siteId: string) => {
    setCompareSiteIds((current) => toggleCompareSelection(current, siteId));
  }, []);

  const removeFromCompare = useCallback((siteId: string) => {
    setCompareSiteIds((current) => current.filter((id) => id !== siteId));
  }, []);

  const value = useMemo(
    () => ({
      compareSiteIds,
      compareSites,
      toggleCompare,
      removeFromCompare,
    }),
    [compareSiteIds, compareSites, toggleCompare, removeFromCompare],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}

export function useSiteCompare(siteId: string) {
  const { compareSiteIds, toggleCompare } = useCompare();

  const isCompared = compareSiteIds.includes(siteId);
  const compareFull =
    !isCompared && !canAddToComparison(compareSiteIds, siteId);

  return {
    isCompared,
    compareFull,
    onToggleCompare: toggleCompare,
  };
}
