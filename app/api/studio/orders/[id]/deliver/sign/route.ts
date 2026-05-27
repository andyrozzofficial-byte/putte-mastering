import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import { generateDeliveryAccessToken } from "@/lib/delivery/access-token";
import { ensureUploadBucketLimit } from "@/lib/storage/ensure-upload-bucket-limit";
import { assertUploadSizeBytes, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import {
  assertAllowedDeliverFileName,
  buildDeliverObjectPath,
  DELIVER_MASTER_BUCKET,
} from "@/lib/studio/deliver-master-workflow";
import { getServiceRoleClientOrApiError, isPublicSupabaseAnonKeyPresent } from "@/lib/supabase/server-supabase-env";
import { requireStudioSessionUser } from "@/lib/supabase/studio-api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let orderId: string | undefined;
  try {
    const auth = await requireStudioSessionUser();
    if (!auth.user) {
      console.warn("[deliver-sign] unauthorized", { hasSessionError: !!auth.error });
      return apiJsonError("Unauthorized", 401);
    }

    const params = await ctx.params;
    orderId = params.id;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiJsonError("Invalid JSON body", 400);
    }

    const fileName =
      typeof body === "object" &&
      body !== null &&
      "fileName" in body &&
      typeof (body as { fileName: unknown }).fileName === "string"
        ? (body as { fileName: string }).fileName
        : null;

    const fileSizeBytes =
      typeof body === "object" &&
      body !== null &&
      "fileSizeBytes" in body &&
      typeof (body as { fileSizeBytes: unknown }).fileSizeBytes === "number"
        ? (body as { fileSizeBytes: number }).fileSizeBytes
        : null;

    if (!fileName?.trim()) {
      return apiJsonError("Missing fileName", 400);
    }

    if (fileSizeBytes == null || !Number.isFinite(fileSizeBytes)) {
      return apiJsonError("Missing fileSizeBytes", 400);
    }

    try {
      assertAllowedDeliverFileName(fileName);
    } catch {
      return apiJsonError("Only WAV or MP3 files are allowed.", 400);
    }

    try {
      assertUploadSizeBytes(fileSizeBytes);
    } catch {
      return apiJsonError(`File exceeds the ${MAX_UPLOAD_LABEL} upload limit.`, 400);
    }

    const clientResult = getServiceRoleClientOrApiError("[deliver-sign]", {
      orderId: orderId ?? "unknown",
    });
    if (!clientResult.ok) return clientResult.response;
    const supabase = clientResult.supabase;

    if (!isPublicSupabaseAnonKeyPresent()) {
      console.warn("[deliver-sign] NEXT_PUBLIC_SUPABASE_ANON_KEY missing in deployment env", {
        orderId,
        hint: "Studio upload uses the anon key in the browser for Storage XHR; add NEXT_PUBLIC_SUPABASE_ANON_KEY for Production and redeploy.",
      });
    }

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .select("id, delivery_access_token")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !orderRow) {
      console.error("[deliver-sign] order load failed", {
        orderId,
        message: orderErr?.message,
        code: orderErr?.code,
        details: orderErr?.details,
        hint: orderErr?.hint,
      });
      return apiJsonError("Order not found", 404);
    }

    let accessToken = orderRow.delivery_access_token as string | null;
    if (!accessToken?.trim()) {
      accessToken = generateDeliveryAccessToken();
      const { error: tokErr } = await supabase
        .from("orders")
        .update({ delivery_access_token: accessToken })
        .eq("id", orderId);
      if (tokErr) {
        console.error("[deliver-sign] token backfill failed", {
          orderId,
          message: tokErr.message,
          code: tokErr.code,
        });
        return apiJsonError("Could not prepare delivery link", 500);
      }
    }

    await ensureUploadBucketLimit();

    const objectPath = buildDeliverObjectPath(orderId, fileName);

    console.info("[deliver-sign] calling createSignedUploadUrl", {
      orderId,
      bucket: DELIVER_MASTER_BUCKET,
      pathPrefix: objectPath.slice(0, 96),
    });

    const { data: signData, error: signErr } = await supabase.storage
      .from(DELIVER_MASTER_BUCKET)
      .createSignedUploadUrl(objectPath, { upsert: false });

    if (signErr || !signData?.signedUrl) {
      const se = signErr as { statusCode?: string; status?: number } | null;
      console.error("[deliver-sign] createSignedUploadUrl failed", {
        orderId,
        bucket: DELIVER_MASTER_BUCKET,
        message: signErr?.message,
        statusCode: se?.statusCode,
        status: se?.status,
        pathPrefix: objectPath.slice(0, 96),
        hint: "Confirm Supabase bucket name matches DELIVER_MASTER_BUCKET and policies allow signed uploads (service role).",
      });
      const signMessage = signErr?.message?.trim() || "";
      const sizeLimited =
        signMessage.toLowerCase().includes("maximum allowed size") ||
        signMessage.toLowerCase().includes("entity too large");
      return apiJsonError(
        sizeLimited
          ? `File exceeds the ${MAX_UPLOAD_LABEL} upload limit. Check Storage bucket limits in Supabase.`
          : signMessage || "Could not create upload URL",
        sizeLimited ? 413 : 500,
      );
    }

    console.info("[deliver-sign] ok", {
      orderId,
      bucket: DELIVER_MASTER_BUCKET,
      pathPrefix: objectPath.slice(0, 96),
      signedUrlHost: (() => {
        try {
          return new URL(signData.signedUrl).host;
        } catch {
          return "invalid_signed_url";
        }
      })(),
    });

    return apiJsonSuccess({
      signedUrl: signData.signedUrl,
      objectPath,
      bucket: DELIVER_MASTER_BUCKET,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[deliver-sign] unhandled", {
      orderId,
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
