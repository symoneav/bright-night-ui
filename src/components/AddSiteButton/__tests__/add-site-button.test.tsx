import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddSiteButton } from "../add-site-button";
import { renderWithProviders } from "@/test/render";

describe("AddSiteButton", () => {
  it("opens the add-site form modal", () => {
    renderWithProviders(
      <AddSiteButton onAddSite={vi.fn(async () => undefined)} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Site" }));

    expect(screen.getByRole("heading", { name: "Add New PV Site" })).toBeInTheDocument();
  });
});
