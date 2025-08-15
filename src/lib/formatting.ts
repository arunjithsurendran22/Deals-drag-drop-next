// Lightweight formatting utilities used across the grid
// Keeps things fast and tree-shakeable. All functions are pure.

/** Format a number as currency (default USD). */
export function money(
  value: number | null | undefined,
  options: { currency?: string; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const {
    currency = "USD",
    locale = "en-US",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(n) ? n : 0);
}

/** Compact human currency: $1.2K, $3.4M */
export function moneyCompact(
  value: number | null | undefined,
  options: { currency?: string; locale?: string; maximumFractionDigits?: number } = {}
): string {
  const { currency = "USD", locale = "en-US", maximumFractionDigits = 1 } = options;
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits,
  }).format(Number.isFinite(n) ? n : 0);
}

/** 1.2K, 3.4M etc. */
export function numberCompact(
  value: number | null | undefined,
  options: { locale?: string; maximumFractionDigits?: number } = {}
): string {
  const { locale = "en-US", maximumFractionDigits = 1 } = options;
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits }).format(Number.isFinite(n) ? n : 0);
}

/** Format probability (0..1) as percent: 62% */
export function percent(
  value: number | null | undefined,
  options: { locale?: string; maximumFractionDigits?: number } = {}
): string {
  const { locale = "en-US", maximumFractionDigits = 0 } = options;
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits }).format(Number.isFinite(n) ? n : 0);
}

/** Date like 2025-08-15 -> Aug 15, 2025 */
export function dateShort(
  isoLike: string | Date | null | undefined,
  options: { locale?: string } = {}
): string {
  const { locale = "en-US" } = options;
  const d = toDate(isoLike);
  return new Intl.DateTimeFormat(locale, { month: "short", day: "2-digit", year: "numeric" }).format(d);
}

/** Strict YYYY-MM-DD string */
export function dateISO(isoLike: string | Date | null | undefined): string {
  const d = toDate(isoLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse "$12,345" -> 12345 */
export function parseCurrency(input: string | null | undefined): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Internal: coerce to Date safely */
function toDate(isoLike: string | Date | null | undefined): Date {
  if (isoLike instanceof Date) return isoLike;
  const d = new Date(isoLike ?? Date.now());
  return Number.isNaN(d.getTime()) ? new Date() : d;
}