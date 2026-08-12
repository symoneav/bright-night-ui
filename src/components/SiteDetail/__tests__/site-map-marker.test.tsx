import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompareProvider } from "@/context/compare-context";
import { SiteMapMarker } from "../site-map-marker";
import { defaultSiteMarkerIcon } from "@/lib/marker-icons";
import { mockSite } from "@/test/mock-site";
import { renderWithProviders } from "@/test/render";

describe("SiteMapMarker", () => {
  it("renders nothing when the site has no coordinates", () => {
    const { container } = render(
      <SiteMapMarker
        site={{ ...mockSite, coordinates: null }}
        icon={defaultSiteMarkerIcon}
        onExpand={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a compact site summary in a marker popup", () => {
    renderWithProviders(
      <CompareProvider sites={[mockSite]}>
        <SiteMapMarker
          site={mockSite}
          icon={defaultSiteMarkerIcon}
          onExpand={vi.fn()}
        />
      </CompareProvider>,
    );

    expect(screen.getByTestId("leaflet-popup")).toBeInTheDocument();
    expect(screen.getByText("SITE_00001")).toBeInTheDocument();
    expect(screen.getByText(/5\.5 kW/)).toBeInTheDocument();
    expect(screen.queryByText("Azimuth")).not.toBeInTheDocument();
  });
});
