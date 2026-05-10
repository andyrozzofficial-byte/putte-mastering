import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Studio/admin auth in the browser (cookie-backed session). */
export function createStudioBrowserClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
