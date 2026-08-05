import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteDetailContent } from "../site-detail-content";
import { mockSite } from "@/test/mock-site";
import { renderWithProviders } from "@/test/render";

describe("SiteDetailContent", () => {
  it("renders site fields and explicit placeholders for missing values", () => {
    renderWithProviders(<SiteDetailContent site={mockSite} />);

    expect(screen.getByText("SITE_00001")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Third-party owned")).toBeInTheDocument();
  });
});
