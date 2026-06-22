import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import { requireStudioSessionUser } from "@/lib/supabase/studio-api-auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, user } = await requireStudioSessionUser();
    if (!user) {
      return apiJsonError("Unauthorized", 401);
    }

    const { id } = await ctx.params;
    const trimmed = id.trim();
    if (!trimmed) {
      return apiJsonError("Missing order id", 400);
    }

    const { data, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", trimmed)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[studio-delete] delete failed", {
        id: trimmed,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return apiJsonError("Delete failed", 500);
    }

    if (!data) {
      return apiJsonError("Order not found", 404);
    }

    return apiJsonSuccess({ id: data.id });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[studio-delete] unhandled", {
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
