/**
 * Date/time display for First Listen Mastering.
 *
 * Storage rule: Postgres `timestamptz` and `new Date().toISOString()` are UTC instants.
 * Never call `toLocaleString` / `toLocaleDateString` / `toLocaleTimeString` without
 * `timeZone: STOCKHOLM_TIME_ZONE` — Node/Vercel default to UTC and will show wrong wall time.
 *
 * Display rule: all customer-facing and studio UI uses Europe/Stockholm (CET/CEST via IANA).
 * Import helpers from this file only; do not format dates inline elsewhere.
 */

/** IANA zone — handles CET (+1) / CEST (+2) DST transitions automatically. */
export const STOCKHOLM_TIME_ZONE = "Europe/Stockholm" as const;

export const STOCKHOLM_LOCALE = "sv-SE" as const;

export function parseDateInput(
  value: string | number | Date | null | undefined,
): Date | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date + time — dashboard tables, delivery portal, order detail timestamps. */
export function formatStockholmDateTime(
  value: string | number | Date | null | undefined,
): string {
  const d = parseDateInput(value);
  if (!d) return "—";
  return d.toLocaleString(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Date only — email meta rows, compact labels. */
export function formatStockholmDate(
  value: string | number | Date | null | undefined,
): string {
  const d = parseDateInput(value);
  if (!d) return "—";
  return d.toLocaleDateString(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
  });
}

/** Long date without time — order detail date header. */
export function formatStockholmDateLong(
  value: string | number | Date | null | undefined,
): string {
  const d = parseDateInput(value);
  if (!d) return "—";
  return d.toLocaleDateString(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Time only. */
export function formatStockholmTime(
  value: string | number | Date | null | undefined,
): string {
  const d = parseDateInput(value);
  if (!d) return "—";
  return d.toLocaleTimeString(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
  });
}

/** Stripe Checkout Session `created` is Unix seconds (UTC instant). */
export function dateFromUnixSeconds(seconds: number): Date | null {
  if (!Number.isFinite(seconds)) return null;
  return parseDateInput(seconds * 1000);
}

/** UTC offset label for diagnostics (e.g. +02:00 summer, +01:00 winter). */
export function stockholmUtcOffsetLabel(
  value: string | number | Date | null | undefined,
): string {
  const d = parseDateInput(value);
  if (!d) return "";
  const parts = new Intl.DateTimeFormat(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(d);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}
