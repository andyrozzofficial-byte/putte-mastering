import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import {
  assertValidDeliverObjectPath,
  deliverMasterObjectExists,
  finalizeDeliverMasterUpload,
} from "@/lib/studio/deliver-master-workflow";
import { getServiceRoleClientOrApiError } from "@/lib/supabase/server-supabase-env";
import { requireStudioSessionUser } from "@/lib/supabase/studio-api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function finalizeErrorToResponse(code: string): { status: number; message: string } {
  switch (code) {
    case "ORDER_NOT_FOUND":
      return { status: 404, message: "Order not found" };
    case "TOKEN_BACKFILL_FAILED":
      return { status: 500, message: "Could not prepare delivery link" };
    case "VERSION_QUERY_FAILED":
      return { status: 500, message: "Could not read master version history" };
    case "VERSION_CONFLICT":
      return {
        status: 409,
        message: "This upload was already recorded. Refresh the order page and try again if needed.",
      };
    case "VERSION_INSERT_FAILED":
      return { status: 500, message: "Could not record master version" };
    case "ORDER_UPDATE_FAILED":
      return { status: 500, message: "Could not update order" };
    default:
      return { status: 500, message: "Could not complete delivery" };
  }
}

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
    console.info("[deliver-complete] request", { orderId });

    let body: unknown;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.warn("[deliver-complete] invalid JSON", {
        orderId,
        message: parseErr instanceof Error ? parseErr.message : String(parseErr),
      });
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
      console.warn("[deliver-complete] missing objectPath", { orderId });
      return apiJsonError("Missing objectPath", 400);
    }

    try {
      assertValidDeliverObjectPath(orderId, objectPath);
    } catch {
      console.warn("[deliver-complete] invalid object path shape", {
        orderId,
        pathPrefix: objectPath.slice(0, 120),
      });
      return apiJsonError("Invalid object path", 400);
    }

    const clientResult = getServiceRoleClientOrApiError("[deliver-complete]", {
      orderId: orderId ?? "unknown",
    });
    if (!clientResult.ok) return clientResult.response;
    const supabase = clientResult.supabase;

    const exists = await deliverMasterObjectExists(supabase, orderId, objectPath);
    if (!exists) {
      console.warn("[deliver-complete] object not verified in storage", {
        orderId,
        pathPrefix: objectPath.slice(0, 120),
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
      console.error("[deliver-complete] finalize threw", {
        orderId,
        code,
        stack: e instanceof Error ? e.stack : undefined,
      });
      const mapped = finalizeErrorToResponse(code);
      return apiJsonError(mapped.message, mapped.status);
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
    console.error("[deliver-complete] unhandled outer", {
      orderId,
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
