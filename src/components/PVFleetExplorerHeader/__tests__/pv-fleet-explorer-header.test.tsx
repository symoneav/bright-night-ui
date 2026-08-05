import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PVFleetExplorerHeader } from "../pv-fleet-explorer-header";
import { mockSite } from "@/test/mock-site";
import { renderWithProviders } from "@/test/render";

describe("PVFleetExplorerHeader", () => {
  it("shows fleet stats when data is loaded", () => {
    renderWithProviders(
      <PVFleetExplorerHeader
        loading={false}
        error={null}
        sites={[mockSite]}
        mappableCount={1}
        missingCoordCount={0}
        onAddSite={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByRole("heading", { name: "PV Fleet Explorer" })).toBeInTheDocument();
    expect(screen.getByText(/1 sites loaded \(1 on map\)/)).toBeInTheDocument();
  });
});
