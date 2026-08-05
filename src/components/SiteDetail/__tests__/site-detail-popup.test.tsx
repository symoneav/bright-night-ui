import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteDetailPopup } from "../site-detail-popup";
import { mockSite } from "@/test/mock-site";
import { renderWithProviders } from "@/test/render";

describe("SiteDetailPopup", () => {
  it("calls onExpand when the expand icon is clicked", () => {
    const onExpand = vi.fn();

    renderWithProviders(<SiteDetailPopup site={mockSite} onExpand={onExpand} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Expand details for SITE_00001" }),
    );

    expect(onExpand).toHaveBeenCalledWith(mockSite);
  });
});
