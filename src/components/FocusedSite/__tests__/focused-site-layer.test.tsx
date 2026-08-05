import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FocusedSiteLayer } from "../focused-site-layer";
import { mockSite } from "@/test/mock-site";

describe("FocusedSiteLayer", () => {
  it("renders nothing when the site has no coordinates", () => {
    const { container } = render(
      <FocusedSiteLayer site={{ ...mockSite, coordinates: null }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a focused marker popup for a mappable site", () => {
    render(<FocusedSiteLayer site={mockSite} />);

    expect(screen.getByTestId("leaflet-popup")).toBeInTheDocument();
    expect(screen.getByText("SITE_00001")).toBeInTheDocument();
  });
});
