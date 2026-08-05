export type RawCsvRow = {
  system_ID: string;
  state: string;
  zip_code: string;
  system_size_DC: string;
  azimuth_1: string;
  tilt_1: string;
  module_quantity_1: string;
  efficiency_1: string;
  tracking: string;
  installation_date: string;
  third_party_owned: string;
  ground_mounted: string;
  latitude: string;
  longitude: string;
};

export type CleanSite = {
  systemId: string;
  state: string;
  zipCode: string;
  systemSizeKw: number | null;
  azimuthDeg: number | null;
  tiltDeg: number | null;
  moduleQuantity: number | null;
  efficiency: number | null;
  tracking: boolean | null;
  installationDate: string | null;
  thirdPartyOwned: boolean | null;
  groundMounted: boolean | null;
  coordinates: { lat: number; lng: number } | null;
  confidence: number;
  flags: string[];
};

export type SiteFormInput = {
  systemId: string;
  state: string;
  zipCode: string;
  lat: string;
  lng: string;
  systemSizeKw: string;
  azimuthDeg: string;
  tiltDeg: string;
  installationDate: string;
  tracking: boolean | null;
  thirdPartyOwned: boolean | null;
  groundMounted: boolean | null;
};

export type FieldError = {
  field: keyof SiteFormInput | "form";
  message: string;
};
