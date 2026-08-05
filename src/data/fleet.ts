import type { CleanSite, SiteFormInput } from "@/types/site";

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
    CleanSite | { error?: string; fieldErrors?: Record<string, string> } | null;

  if (!response.ok) {
    const message =
      body && "error" in body && body.error
        ? body.error
        : `Failed to add site (${response.status})`;
    throw new Error(message);
  }

  return body as CleanSite;
}
