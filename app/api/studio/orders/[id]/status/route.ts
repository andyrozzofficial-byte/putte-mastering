import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { escapeHtml } from "@/lib/email/escape-html";
import { sendResendEmail } from "@/lib/email/resend";
import { requireStudioSessionUser } from "@/lib/supabase/studio-api-auth";

type Body = {
  status: "new" | "in_progress" | "waiting_revision" | "completed";
};

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireStudioSessionUser();
    if (!user) {
      return apiJsonError("Unauthorized", 401);
    }

    const { id } = await ctx.params;
    let body: Partial<Body>;
    try {
      body = (await req.json()) as Partial<Body>;
    } catch {
      return apiJsonError("Invalid JSON body", 400);
    }

    const status = body.status;
    if (
      status !== "new" &&
      status !== "in_progress" &&
      status !== "waiting_revision" &&
      status !== "completed"
    ) {
      return apiJsonError("Invalid status", 400);
    }

    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      console.error("[studio-status] update failed", {
        id,
        status,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return apiJsonError("Update failed", 500);
    }

    const { data: row } = await supabase
      .from("orders")
      .select("customer_email, track_name, delivery_access_token")
      .eq("id", id)
      .maybeSingle();

    if (status === "in_progress" && row) {
      const email = (row.customer_email as string | null)?.trim();
      const tok = (row.delivery_access_token as string | null)?.trim();
      const track = (row.track_name as string | null)?.trim() || "your project";
      if (email && tok) {
        const portal = deliveryPortalAbsoluteUrl(tok);
        void sendResendEmail({
          to: email,
          subject: "We’re working on your master",
          html: `<p>Hi,</p>
<p>We’ve started work on <strong>${escapeHtml(track)}</strong>.</p>
<p>You can follow progress here: <a href="${escapeHtml(portal)}">${escapeHtml(portal)}</a></p>
<p>— First Listen Mastering</p>`,
        });
      }
    }

    return apiJsonSuccess({ status });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[studio-status] unhandled", {
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
