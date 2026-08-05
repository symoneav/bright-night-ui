import { appendFile } from "fs/promises";
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

export async function appendSiteToCsv(
  input: SiteFormInput,
  existingSystemIds: string[],
  csvPath: string = DEFAULT_CSV_PATH,
): Promise<CleanSite> {
  const errors = validateSiteForm(input, existingSystemIds);
  if (errors.length > 0) {
    const error = new Error("Validation failed") as AppendSiteError;
    error.fieldErrors = fieldErrorsByField(errors);
    throw error;
  }

  const site = normalizeSiteFormInput(input);
  const line = rawCsvRowToLine(cleanSiteToRawCsvRow(site));

  await appendFile(csvPath, `\n${line}`, "utf-8");

  return site;
}

export function isAppendSiteError(error: unknown): error is AppendSiteError {
  return (
    error instanceof Error &&
    "fieldErrors" in error &&
    typeof (error as AppendSiteError).fieldErrors === "object"
  );
}
