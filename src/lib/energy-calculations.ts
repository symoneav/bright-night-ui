import type { CleanSite } from "@/types/site";

export function calculateAnnualEnergyProduction(
  systemSizeKw: number,
  peakSunHours: number,
  performanceRatio: number,
): number {
  return systemSizeKw * peakSunHours * performanceRatio;
}

export function calculateAvgEnergyProduction(
  systemSizeKw: number,
  peakSunHours: number,
  performanceRatio: number,
  timePeriod: number,
): number {
  return (systemSizeKw * peakSunHours * performanceRatio) / timePeriod;
}

/** Grid carbon intensity in kg CO₂ per kWh; result is metric tons. */
export function calculateAnnualCarbonOffset(
  energyProductionKwh: number,
  carbonIntensityKgPerKwh = 0.394,
): number {
  return (energyProductionKwh * carbonIntensityKgPerKwh) / 1000;
}

export type SolarInputs = {
  systemSizeKw: number;
  quantity: number;
  efficiency: number;
  lat: number;
  lng: number;
  tilt: number;
  azimuth: number;
  grounded: boolean;
};

export type SolarOutputs = {
  annualEnergyKwh: number;
  totalFootprintM2: number;
  panelSizeM2: number;
  performanceRatio: number;
  tiltedIrradiation: number;
};

export function calculateSolarOutputs(inputs: SolarInputs): SolarOutputs {
  const { systemSizeKw, quantity, efficiency, lat, tilt, azimuth, grounded } =
    inputs;

  const totalFootprintM2 = systemSizeKw / (efficiency || 0.1);
  const panelSizeM2 = quantity > 0 ? totalFootprintM2 / quantity : 0;
  const performanceRatio = grounded ? 0.82 : 0.75;

  const baseGhi = 1800 - Math.abs(lat) * 12;
  const beamFraction = 0.65 - Math.abs(lat) * 0.002;

  const annualGhi = Math.max(900, Math.min(2500, baseGhi));
  const annualDni = annualGhi * beamFraction;
  const annualDhi = annualGhi * (1 - beamFraction);

  const beta = (tilt * Math.PI) / 180;
  const gamma = (azimuth * Math.PI) / 180;

  const skyViewFactor = (1 + Math.cos(beta)) / 2;
  const groundViewFactor = (1 - Math.cos(beta)) / 2;
  const groundAlbedo = 0.2;

  const optimalTilt = Math.abs(lat);
  const tiltDeviation = Math.cos(beta - (optimalTilt * Math.PI) / 180);
  const azimuthDeviation = Math.cos(gamma);
  const rb = Math.max(
    0.5,
    tiltDeviation * azimuthDeviation * (Math.abs(lat) > 20 ? 1.1 : 1.0),
  );

  const tiltedBeam = annualDni * rb;
  const tiltedDiffuse = annualDhi * skyViewFactor;
  const tiltedReflected = annualGhi * groundAlbedo * groundViewFactor;
  const tiltedIrradiation = tiltedBeam + tiltedDiffuse + tiltedReflected;

  const annualEnergyKwh = systemSizeKw * tiltedIrradiation * performanceRatio;

  return {
    annualEnergyKwh: Math.round(annualEnergyKwh),
    totalFootprintM2: Number(totalFootprintM2.toFixed(1)),
    panelSizeM2: Number(panelSizeM2.toFixed(2)),
    performanceRatio,
    tiltedIrradiation: Math.round(tiltedIrradiation),
  };
}

export function canEstimateSiteEnergy(site: CleanSite): boolean {
  return (
    site.systemSizeKw !== null &&
    site.coordinates !== null &&
    site.azimuthDeg !== null &&
    site.tiltDeg !== null
  );
}

export function estimateSiteEnergy(site: CleanSite): {
  annualEnergyKwh: number | null;
  carbonOffsetTons: number | null;
} {
  if (!canEstimateSiteEnergy(site)) {
    return { annualEnergyKwh: null, carbonOffsetTons: null };
  }

  const outputs = calculateSolarOutputs({
    systemSizeKw: site.systemSizeKw!,
    quantity: site.moduleQuantity ?? 1,
    efficiency: site.efficiency ?? 0.1,
    lat: site.coordinates!.lat,
    lng: site.coordinates!.lng,
    tilt: site.tiltDeg!,
    azimuth: site.azimuthDeg!,
    grounded: site.groundMounted ?? false,
  });

  return {
    annualEnergyKwh: outputs.annualEnergyKwh,
    carbonOffsetTons: calculateAnnualCarbonOffset(outputs.annualEnergyKwh),
  };
}
