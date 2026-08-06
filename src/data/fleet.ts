import type { CleanSite, FieldError, SiteFormInput } from "@/types/site";

export const ADD_SITE_SUPPORT_MESSAGE =
  "Something went wrong while adding the site. Please contact engineer@brightnight.com for help.";

export class AddSiteFleetError extends Error {
  fieldErrors?: Partial<Record<FieldError["field"] | "form", string>>;

  constructor(
    message: string,
    fieldErrors?: Partial<Record<FieldError["field"] | "form", string>>,
  ) {
    super(message);
    this.name = "AddSiteFleetError";
    this.fieldErrors = fieldErrors;
  }
}

export function isAddSiteUserError(error: unknown): error is AddSiteFleetError {
  return (
    error instanceof AddSiteFleetError &&
    error.fieldErrors !== undefined &&
    Object.keys(error.fieldErrors).length > 0
  );
}

export async function loadFleet(): Promise<CleanSite[]> {
  const response = await fetch("/api/sites");

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Failed to load fleet (${response.status})`);
  }

  return response.json() as Promise<CleanSite[]>;
}

export async function addSiteToFleet(input: SiteFormInput): Promise<CleanSite> {
  const response = await fetch("/api/sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => null)) as
    | CleanSite
    | { error?: string; fieldErrors?: Partial<Record<string, string>> }
    | null;

  if (!response.ok) {
    const message =
      body && "error" in body && body.error
        ? body.error
        : `Failed to add site (${response.status})`;
    throw new AddSiteFleetError(
      message,
      body && "fieldErrors" in body ? body.fieldErrors : undefined,
    );
  }

  return body as CleanSite;
}

export async function addSitesToFleet(
  inputs: SiteFormInput[],
): Promise<CleanSite[]> {
  const response = await fetch("/api/sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });

  const body = (await response.json().catch(() => null)) as
    | CleanSite[]
    | { error?: string; fieldErrors?: Partial<Record<string, string>> }
    | null;

  if (!response.ok) {
    const message =
      body && "error" in body && body.error
        ? body.error
        : `Failed to add sites (${response.status})`;
    throw new AddSiteFleetError(
      message,
      body && "fieldErrors" in body ? body.fieldErrors : undefined,
    );
  }

  return body as CleanSite[];
}
