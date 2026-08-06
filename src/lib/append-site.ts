import { readFile, writeFile } from "fs/promises";
import path from "path";
import { normalizeSiteFormInput } from "@/lib/normalize";
import { cleanSiteToRawCsvRow, rawCsvRowToLine } from "@/lib/serialize";
import { fieldErrorsByField, validateSiteForm } from "@/lib/validate-site-form";
import type { CleanSite, SiteFormInput } from "@/types/site";

const DEFAULT_CSV_PATH = path.join(
  process.cwd(),
  "data",
  "pv_sites_sample.csv",
);

type AppendSiteError = Error & {
  fieldErrors: Partial<Record<string, string>>;
};

function normalizeFormInput(input: SiteFormInput): SiteFormInput {
  return {
    ...input,
    systemId: input.systemId.trim(),
    state: input.state.trim().toUpperCase(),
    zipCode: input.zipCode.trim(),
  };
}

async function appendCsvLines(
  csvPath: string,
  lines: string[],
): Promise<void> {
  if (lines.length === 0) return;

  let existing = "";
  try {
    existing = await readFile(csvPath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const lineEnding = existing.includes("\r\n") ? "\r\n" : "\n";
  const base = existing.replace(/(?:\r?\n)+$/, "");
  const block = lines.join(lineEnding);
  const next =
    base.length === 0
      ? `${block}${lineEnding}`
      : `${base}${lineEnding}${block}${lineEnding}`;

  await writeFile(csvPath, next, "utf-8");
}

export async function appendSiteToCsv(
  input: SiteFormInput,
  existingSystemIds: string[],
  csvPath: string = DEFAULT_CSV_PATH,
): Promise<CleanSite> {
  const [site] = await appendSitesToCsv([input], existingSystemIds, csvPath);
  return site;
}

export async function appendSitesToCsv(
  inputs: SiteFormInput[],
  existingSystemIds: string[],
  csvPath: string = DEFAULT_CSV_PATH,
): Promise<CleanSite[]> {
  if (inputs.length === 0) {
    return [];
  }

  const knownIds = new Set(
    existingSystemIds.map((id) => id.trim().toUpperCase()),
  );
  const sites: CleanSite[] = [];

  for (const rawInput of inputs) {
    const input = normalizeFormInput(rawInput);
    const errors = validateSiteForm(input, knownIds, { futureDateGraceDays: 1 });
    if (errors.length > 0) {
      const error = new Error("Validation failed") as AppendSiteError;
      error.fieldErrors = fieldErrorsByField(errors);
      throw error;
    }

    const site = normalizeSiteFormInput(input);
    sites.push(site);
    knownIds.add(site.systemId.toUpperCase());
  }

  const lines = sites.map((site) =>
    rawCsvRowToLine(cleanSiteToRawCsvRow(site)),
  );

  await appendCsvLines(csvPath, lines);

  return sites;
}

export function isAppendSiteError(error: unknown): error is AppendSiteError {
  return (
    error instanceof Error &&
    "fieldErrors" in error &&
    typeof (error as AppendSiteError).fieldErrors === "object"
  );
}
