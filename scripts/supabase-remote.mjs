/**
 * Remote Supabase Postgres: apply migrations and/or regenerate TypeScript types.
 *
 * Requires in `.env.local` (or the environment):
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
 * or the **direct** connection string from:
 *   Dashboard → Project Settings → Database → Connection string → URI
 *
 * Use the **database password** (not the anon/service keys). Percent-encode special
 * characters in the password, or wrap the URL in quotes in `.env.local`.
 *
 * Usage (loads .env.local via npm script):
 *   npm run db:push   — `supabase db push --db-url` (applies pending migrations)
 *   npm run db:types  — regenerate `lib/supabase/database.types.ts`
 *   npm run db:sync   — push then types
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function getDbUrl() {
  const url = process.env.SUPABASE_DB_URL?.trim();
  if (url) return url;
  console.error(
    "[supabase-remote] Missing SUPABASE_DB_URL.\n" +
      "Add it to .env.local (see comment in scripts/supabase-remote.mjs), then re-run.",
  );
  process.exit(1);
}

function runInherit(cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    encoding: "utf-8",
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function runCapture(cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf-8",
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status ?? 1);
  }
  return r.stdout ?? "";
}

function push() {
  const url = getDbUrl();
  runInherit("npx", ["supabase", "db", "push", "--db-url", url, "--yes"]);
  console.info("[supabase-remote] db push completed.");
}

function types() {
  const url = getDbUrl();
  const out = runCapture("npx", [
    "supabase",
    "gen",
    "types",
    "typescript",
    "--db-url",
    url,
    "--schema",
    "public",
  ]);
  const target = resolve(root, "lib/supabase/database.types.ts");
  if (out.length < 50) {
    console.error("[supabase-remote] gen types produced empty output.");
    process.exit(1);
  }
  writeFileSync(target, out, "utf-8");
  console.info("[supabase-remote] Wrote", target);
}

const mode = (process.argv[2] ?? "").toLowerCase();
if (!mode) {
  console.error("Usage: node scripts/supabase-remote.mjs <push|types|all>");
  process.exit(1);
}

if (mode === "push") {
  push();
} else if (mode === "types") {
  types();
} else if (mode === "all") {
  push();
  types();
} else {
  console.error("Unknown mode:", mode, "(expected push, types, or all)");
  process.exit(1);
}
