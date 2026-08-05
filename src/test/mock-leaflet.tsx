import { Fragment, type ReactNode } from "react";
import { vi } from "vitest";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({ children }: { children?: ReactNode }) => (
    <div data-testid="leaflet-marker">{children}</div>
  ),
  Popup: ({ children }: { children?: ReactNode }) => (
    <div data-testid="leaflet-popup">{children}</div>
  ),
  useMap: () => ({
    flyTo: vi.fn(),
    setView: vi.fn(),
  }),
}));

vi.mock("react-leaflet-cluster", () => ({
  default: ({ children }: { children?: ReactNode }) => (
    <Fragment>{children}</Fragment>
  ),
}));

vi.mock("leaflet", () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    Icon: {
      Default: {
        mergeOptions: vi.fn(),
        prototype: {},
      },
    },
  },
}));
