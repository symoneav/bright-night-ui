import type { CleanSite } from "@/types/site";

export const mockSite: CleanSite = {
  systemId: "SITE_00001",
  state: "CA",
  zipCode: "90210",
  systemSizeKw: 5.5,
  azimuthDeg: 180,
  tiltDeg: 20,
  moduleQuantity: null,
  efficiency: 0.19,
  tracking: false,
  installationDate: "2020-01-15",
  thirdPartyOwned: false,
  groundMounted: true,
  coordinates: { lat: 34.05, lng: -118.25 },
  confidence: 85,
  flags: ["Third-party owned"],
};
