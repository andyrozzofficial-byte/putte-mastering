import { createStudioServerClient } from "@/lib/supabase/studio-server";

export async function requireStudioSessionUser() {
  const supabase = await createStudioServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { supabase, user, error };
}
