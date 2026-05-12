/**
 * Server-only checks for Supabase env used by `createServiceRoleSupabaseClient`.
 * Does not read or log secret values — only presence and safe URL metadata.
 */

import { NextResponse } from "next/server";

import { apiJsonError } from "@/lib/api/json-response";
import { DELIVER_MASTER_BUCKET } from "@/lib/studio/deliver-master-workflow";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export type ServiceRoleSupabaseClient = ReturnType<typeof createServiceRoleSupabaseClient>;

export function getMissingServerSupabaseEnvVarNames(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  return missing;
}

/** Required on the browser for signed Storage uploads (XHR headers). */
export function isPublicSupabaseAnonKeyPresent(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
}

function supabaseUrlHostForLogs(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return "invalid_url";
  }
}

/**
 * Call when studio deliver routes cannot create the service client.
 * Safe for production logs (no keys, no tokens).
 */
export function logServerSupabaseEnvDiagnostics(
  tag: string,
  extra?: Record<string, unknown>,
): void {
  const missingServer = getMissingServerSupabaseEnvVarNames();
  console.error(tag, {
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    missingServerSupabaseEnv: missingServer,
    hasNextPublicSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    hasNextPublicAnonKey: isPublicSupabaseAnonKeyPresent(),
    supabaseUrlHost: supabaseUrlHostForLogs(),
    storageBucket: DELIVER_MASTER_BUCKET,
    ...extra,
  });
}

export function serverSupabaseEnvErrorMessage(missing: string[]): string {
  const list = missing.join(", ");
  return `Missing deployment environment variables: ${list}. In Vercel: Project → Settings → Environment Variables → add each for the Production environment (and Preview if needed), then redeploy. Studio deliver APIs require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server. Direct browser uploads also require NEXT_PUBLIC_SUPABASE_ANON_KEY in the same app build.`;
}

/**
 * Creates the service-role Supabase client for studio API routes, or returns a JSON error response.
 * Logs actionable diagnostics (variable names only, never secret values).
 */
export function getServiceRoleClientOrApiError(
  logTag: string,
  context: Record<string, unknown>,
):
  | { ok: true; supabase: ServiceRoleSupabaseClient }
  | { ok: false; response: NextResponse } {
  const missing = getMissingServerSupabaseEnvVarNames();
  if (missing.length > 0) {
    logServerSupabaseEnvDiagnostics(`${logTag} missing server env`, context);
    return {
      ok: false,
      response: apiJsonError(serverSupabaseEnvErrorMessage(missing), 500),
    };
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    return { ok: true, supabase };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logServerSupabaseEnvDiagnostics(`${logTag} createServiceRoleSupabaseClient threw`, {
      ...context,
      errorMessage: msg,
    });
    const stillMissing = getMissingServerSupabaseEnvVarNames();
    const body =
      stillMissing.length > 0
        ? serverSupabaseEnvErrorMessage(stillMissing)
        : `Server configuration: ${msg}`;
    return { ok: false, response: apiJsonError(body, 500) };
  }
}
