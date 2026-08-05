import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NearbySiteMarkers } from "../near-by-site-markers";
import { mockSite } from "@/test/mock-site";

describe("NearbySiteMarkers", () => {
  it("renders nothing when there are no visible sites", () => {
    const { container } = render(<NearbySiteMarkers sites={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("excludes the focused site from the cluster", () => {
    const { container } = render(
      <NearbySiteMarkers sites={[mockSite]} excludeSystemId={mockSite.systemId} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
