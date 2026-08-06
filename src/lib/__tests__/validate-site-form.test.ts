/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { isFutureIsoDateOnly } from "@/lib/date-only";
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

  it("accepts today's installation date", () => {
    const now = new Date(2026, 7, 5, 12, 0, 0);
    const today = "2026-08-05";

    expect(
      validateSiteForm(
        { ...validInput, installationDate: today },
        [],
        { futureDateGraceDays: 0 },
      ),
    ).toEqual([]);

    expect(
      isFutureIsoDateOnly(today, now, { graceDays: 0 }),
    ).toBe(false);
  });

  it("rejects invalid state codes", () => {
    const errors = fieldErrorsByField(
      validateSiteForm({ ...validInput, state: "California" }),
    );

    expect(errors.state).toBe("Enter a valid 2-letter state code.");
    expect(isSiteFormValid({ ...validInput, state: "California" })).toBe(
      false,
    );
  });

  it("rejects invalid zip codes", () => {
    const errors = fieldErrorsByField(
      validateSiteForm({ ...validInput, zipCode: "abcde" }),
    );

    expect(errors.zipCode).toBe(
      "Enter a valid US zip code (e.g. 90210 or 90210-1234).",
    );
    expect(isSiteFormValid({ ...validInput, zipCode: "abcde" })).toBe(false);
  });
});
