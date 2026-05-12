import { NextResponse } from "next/server";
import { createStudioServerClient } from "@/lib/supabase/studio-server";

type Body = {
  status: "new" | "in_progress" | "waiting_revision" | "completed";
};

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Partial<Body>;
    const status = body.status;
    if (
      status !== "new" &&
      status !== "in_progress" &&
      status !== "waiting_revision" &&
      status !== "completed"
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = await createStudioServerClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      console.error("[studio-status] update failed", {
        id,
        status,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status });
  } catch (e) {
    console.error("[studio-status] unhandled", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

