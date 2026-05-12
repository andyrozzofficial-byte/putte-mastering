import { NextResponse } from "next/server";

import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { generateDeliveryAccessToken } from "@/lib/delivery/access-token";
import { escapeHtml } from "@/lib/email/escape-html";
import { getStudioNotifyEmail, sendResendEmail } from "@/lib/email/resend";
import { requireStudioSessionUser } from "@/lib/supabase/studio-api-auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const BUCKET = "uploads";

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_|_$/g, "");
  return base.slice(0, 180) || "master";
}

function resolveDeliveryUrlForStudio(token: string, req: Request): string {
  let url = deliveryPortalAbsoluteUrl(token);
  if (!url.startsWith("http")) {
    const origin = req.headers.get("origin")?.trim();
    if (origin) url = `${origin}/delivery/${token}`;
  }
  return url;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const auth = await requireStudioSessionUser();
    if (!auth.user) {
      console.warn("[deliver] unauthorized", { hasSessionError: !!auth.error });
      return apiJsonError("Unauthorized", 401);
    }

    const params = await ctx.params;
    id = params.id;

    let form: FormData;
    try {
      form = await req.formData();
    } catch (formErr) {
      const msg =
        formErr instanceof Error ? formErr.message : String(formErr);
      console.error("[deliver] formData failed", {
        id,
        message: msg,
        stack: formErr instanceof Error ? formErr.stack : undefined,
      });
      return apiJsonError(
        "Could not read upload. The file may be too large for this deployment, or the connection was interrupted.",
        413,
      );
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return apiJsonError("Missing file", 400);
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .select(
        "id, customer_email, track_name, delivery_access_token, mastered_file",
      )
      .eq("id", id)
      .maybeSingle();

    if (orderErr || !orderRow) {
      console.error("[deliver] order load failed", {
        id,
        orderErr: orderErr?.message,
        code: orderErr?.code,
      });
      return apiJsonError("Order not found", 404);
    }

    let accessToken = orderRow.delivery_access_token as string | null;
    if (!accessToken?.trim()) {
      accessToken = generateDeliveryAccessToken();
      const { error: tokErr } = await supabase
        .from("orders")
        .update({ delivery_access_token: accessToken })
        .eq("id", id);
      if (tokErr) {
        console.error("[deliver] token backfill failed", {
          id,
          message: tokErr.message,
          code: tokErr.code,
        });
        return apiJsonError("Could not prepare delivery link", 500);
      }
    }

    const objectPath = `deliveries/${id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      console.error("[deliver] storage upload failed", {
        id,
        message: uploadError.message,
        path: objectPath,
      });
      return apiJsonError(
        `Upload failed: ${uploadError.message || "storage error"}`,
        500,
      );
    }

    const masteredFile = `${BUCKET}/${objectPath}`;

    const { data: maxVerRow } = await supabase
      .from("order_master_versions")
      .select("version")
      .eq("order_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (maxVerRow?.version ?? 0) + 1;

    const { error: verInsErr } = await supabase
      .from("order_master_versions")
      .insert({
        order_id: id,
        storage_ref: masteredFile,
        version: nextVersion,
      });

    if (verInsErr) {
      console.error("[deliver] version insert failed", {
        id,
        message: verInsErr.message,
        code: verInsErr.code,
      });
      return apiJsonError("Could not record master version", 500);
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        mastered_file: masteredFile,
        status: "completed",
        delivery_completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("[deliver] order update failed", {
        id,
        code: updateError.code,
        message: updateError.message,
      });
      return apiJsonError("Could not update order", 500);
    }

    const deliveryUrl = resolveDeliveryUrlForStudio(accessToken, req);
    const trackLabel =
      (orderRow.track_name as string | null)?.trim() || "your track";
    const customerEmail = (orderRow.customer_email as string | null)?.trim();

    if (customerEmail) {
      void sendResendEmail({
        to: customerEmail,
        subject: "Your master is ready",
        html: `<p>Hi,</p>
<p>Your master for <strong>${escapeHtml(trackLabel)}</strong> is ready to download.</p>
<p><a href="${escapeHtml(deliveryUrl)}">Open delivery page</a></p>
<p>— First Listen Mastering</p>`,
      });
    }

    const notify = getStudioNotifyEmail();
    if (notify) {
      void sendResendEmail({
        to: notify,
        subject: `Master uploaded — ${trackLabel}`,
        html: `<p>A new master was uploaded for order <code>${escapeHtml(id)}</code> (version ${nextVersion}).</p>
<p>Customer link: <a href="${escapeHtml(deliveryUrl)}">${escapeHtml(deliveryUrl)}</a></p>`,
      });
    }

    console.info("[deliver] success", {
      id,
      version: nextVersion,
      path: objectPath,
    });

    return apiJsonSuccess({
      deliveryUrl,
      masteredFile,
      version: nextVersion,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[deliver] unhandled", {
      id,
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
