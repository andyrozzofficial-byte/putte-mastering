import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { generateDeliveryAccessToken } from "@/lib/delivery/access-token";
import { escapeHtml } from "@/lib/email/escape-html";
import { getStudioNotifyEmail, sendResendEmail } from "@/lib/email/resend";
import { renderBrandedEmail } from "@/lib/email/templates";
import { logPostgrestError } from "@/lib/studio/postgrest-log";
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

async function probeObjectReadableBySignedUrl(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  objectPath: string,
): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(DELIVER_MASTER_BUCKET)
    .createSignedUrl(objectPath, 120);

  if (error) {
    console.warn("[deliver-storage] probe createSignedUrl failed", {
      message: error.message,
      pathPrefix: objectPath.slice(0, 96),
    });
    return false;
  }
  if (!data?.signedUrl) return false;

  try {
    const head = await fetch(data.signedUrl, { method: "HEAD", cache: "no-store" });
    if (head.ok) {
      console.info("[deliver-storage] probe HEAD ok", { pathPrefix: objectPath.slice(0, 96) });
      return true;
    }
    if (head.status === 405 || head.status === 501) {
      const ranged = await fetch(data.signedUrl, {
        headers: { Range: "bytes=0-0" },
        cache: "no-store",
      });
      const ok = ranged.ok || ranged.status === 206;
      if (ok) {
        console.info("[deliver-storage] probe GET range ok", {
          pathPrefix: objectPath.slice(0, 96),
        });
      }
      return ok;
    }
    console.warn("[deliver-storage] probe HEAD not ok", {
      status: head.status,
      pathPrefix: objectPath.slice(0, 96),
    });
    return false;
  } catch (e) {
    console.warn("[deliver-storage] probe fetch threw", {
      message: e instanceof Error ? e.message : String(e),
      pathPrefix: objectPath.slice(0, 96),
    });
    return false;
  }
}

async function listContainsObjectName(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  folder: string,
  fileName: string,
): Promise<{ found: boolean; listError?: string }> {
  const pageSize = 1000;
  for (let offset = 0; offset < 50_000; offset += pageSize) {
    const { data, error } = await supabase.storage.from(DELIVER_MASTER_BUCKET).list(folder, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) {
      console.error("[deliver-storage] list failed", {
        message: error.message,
        folder,
        offset,
      });
      return { found: false, listError: error.message };
    }
    const rows = data ?? [];
    if (rows.length === 0) break;
    const hit = rows.some((f) => {
      const isFile = f.metadata != null || f.id != null;
      return (
        isFile &&
        typeof f.name === "string" &&
        (f.name === fileName || f.name.toLowerCase() === fileName.toLowerCase())
      );
    });
    if (hit) {
      console.info("[deliver-storage] list matched object", {
        folder,
        filePrefix: fileName.slice(0, 64),
        offset,
      });
      return { found: true };
    }
    if (rows.length < pageSize) break;
  }
  return { found: false };
}

/**
 * Verifies the object exists and is readable before we write DB rows.
 * Uses signed-URL HEAD/GET first (matches download path), then storage list as fallback.
 */
export async function deliverMasterObjectExists(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  orderId: string,
  objectPath: string,
): Promise<boolean> {
  try {
    assertValidDeliverObjectPath(orderId, objectPath);
  } catch {
    console.warn("[deliver-storage] exists check: invalid path", {
      orderId,
      pathPrefix: objectPath.slice(0, 96),
    });
    return false;
  }

  console.info("[deliver-storage] exists check start", {
    orderId,
    pathPrefix: objectPath.slice(0, 96),
  });

  if (await probeObjectReadableBySignedUrl(supabase, objectPath)) {
    return true;
  }

  const folder = `deliveries/${orderId}`;
  const fileName = objectPath.slice(folder.length + 1);
  const { found, listError } = await listContainsObjectName(supabase, folder, fileName);
  if (found) return true;

  const { found: foundSearch } = await listContainsObjectNameWithSearch(
    supabase,
    folder,
    fileName,
  );
  if (foundSearch) return true;

  console.warn("[deliver-storage] object not found by probe or list", {
    orderId,
    folder,
    filePrefix: fileName.slice(0, 80),
    listError,
  });
  return false;
}

