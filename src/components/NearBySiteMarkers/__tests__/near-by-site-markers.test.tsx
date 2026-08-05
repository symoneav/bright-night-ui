import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NearbySiteMarkers } from "../near-by-site-markers";
import { mockSite } from "@/test/mock-site";

describe("NearbySiteMarkers", () => {
  it("renders nothing when there are no visible sites", () => {
    const { container } = render(
      <NearbySiteMarkers sites={[]} onSiteExpand={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("excludes the focused site from the cluster", () => {
    const { container } = render(
      <NearbySiteMarkers
        sites={[mockSite]}
        excludeSystemId={mockSite.systemId}
        onSiteExpand={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
