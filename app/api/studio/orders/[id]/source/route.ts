import { apiJsonError } from "@/lib/api/json-response";
import {
  basenameFromStoragePath,
  buildContentDispositionAttachment,
  guessAudioContentType,
} from "@/lib/delivery/download-headers";
import { parseStorageRef } from "@/lib/storage/parse-storage-ref";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { requireStudioSessionUser } from "@/lib/supabase/studio-api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await requireStudioSessionUser();
    if (!user) {
      return apiJsonError("Unauthorized", 401);
    }

    const { id } = await ctx.params;
    const orderId = id.trim();
    if (!orderId) {
      return apiJsonError("Missing order id", 400);
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("uploaded_file")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr) {
      console.error("[studio-source] order lookup failed", {
        orderId,
        message: orderErr.message,
        code: orderErr.code,
      });
      return apiJsonError("Could not load order", 500);
    }

    const storageRef = (order?.uploaded_file ?? "").trim();
    if (!storageRef) {
      return apiJsonError("No source file", 404);
    }

    const { bucket, path } = parseStorageRef(storageRef);
    if (!path) {
      console.error("[studio-source] empty storage path", {
        orderId,
        storageRefPrefix: storageRef.slice(0, 120),
      });
      return apiJsonError("No source file", 404);
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 10);

    if (signError || !signed?.signedUrl) {
      console.error("[studio-source] signed url failed", {
        orderId,
        message: signError?.message,
        bucket,
        pathPrefix: path.slice(0, 64),
      });
      return apiJsonError("Could not create source file link", 500);
    }

    const range = req.headers.get("range");
    const upstream = await fetch(signed.signedUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "*/*",
        ...(range ? { Range: range } : {}),
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      console.error("[studio-source] upstream fetch failed", {
        orderId,
        status: upstream.status,
        bucket,
        pathPrefix: path.slice(0, 64),
      });
      return apiJsonError("Could not fetch source file", 502);
    }

    const downloadName = basenameFromStoragePath(path);
    const forceDownload = new URL(req.url).searchParams.get("download") === "1";
    const upstreamCt = upstream.headers.get("content-type");
    const contentType =
      upstreamCt?.split(";")[0]?.trim() || guessAudioContentType(downloadName);

    const headers = new Headers();
    if (forceDownload) {
      headers.set("Content-Disposition", buildContentDispositionAttachment(downloadName));
    } else {
      headers.set("Content-Disposition", "inline");
    }
    headers.set("Content-Type", contentType || guessAudioContentType(downloadName));
    headers.set("Cache-Control", "private, no-store");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) {
      headers.set("Accept-Ranges", acceptRanges);
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[studio-source] unhandled", {
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
