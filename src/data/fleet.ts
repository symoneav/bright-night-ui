import type { CleanSite } from "@/types/site";

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
