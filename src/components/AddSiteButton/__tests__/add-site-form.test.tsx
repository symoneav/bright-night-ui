import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddSiteForm } from "../add-site-form";
import { renderWithProviders } from "@/test/render";

describe("AddSiteForm", () => {
  it("blocks submit and shows validation errors for an empty form", () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <AddSiteForm
        open
        isSubmitting={false}
        onCancel={() => undefined}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Site" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("System ID is required.")).toBeInTheDocument();
  });
});
