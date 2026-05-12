import { NextResponse } from "next/server";

import { verifyDeliveryToken } from "@/lib/delivery/token";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? "";

    if (!token || !verifyDeliveryToken(id, token)) {
      return NextResponse.json({ error: "Invalid link" }, { status: 403 });
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("mastered_file")
      .eq("id", id)
      .maybeSingle();

    if (error || !data?.mastered_file) {
      return NextResponse.json({ error: "No master available" }, { status: 404 });
    }

    const ref = data.mastered_file;
    const slash = ref.indexOf("/");
    const bucket = slash >= 0 ? ref.slice(0, slash) : "uploads";
    const path = slash >= 0 ? ref.slice(slash + 1) : ref;

    const { data: signed, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 10);

    if (signError || !signed?.signedUrl) {
      console.error("[delivery-download] signed url failed", {
        id,
        message: signError?.message,
      });
      return NextResponse.json({ error: "Could not create download link" }, { status: 500 });
    }

    return NextResponse.redirect(signed.signedUrl, { status: 302 });
  } catch (e) {
    console.error("[delivery-download] unhandled", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