/** List API `search` filters names by prefix (Supabase Storage). */
async function listContainsObjectNameWithSearch(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  folder: string,
  fileName: string,
): Promise<{ found: boolean }> {
  const prefix =
    fileName.length > 64 ? fileName.slice(0, 64) : fileName.slice(0, Math.max(1, fileName.length));
  const { data, error } = await supabase.storage.from(DELIVER_MASTER_BUCKET).list(folder, {
    limit: 1000,
    offset: 0,
    search: prefix,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) {
    console.warn("[deliver-storage] list+search failed", { message: error.message, folder });
    return { found: false };
  }
  const hit = (data ?? []).some((f) => {
    const isFile = f.metadata != null || f.id != null;
    return (
      isFile &&
      typeof f.name === "string" &&
      (f.name === fileName || f.name.toLowerCase() === fileName.toLowerCase())
    );
  });
  if (hit) {
    console.info("[deliver-storage] list+search matched object", { folder, search: prefix });
  }
  return { found: hit };
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

  console.info("[finalize] start", {
    orderId,
    pathPrefix: objectPath.slice(0, 96),
  });

  assertValidDeliverObjectPath(orderId, objectPath);

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .select("id, customer_email, track_name, delivery_access_token")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr) {
    logPostgrestError("[finalize] orders select failed", orderErr, { orderId });
    throw new Error("ORDER_NOT_FOUND");
  }
  if (!orderRow) {
    console.warn("[finalize] order row missing", { orderId });
    throw new Error("ORDER_NOT_FOUND");
  }

  let accessToken = orderRow.delivery_access_token as string | null;
  if (!accessToken?.trim()) {
    accessToken = generateDeliveryAccessToken();
    console.info("[finalize] backfilling delivery_access_token", { orderId });
    const { error: tokErr } = await supabase
      .from("orders")
      .update({ delivery_access_token: accessToken })
      .eq("id", orderId);
    if (tokErr) {
      logPostgrestError("[finalize] delivery token backfill failed", tokErr, { orderId });
      throw new Error("TOKEN_BACKFILL_FAILED");
    }
  }

  const masteredFile = `${DELIVER_MASTER_BUCKET}/${objectPath}`;
  console.info("[finalize] mastered_file ref", { orderId, masteredFilePrefix: masteredFile.slice(0, 120) });

  const { data: maxVerRow, error: maxVerErr } = await supabase
    .from("order_master_versions")
    .select("version")
    .eq("order_id", orderId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxVerErr) {
    logPostgrestError("[finalize] max version select failed", maxVerErr, { orderId });
    throw new Error("VERSION_QUERY_FAILED");
  }

  const nextVersion = (maxVerRow?.version ?? 0) + 1;
  console.info("[finalize] inserting order_master_versions", { orderId, nextVersion });

  const { error: verInsErr } = await supabase.from("order_master_versions").insert({
    order_id: orderId,
    storage_ref: masteredFile,
    version: nextVersion,
  });

  if (verInsErr) {
    logPostgrestError("[finalize] order_master_versions insert failed", verInsErr, {
      orderId,
      nextVersion,
      storageRefPrefix: masteredFile.slice(0, 120),
    });
    if (verInsErr.code === "23505") {
      throw new Error("VERSION_CONFLICT");
    }
    throw new Error("VERSION_INSERT_FAILED");
  }

  console.info("[finalize] updating orders row", { orderId, status: "completed" });

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      mastered_file: masteredFile,
      status: "completed",
      delivery_completed_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    logPostgrestError("[finalize] orders update failed", updateError, {
      orderId,
      masteredFilePrefix: masteredFile.slice(0, 120),
    });
    throw new Error("ORDER_UPDATE_FAILED");
  }

  const deliveryUrl = resolveDeliveryUrlForStudio(accessToken, req);
  const trackLabel = (orderRow.track_name as string | null)?.trim() || "your track";
  const customerEmail = (orderRow.customer_email as string | null)?.trim();

  console.info("[finalize] sending notifications", {
    orderId,
    hasCustomerEmail: !!customerEmail,
    deliveryUrl,
    deliveryUrlHost: (() => {
      try {
        return new URL(deliveryUrl).host;
      } catch {
        return "relative";
      }
    })(),
  });

  if (customerEmail) {
    try {
      const result = await sendResendEmail({
        to: customerEmail,
        subject: "Your master is ready – First Listen Mastering",
        html: renderBrandedEmail({
          title: "Your master is ready",
          intro: `Your master for ${trackLabel} is ready to download.`,
          ctaLabel: "Download master",
          ctaUrl: deliveryUrl,
          meta: [
            { label: "Status", value: "Completed" },
            { label: "Track", value: trackLabel },
          ],
          footerEmail: "studio@firstlistenmastering.com",
        }),
      });
      console.info("[EMAIL SENT] deliver-finalize customer", {
        ok: result.ok,
        reason: result.ok ? undefined : result.reason,
        to: `${customerEmail.slice(0, 2)}…`,
      });
    } catch (err) {
      console.error("[EMAIL FAILED] deliver-finalize customer", err);
    }
  }

  const notify = getStudioNotifyEmail();
  if (notify) {
    try {
      const result = await sendResendEmail({
        to: notify,
        subject: `Master uploaded — ${trackLabel}`,
        html: renderBrandedEmail({
          title: `Master uploaded — ${trackLabel}`,
          intro: `A new master was uploaded for order ${orderId} (version ${nextVersion}).`,
          ctaLabel: "Open delivery page",
          ctaUrl: deliveryUrl,
          meta: [
            { label: "Order", value: orderId.slice(0, 8) },
            { label: "Version", value: String(nextVersion) },
          ],
          footerEmail: "studio@firstlistenmastering.com",
        }),
      });
      console.info("[EMAIL SENT] deliver-finalize notify", {
        ok: result.ok,
        reason: result.ok ? undefined : result.reason,
        to: `${notify.slice(0, 2)}…`,
      });
    } catch (err) {
      console.error("[EMAIL FAILED] deliver-finalize notify", err);
    }
  }

  console.info("[finalize] done", { orderId, version: nextVersion });

  return { deliveryUrl, masteredFile, version: nextVersion };
}
