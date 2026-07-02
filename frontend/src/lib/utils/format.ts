const DEFAULT_CURRENCY = "TZS";
const DEFAULT_LOCALE = "en-US";

/**
 * Format a monetary value using the FundFlow financial standard (Phase 13).
 *
 * Defaults: TZS, 2 decimals, ISO code prefix (`TZS 1,250,000.00`).
 * Backward-compatible with the previous positional signature
 * `formatCurrency(value, currency, locale)`.
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Compact currency for KPI cards and tight spaces (`TZS 1.25M`).
 */
export function formatCompactCurrency(
  value: number | null | undefined,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 1) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return `${Number(value).toFixed(decimals)}%`;
}

export function toNumber(value: number | string | null | undefined) {
  if (value == null) {
    return 0;
  }
  return typeof value === "number" ? value : Number(value);
}

/**
 * Format a financial reference number (Phase 13 transaction reference standard).
 *
 * Produces `PREFIX-YEAR-NNNNNN`, e.g. `formatReference("DON", 145)` → `DON-2026-000145`.
 * A pre-formatted reference string is returned unchanged.
 */
export function formatReference(
  prefix: string,
  id: number | string | null | undefined,
  options?: { year?: number; pad?: number },
) {
  if (id == null || id === "") {
    return "—";
  }

  if (typeof id === "string" && /-\d{4}-/.test(id)) {
    return id;
  }

  const year = options?.year ?? new Date().getFullYear();
  const pad = options?.pad ?? 6;
  const numeric = typeof id === "number" ? id : Number(id.replace(/\D/g, ""));

  if (Number.isNaN(numeric)) {
    return `${prefix}-${id}`;
  }

  return `${prefix}-${year}-${String(numeric).padStart(pad, "0")}`;
}
