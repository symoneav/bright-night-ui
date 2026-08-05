import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapRecenterButton } from "../recenter-button";
import { renderWithProviders } from "@/test/render";

describe("MapRecenterButton", () => {
  it("renders a recenter control", () => {
    renderWithProviders(
      <MapRecenterButton center={[34.05, -118.25]} zoom={10} />,
    );

    expect(
      screen.getByRole("button", { name: "Recenter on your location" }),
    ).toBeInTheDocument();
  });
});
