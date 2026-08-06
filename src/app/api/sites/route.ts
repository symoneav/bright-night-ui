import {
  appendSiteToCsv,
  appendSitesToCsv,
  isAppendSiteError,
} from "@/lib/append-site";
import type { SiteFormInput } from "@/types/site";
import { loadSitesFromDisk, setCachedSites } from "./sites-store";

export async function GET() {
  try {
    const sites = await loadSitesFromDisk();
    return Response.json(sites);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load fleet data";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SiteFormInput | SiteFormInput[];
    const existingSites = await loadSitesFromDisk();
    const existingSystemIds = existingSites.map((existing) => existing.systemId);

    if (Array.isArray(body)) {
      const sites = await appendSitesToCsv(body, existingSystemIds);
      setCachedSites([...existingSites, ...sites]);
      return Response.json(sites, { status: 201 });
    }

    const site = await appendSiteToCsv(body, existingSystemIds);
    setCachedSites([...existingSites, site]);

    return Response.json(site, { status: 201 });
  } catch (error) {
    if (isAppendSiteError(error)) {
      return Response.json(
        { error: error.message, fieldErrors: error.fieldErrors },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to add site";
    return Response.json({ error: message }, { status: 500 });
  }
}
