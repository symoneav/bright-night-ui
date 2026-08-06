import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FleetExplorer } from "../FleetExplorer";
import { renderWithProviders } from "@/test/render";

vi.mock("@/hooks/useFleet", () => ({
  useFleet: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="map-view" />,
}));

import { useFleet } from "@/hooks/useFleet";

describe("FleetExplorer", () => {
  it("shows a loading state while fleet data is fetching", () => {
    vi.mocked(useFleet).mockReturnValue({
      sites: [],
      loading: true,
      error: null,
      refresh: vi.fn(),
      addSite: vi.fn(),
      addSites: vi.fn(),
    });

    renderWithProviders(<FleetExplorer />);

    expect(screen.getByText("Loading fleet data…")).toBeInTheDocument();
  });
});
