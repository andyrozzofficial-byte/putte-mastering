import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { escapeHtml } from "@/lib/email/escape-html";
import { getStudioNotifyEmail, sendResendEmail } from "@/lib/email/resend";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

const MAX_LEN = 8000;
const MIN_LEN = 3;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await ctx.params;
    const t = decodeURIComponent(token).trim();
    if (!t) {
      return apiJsonError("Invalid link", 403);
    }

    let body: { message?: unknown };
    try {
      body = (await req.json()) as { message?: unknown };
    } catch {
      return apiJsonError("Invalid JSON", 400);
    }

    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    if (message.length < MIN_LEN) {
      return apiJsonError(`Please enter at least ${MIN_LEN} characters.`, 400);
    }
    if (message.length > MAX_LEN) {
      return apiJsonError("Message is too long.", 400);
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, customer_email, track_name, delivery_access_token")
      .eq("delivery_access_token", t)
      .maybeSingle();

    if (orderErr || !order?.delivery_access_token) {
      return apiJsonError("Invalid link", 403);
    }

    const { error: insErr } = await supabase
      .from("order_revision_requests")
      .insert({ order_id: order.id, message });

    if (insErr) {
      console.error("[delivery-revision] insert failed", {
        message: insErr.message,
        code: insErr.code,
      });
      return apiJsonError("Could not save request", 500);
    }

    const { error: updErr } = await supabase
      .from("orders")
      .update({ status: "waiting_revision" })
      .eq("id", order.id);

    if (updErr) {
      console.error("[delivery-revision] status update failed", {
        message: updErr.message,
        code: updErr.code,
      });
      return apiJsonError("Could not update order", 500);
    }

    const trackLabel =
      (order.track_name as string | null)?.trim() || "Track";
    const customerEmail = (order.customer_email as string | null)?.trim();
    const portalUrl = deliveryPortalAbsoluteUrl(t);

    if (customerEmail) {
      void sendResendEmail({
        to: customerEmail,
        subject: "We received your revision request",
        html: `<p>Hi,</p>
<p>Thanks — we’ve received your notes for <strong>${escapeHtml(trackLabel)}</strong> and will follow up soon.</p>
<p><a href="${escapeHtml(portalUrl)}">View delivery page</a></p>`,
      });
    }

    const notify = getStudioNotifyEmail();
    if (notify) {
      void sendResendEmail({
        to: notify,
        subject: `Revision request — ${trackLabel}`,
        html: `<p>New revision notes for order <code>${escapeHtml(order.id as string)}</code> (${escapeHtml(trackLabel)}).</p>
<pre style="white-space:pre-wrap;font-family:system-ui,sans-serif">${escapeHtml(message)}</pre>
<p><a href="${escapeHtml(portalUrl)}">Customer portal</a></p>`,
      });
    }

    return apiJsonSuccess({});
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[delivery-revision] unhandled", {
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
