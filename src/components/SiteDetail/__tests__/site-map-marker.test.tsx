import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteMapMarker } from "../site-map-marker";
import { defaultSiteMarkerIcon } from "@/lib/marker-icons";
import { mockSite } from "@/test/mock-site";

describe("SiteMapMarker", () => {
  it("renders nothing when the site has no coordinates", () => {
    const { container } = render(
      <SiteMapMarker
        site={{ ...mockSite, coordinates: null }}
        icon={defaultSiteMarkerIcon}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders site details in a marker popup", () => {
    render(<SiteMapMarker site={mockSite} icon={defaultSiteMarkerIcon} />);

    expect(screen.getByTestId("leaflet-popup")).toBeInTheDocument();
    expect(screen.getByText("SITE_00001")).toBeInTheDocument();
  });
});
