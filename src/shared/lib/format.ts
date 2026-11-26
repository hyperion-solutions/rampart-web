export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
export const formatXp = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}k` : String(n);

/** "deputy_owner" -> "Deputy owner", "def1" stays as is unless listed in labels. */
export const formatLabel = (value: string, labels: Readonly<Record<string, string>> = {}) =>
  labels[value] ?? value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);

const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60],
];

/** "3 hours ago", "2 days ago". */
export const formatRelative = (date: Date, now: Date = new Date()) => {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
};
