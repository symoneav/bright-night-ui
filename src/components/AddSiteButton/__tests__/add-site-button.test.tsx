import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddSiteButton } from "../add-site-button";
import { renderWithProviders } from "@/test/render";

describe("AddSiteButton", () => {
  it("opens the add-site form modal", () => {
    renderWithProviders(
      <AddSiteButton
        onAddSite={vi.fn(async () => undefined)}
        onBulkAddSites={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Site" }));

    expect(
      screen.getByRole("heading", { name: "Add New PV Site" }),
    ).toBeInTheDocument();
  });

  it("submits a valid single site to onAddSite", async () => {
    const onAddSite = vi.fn(async () => undefined);

    renderWithProviders(
      <AddSiteButton
        onAddSite={onAddSite}
        onBulkAddSites={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Site" }));

    const form = screen
      .getByRole("heading", { name: "Add New PV Site" })
      .closest("form");
    expect(form).not.toBeNull();

    fireEvent.change(within(form!).getByLabelText("System ID"), {
      target: { value: "SITE_99999" },
    });
    fireEvent.change(within(form!).getByLabelText("State"), {
      target: { value: "CA" },
    });
    fireEvent.change(within(form!).getByLabelText("Zip code"), {
      target: { value: "90210" },
    });
    fireEvent.change(within(form!).getByLabelText("Latitude"), {
      target: { value: "34.05" },
    });
    fireEvent.change(within(form!).getByLabelText("Longitude"), {
      target: { value: "-118.25" },
    });

    fireEvent.click(
      within(form!).getByRole("button", { name: "Add Site" }),
    );

    await waitFor(() => {
      expect(onAddSite).toHaveBeenCalledWith(
        expect.objectContaining({
          systemId: "SITE_99999",
          state: "CA",
          zipCode: "90210",
          lat: "34.05",
          lng: "-118.25",
        }),
      );
    });
  });
});
