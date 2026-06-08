#!/usr/bin/env node
/**
 * DST + timezone-independence checks for lib/datetime.ts formatting rules.
 * Run: npm run verify:datetime
 * Also: TZ=UTC npm run verify:datetime
 */

const STOCKHOLM_TIME_ZONE = "Europe/Stockholm";
const STOCKHOLM_LOCALE = "sv-SE";

function formatStockholmDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStockholmDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
  });
}

function stockholmUtcOffsetLabel(value) {
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat(STOCKHOLM_LOCALE, {
    timeZone: STOCKHOLM_TIME_ZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(d);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
}

const cases = [
  {
    name: "June (CEST, UTC+2)",
    utc: "2026-06-15T12:00:00.000Z",
    expectHour: "14:00",
    expectOffset: "GMT+2",
  },
  {
    name: "December (CET, UTC+1)",
    utc: "2026-12-15T12:00:00.000Z",
    expectHour: "13:00",
    expectOffset: "GMT+1",
  },
];

console.info("[verify-datetime] process TZ:", process.env.TZ ?? "(system default)");

for (const c of cases) {
  const formatted = formatStockholmDateTime(c.utc);
  const offset = stockholmUtcOffsetLabel(c.utc);

  console.info(`[verify-datetime] ${c.name}`);
  console.info("  UTC in:     ", c.utc);
  console.info("  Stockholm:  ", formatted);
  console.info("  Offset:     ", offset);
  console.info("  Email date: ", formatStockholmDate(c.utc));

  assert(
    formatted.includes(c.expectHour),
    `${c.name}: expected wall time to include ${c.expectHour}, got ${formatted}`,
  );
  assert(
    offset === c.expectOffset,
    `${c.name}: expected offset ${c.expectOffset}, got ${offset}`,
  );
}

const probe = "2026-06-08T14:30:00.000Z";
const formattedProbe = formatStockholmDateTime(probe);
assert(
  formattedProbe.includes("16:30"),
  `June probe should show 16:30 Stockholm, got ${formattedProbe}`,
);

console.info("[verify-datetime] All checks passed.");
