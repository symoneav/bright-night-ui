import {
  MAX_SYSTEM_SIZE_KW,
  US_LAT_MAX,
  US_LAT_MIN,
  US_LNG_MAX,
  US_LNG_MIN,
} from "@/lib/constants";
import type { FieldError, SiteFormInput } from "@/types/site";

function isBlank(value: string): boolean {
  return value.trim() === "";
}

function parseFiniteNumber(value: string): number | null {
  const num = Number(value.trim());
  return Number.isFinite(num) ? num : null;
}

export function validateSiteForm(
  input: SiteFormInput,
  existingSystemIds: Iterable<string> = [],
): FieldError[] {
  const errors: FieldError[] = [];
  const existingIds = new Set(
    [...existingSystemIds].map((id) => id.trim().toUpperCase()),
  );

  const systemId = input.systemId.trim();
  if (!systemId) {
    errors.push({ field: "systemId", message: "System ID is required." });
  } else if (existingIds.has(systemId.toUpperCase())) {
    errors.push({
      field: "systemId",
      message: "This system ID already exists.",
    });
  }

  const state = input.state.trim().toUpperCase();
  if (!state) {
    errors.push({ field: "state", message: "State is required." });
  } else if (!/^[A-Z]{2}$/.test(state)) {
    errors.push({
      field: "state",
      message: "Enter a valid 2-letter state code.",
    });
  }

  const zipCode = input.zipCode.trim();
  if (!zipCode) {
    errors.push({ field: "zipCode", message: "Zip code is required." });
  } else if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
    errors.push({
      field: "zipCode",
      message: "Enter a valid US zip code (e.g. 90210 or 90210-1234).",
    });
  }

  if (isBlank(input.lat)) {
    errors.push({ field: "lat", message: "Latitude is required." });
  } else {
    const lat = parseFiniteNumber(input.lat);
    if (lat === null || lat < US_LAT_MIN || lat > US_LAT_MAX) {
      errors.push({
        field: "lat",
        message: `Latitude must be between ${US_LAT_MIN} and ${US_LAT_MAX}.`,
      });
    }
  }

  if (isBlank(input.lng)) {
    errors.push({ field: "lng", message: "Longitude is required." });
  } else {
    const lng = parseFiniteNumber(input.lng);
    if (lng === null || lng < US_LNG_MIN || lng > US_LNG_MAX) {
      errors.push({
        field: "lng",
        message: `Longitude must be between ${US_LNG_MIN} and ${US_LNG_MAX}.`,
      });
    }
  }

  if (!isBlank(input.systemSizeKw)) {
    const size = parseFiniteNumber(input.systemSizeKw);
    if (size === null || size <= 0 || size > MAX_SYSTEM_SIZE_KW) {
      errors.push({
        field: "systemSizeKw",
        message: `System size must be greater than 0 and at most ${MAX_SYSTEM_SIZE_KW} kW.`,
      });
    }
  }

  if (!isBlank(input.azimuthDeg)) {
    const azimuth = parseFiniteNumber(input.azimuthDeg);
    if (azimuth === null || azimuth < 0 || azimuth > 359) {
      errors.push({
        field: "azimuthDeg",
        message: "Azimuth must be between 0 and 359 degrees.",
      });
    }
  }

  if (!isBlank(input.tiltDeg)) {
    const tilt = parseFiniteNumber(input.tiltDeg);
    if (tilt === null || tilt < 0 || tilt > 90) {
      errors.push({
        field: "tiltDeg",
        message: "Tilt must be between 0 and 90 degrees.",
      });
    }
  }

  if (!isBlank(input.moduleQuantity)) {
    const quantity = parseFiniteNumber(input.moduleQuantity);
    if (quantity === null || quantity <= 0 || !Number.isInteger(quantity)) {
      errors.push({
        field: "moduleQuantity",
        message: "Module quantity must be a positive whole number.",
      });
    }
  }

  if (!isBlank(input.efficiency)) {
    const efficiency = parseFiniteNumber(input.efficiency);
    if (efficiency === null || efficiency <= 0 || efficiency > 1) {
      errors.push({
        field: "efficiency",
        message: "Efficiency must be a fraction greater than 0 and at most 1.",
      });
    }
  }

  if (!isBlank(input.installationDate)) {
    const date = new Date(input.installationDate.trim());
    if (Number.isNaN(date.getTime())) {
      errors.push({
        field: "installationDate",
        message: "Enter a valid installation date.",
      });
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        errors.push({
          field: "installationDate",
          message: "Installation date cannot be in the future.",
        });
      }
    }
  }

  return errors;
}

export function fieldErrorsByField(
  errors: FieldError[],
): Partial<Record<FieldError["field"], string>> {
  return Object.fromEntries(
    errors.map((error) => [error.field, error.message]),
  );
}

export function isSiteFormValid(
  input: SiteFormInput,
  existingSystemIds: Iterable<string> = [],
): boolean {
  return validateSiteForm(input, existingSystemIds).length === 0;
}
