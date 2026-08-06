/** Parse YYYY-MM-DD as a local calendar date (avoids UTC midnight shifts). */
export function parseIsoDateOnly(
  value: string,
): { iso: string; date: Date } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { iso: `${match[1]}-${match[2]}-${match[3]}`, date };
}

export function endOfLocalDay(now = new Date()): Date {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function isFutureIsoDateOnly(
  value: string,
  now = new Date(),
  options: { graceDays?: number } = {},
): boolean {
  const parsed = parseIsoDateOnly(value);
  if (!parsed) return true;

  const graceDays = options.graceDays ?? 0;
  const maxAllowed = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + graceDays,
    23,
    59,
    59,
    999,
  );

  return parsed.date.getTime() > maxAllowed.getTime();
}

export function normalizeIsoDateOnly(value: string): string | null {
  return parseIsoDateOnly(value)?.iso ?? null;
}
