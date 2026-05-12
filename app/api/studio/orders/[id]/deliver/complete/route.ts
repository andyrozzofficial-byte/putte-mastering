import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import {
  assertValidDeliverObjectPath,
  deliverMasterObjectExists,
  finalizeDeliverMasterUpload,
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
      console.warn("[deliver-complete] unauthorized", { hasSessionError: !!auth.error });
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

    const objectPath =
      typeof body === "object" &&
      body !== null &&
      "objectPath" in body &&
      typeof (body as { objectPath: unknown }).objectPath === "string"
        ? (body as { objectPath: string }).objectPath.trim()
        : "";

    if (!objectPath) {
      return apiJsonError("Missing objectPath", 400);
    }

    try {
      assertValidDeliverObjectPath(orderId, objectPath);
    } catch {
      return apiJsonError("Invalid object path", 400);
    }

    const supabase = createServiceRoleSupabaseClient();

    const exists = await deliverMasterObjectExists(supabase, orderId, objectPath);
    if (!exists) {
      console.warn("[deliver-complete] object not in storage", {
        orderId,
        pathPrefix: objectPath.slice(0, 80),
      });
      return apiJsonError(
        "Upload not found in storage yet. Wait for the upload to finish, then try again.",
        400,
      );
    }

    let result;
    try {
      result = await finalizeDeliverMasterUpload({
        supabase,
        orderId,
        objectPath,
        req,
      });
    } catch (e) {
      const code = e instanceof Error ? e.message : String(e);
      if (code === "ORDER_NOT_FOUND") {
        return apiJsonError("Order not found", 404);
      }
      console.error("[deliver-complete] finalize failed", { orderId, code });
      return apiJsonError("Could not complete delivery", 500);
    }

    console.info("[deliver-complete] success", {
      orderId,
      version: result.version,
      pathPrefix: objectPath.slice(0, 64),
    });

    return apiJsonSuccess({
      deliveryUrl: result.deliveryUrl,
      masteredFile: result.masteredFile,
      version: result.version,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[deliver-complete] unhandled", {
      orderId,
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
