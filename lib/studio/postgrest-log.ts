import type { PostgrestError } from "@supabase/supabase-js";

/** Structured PostgREST / Supabase DB error logging (never log secrets). */
export function logPostgrestError(
  tag: string,
  err: PostgrestError | null | undefined,
  extra?: Record<string, unknown>,
): void {
  if (!err) return;
  console.error(tag, {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
    ...extra,
  });
}
