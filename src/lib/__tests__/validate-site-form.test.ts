import { describe, expect, it } from "vitest";
import { EMPTY_SITE_FORM_INPUT } from "@/types/site";
import {
  fieldErrorsByField,
  isSiteFormValid,
  validateSiteForm,
} from "@/lib/validate-site-form";

const validInput = {
  ...EMPTY_SITE_FORM_INPUT,
  systemId: "SITE_99999",
  state: "CA",
  zipCode: "90210",
  lat: "34.05",
  lng: "-118.25",
  systemSizeKw: "5.5",
  azimuthDeg: "180",
  tiltDeg: "20",
  moduleQuantity: "12",
  efficiency: "0.19",
  installationDate: "2020-01-15",
  tracking: false,
  thirdPartyOwned: true,
  groundMounted: false,
};

describe("validateSiteForm", () => {
  it("accepts a valid form", () => {
    expect(validateSiteForm(validInput)).toEqual([]);
    expect(isSiteFormValid(validInput)).toBe(true);
  });

  it("requires core identity and location fields", () => {
    const errors = fieldErrorsByField(validateSiteForm(EMPTY_SITE_FORM_INPUT));

    expect(errors.systemId).toBeDefined();
    expect(errors.state).toBeDefined();
    expect(errors.zipCode).toBeDefined();
    expect(errors.lat).toBeDefined();
    expect(errors.lng).toBeDefined();
  });

  it("rejects duplicate system IDs", () => {
    const errors = validateSiteForm(validInput, ["SITE_99999"]);

    expect(errors).toContainEqual({
      field: "systemId",
      message: "This system ID already exists.",
    });
  });

  it("rejects out-of-range angles and size", () => {
    const errors = fieldErrorsByField(
      validateSiteForm({
        ...validInput,
        azimuthDeg: "400",
        tiltDeg: "-5",
        systemSizeKw: "0",
      }),
    );

    expect(errors.azimuthDeg).toBeDefined();
    expect(errors.tiltDeg).toBeDefined();
    expect(errors.systemSizeKw).toBeDefined();
  });

  it("rejects future installation dates", () => {
    const errors = validateSiteForm({
      ...validInput,
      installationDate: "2099-12-31",
    });

    expect(errors).toContainEqual({
      field: "installationDate",
      message: "Installation date cannot be in the future.",
    });
  });
});
