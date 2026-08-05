import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CenterMarker } from "../center-marker";

describe("CenterMarker", () => {
  it("renders nothing without a position", () => {
    const { container } = render(<CenterMarker position={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a marker when a position is provided", () => {
    render(<CenterMarker position={[34.05, -118.25]} />);

    expect(screen.getByTestId("leaflet-marker")).toBeInTheDocument();
  });
});
