import Papa from "papaparse";
import type { RawCsvRow } from "@/types/site";

export function parseCsv(csvText: string): RawCsvRow[] {
  const result = Papa.parse<RawCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(
      `CSV parse failed: ${result.errors.map((e) => e.message).join("; ")}`,
    );
  }

  return result.data;
}
