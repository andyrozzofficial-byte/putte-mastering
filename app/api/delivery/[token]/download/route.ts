import { apiJsonError } from "@/lib/api/json-response";
import { NextResponse } from "next/server";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

function parseStorageRef(ref: string): { bucket: string; path: string } {
  const slash = ref.indexOf("/");
  const bucket = slash >= 0 ? ref.slice(0, slash) : "uploads";
  const path = slash >= 0 ? ref.slice(slash + 1) : ref;
  return { bucket, path };
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await ctx.params;
    const t = decodeURIComponent(token).trim();
    if (!t) {
      return apiJsonError("Invalid link", 403);
    }

    const url = new URL(req.url);
    const versionParam = url.searchParams.get("version");

    const supabase = createServiceRoleSupabaseClient();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, delivery_access_token, mastered_file")
      .eq("delivery_access_token", t)
      .maybeSingle();

    if (orderErr || !order?.delivery_access_token) {
      return apiJsonError("Invalid link", 403);
    }

    let storageRef: string | null = null;

    if (versionParam != null && /^\d+$/.test(versionParam)) {
      const v = Number.parseInt(versionParam, 10);
      const { data: row } = await supabase
        .from("order_master_versions")
        .select("storage_ref")
        .eq("order_id", order.id)
        .eq("version", v)
        .maybeSingle();
      storageRef = row?.storage_ref ?? null;
    } else {
      const { data: latest } = await supabase
        .from("order_master_versions")
        .select("storage_ref")
        .eq("order_id", order.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      storageRef = latest?.storage_ref ?? (order.mastered_file as string | null);
    }

    if (!storageRef) {
      return apiJsonError("No master available", 404);
    }

    const { bucket, path } = parseStorageRef(storageRef);
    if (!path?.trim()) {
      console.error("[delivery-download] empty storage path after parse", {
        storageRefPrefix: storageRef.slice(0, 120),
      });
      return apiJsonError("No master available", 404);
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 10);

    if (signError || !signed?.signedUrl) {
      console.error("[delivery-download] signed url failed", {
        message: signError?.message,
        bucket,
        pathPrefix: path.slice(0, 64),
      });
      return apiJsonError("Could not create download link", 500);
    }

    const { error: rpcErr } = await supabase.rpc(
      "increment_order_delivery_download",
      { p_order_id: order.id },
    );
    if (rpcErr) {
      console.error("[delivery-download] increment counter failed", {
        message: rpcErr.message,
        code: rpcErr.code,
      });
    }

    return NextResponse.redirect(signed.signedUrl, { status: 302 });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[delivery-download] unhandled", {
      message: err.message,
      stack: err.stack,
    });
    return apiJsonError("Server error", 500);
  }
}
