import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import { generateDeliveryAccessToken } from "@/lib/delivery/access-token";
import {
  assertAllowedDeliverFileName,
  buildDeliverObjectPath,
  DELIVER_MASTER_BUCKET,
} from "@/lib/studio/deliver-master-workflow";
import { requireStudioSessionUser } from "@/lib/supabase/studio-api-auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

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

    if (!fileName?.trim()) {
      return apiJsonError("Missing fileName", 400);
    }

    try {
      assertAllowedDeliverFileName(fileName);
    } catch {
      return apiJsonError("Only WAV or MP3 files are allowed.", 400);
    }

    const supabase = createServiceRoleSupabaseClient();

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

    const objectPath = buildDeliverObjectPath(orderId, fileName);

    const { data: signData, error: signErr } = await supabase.storage
      .from(DELIVER_MASTER_BUCKET)
      .createSignedUploadUrl(objectPath, { upsert: false });

    if (signErr || !signData?.signedUrl) {
      console.error("[deliver-sign] createSignedUploadUrl failed", {
        orderId,
        message: signErr?.message,
        pathPrefix: objectPath.slice(0, 80),
      });
      return apiJsonError(
        signErr?.message?.trim() || "Could not create upload URL",
        500,
      );
    }

    console.info("[deliver-sign] ok", { orderId, pathPrefix: objectPath.slice(0, 64) });

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
