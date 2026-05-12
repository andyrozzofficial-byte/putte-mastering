import { NextResponse } from "next/server";

import { createDeliveryToken } from "@/lib/delivery/token";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

const BUCKET = "uploads";

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_|_$/g, "");
  return base.slice(0, 180) || "master";
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const objectPath = `deliveries/${id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const supabase = createServiceRoleSupabaseClient();

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
      });
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 },
      );
    }

    const mastered_file = `${BUCKET}/${objectPath}`;
    const { error: updateError } = await supabase
      .from("orders")
      .update({ mastered_file, status: "completed" })
      .eq("id", id);

    if (updateError) {
      console.error("[deliver] order update failed", {
        id,
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
      });
      return NextResponse.json(
        { error: "Could not update order" },
        { status: 500 },
      );
    }

    const token = createDeliveryToken(id);
    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const deliveryUrl = `${origin}/delivery/${id}?token=${token}`;

    return NextResponse.json({ ok: true, mastered_file, deliveryUrl });
  } catch (e) {
    console.error("[deliver] unhandled", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

