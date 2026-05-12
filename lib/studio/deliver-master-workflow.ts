import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { generateDeliveryAccessToken } from "@/lib/delivery/access-token";
import { escapeHtml } from "@/lib/email/escape-html";
import { getStudioNotifyEmail, sendResendEmail } from "@/lib/email/resend";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const DELIVER_MASTER_BUCKET = "uploads";

export function sanitizeDeliverMasterFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_|_$/g, "");
  return base.slice(0, 180) || "master";
}

export function buildDeliverObjectPath(orderId: string, fileName: string): string {
  return `deliveries/${orderId}/${crypto.randomUUID()}-${sanitizeDeliverMasterFileName(fileName)}`;
}

/** Ensures path is under this order only (no traversal). */
export function assertValidDeliverObjectPath(orderId: string, objectPath: string): void {
  const prefix = `deliveries/${orderId}/`;
  if (!objectPath.startsWith(prefix)) {
    throw new Error("INVALID_PATH");
  }
  const tail = objectPath.slice(prefix.length);
  if (!tail || tail.includes("..") || tail.includes("\\") || tail.includes("/")) {
    throw new Error("INVALID_PATH");
  }
}

export async function deliverMasterObjectExists(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  orderId: string,
  objectPath: string,
): Promise<boolean> {
  assertValidDeliverObjectPath(orderId, objectPath);
  const folder = `deliveries/${orderId}`;
  const fileName = objectPath.slice(folder.length + 1);
  const { data, error } = await supabase.storage.from(DELIVER_MASTER_BUCKET).list(folder, {
    limit: 1000,
  });
  if (error || !data) return false;
  return data.some((f) => f.name === fileName);
}

export function resolveDeliveryUrlForStudio(token: string, req: Request): string {
  let url = deliveryPortalAbsoluteUrl(token);
  if (!url.startsWith("http")) {
    const origin = req.headers.get("origin")?.trim();
    if (origin) url = `${origin}/delivery/${token}`;
  }
  return url;
}

const allowedExt = /\.(wav|mp3)$/i;

export function assertAllowedDeliverFileName(fileName: string): void {
  const trimmed = fileName.trim();
  if (!trimmed || !allowedExt.test(trimmed)) {
    throw new Error("INVALID_FILE_TYPE");
  }
}

export type FinalizeDeliverMasterResult = {
  deliveryUrl: string;
  masteredFile: string;
  version: number;
};

export async function finalizeDeliverMasterUpload(options: {
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>;
  orderId: string;
  objectPath: string;
  req: Request;
}): Promise<FinalizeDeliverMasterResult> {
  const { supabase, orderId, objectPath, req } = options;

  assertValidDeliverObjectPath(orderId, objectPath);

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .select("id, customer_email, track_name, delivery_access_token")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !orderRow) {
    throw new Error("ORDER_NOT_FOUND");
  }

  let accessToken = orderRow.delivery_access_token as string | null;
  if (!accessToken?.trim()) {
    accessToken = generateDeliveryAccessToken();
    const { error: tokErr } = await supabase
      .from("orders")
      .update({ delivery_access_token: accessToken })
      .eq("id", orderId);
    if (tokErr) {
      throw new Error("TOKEN_BACKFILL_FAILED");
    }
  }

  const masteredFile = `${DELIVER_MASTER_BUCKET}/${objectPath}`;

  const { data: maxVerRow } = await supabase
    .from("order_master_versions")
    .select("version")
    .eq("order_id", orderId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (maxVerRow?.version ?? 0) + 1;

  const { error: verInsErr } = await supabase.from("order_master_versions").insert({
    order_id: orderId,
    storage_ref: masteredFile,
    version: nextVersion,
  });

  if (verInsErr) {
    throw new Error("VERSION_INSERT_FAILED");
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      mastered_file: masteredFile,
      status: "completed",
      delivery_completed_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    throw new Error("ORDER_UPDATE_FAILED");
  }

  const deliveryUrl = resolveDeliveryUrlForStudio(accessToken, req);
  const trackLabel = (orderRow.track_name as string | null)?.trim() || "your track";
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
      html: `<p>A new master was uploaded for order <code>${escapeHtml(orderId)}</code> (version ${nextVersion}).</p>
<p>Customer link: <a href="${escapeHtml(deliveryUrl)}">${escapeHtml(deliveryUrl)}</a></p>`,
    });
  }

  return { deliveryUrl, masteredFile, version: nextVersion };
}
