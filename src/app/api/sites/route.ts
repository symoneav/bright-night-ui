import { readFile } from "fs/promises";
import path from "path";
import { normalizeFleet } from "@/lib/normalize";
import { parseCsv } from "@/lib/parse";
import type { CleanSite } from "@/types/site";

const CSV_PATH = path.join(process.cwd(), "data", "pv_sites_sample.csv");

let cachedSites: CleanSite[] | null = null;

async function loadSitesFromDisk(): Promise<CleanSite[]> {
  if (cachedSites) return cachedSites;

  const csvText = await readFile(CSV_PATH, "utf-8");
  const rows = parseCsv(csvText);
  cachedSites = normalizeFleet(rows);
  return cachedSites;
}

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
