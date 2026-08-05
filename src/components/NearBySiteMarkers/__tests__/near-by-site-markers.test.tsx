import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NearbySiteMarkers } from "../near-by-site-markers";
import { mockSite } from "@/test/mock-site";

describe("NearbySiteMarkers", () => {
  it("renders nothing when there are no visible sites", () => {
    const { container } = render(<NearbySiteMarkers sites={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders site details in a marker popup", () => {
    render(<NearbySiteMarkers sites={[mockSite]} />);

    expect(screen.getByTestId("leaflet-popup")).toBeInTheDocument();
    expect(screen.getByText("SITE_00001")).toBeInTheDocument();
  });
});
