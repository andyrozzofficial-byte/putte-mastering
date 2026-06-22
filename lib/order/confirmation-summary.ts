import { ORDER_PLANS } from "@/lib/order-plans";
import type { CheckoutSessionMetadata } from "@/lib/stripe/fulfill-checkout-session";

export type OrderConfirmationSummary = {
  trackName: string;
  service: string;
  fileName: string;
  deliveryTime: string;
};

function basenameFromStorageRef(ref: string): string {
  const trimmed = ref.trim();
  if (!trimmed) return "";
  const slash = trimmed.lastIndexOf("/");
  const base = slash >= 0 ? trimmed.slice(slash + 1) : trimmed;
  const dash = base.indexOf("-");
  if (dash > 0 && dash < base.length - 1) {
    return base.slice(dash + 1);
  }
  return base;
}

export function deliveryTimeLabelForService(service: string): string {
  const match = ORDER_PLANS.find((plan) => plan.title === service.trim());
  if (match?.title === "Express Master") return "24 hours";
  if (match?.title === "Standard Master") return "3 business days";
  const lower = service.toLowerCase();
  if (lower.includes("express")) return "24 hours";
  return "3 business days";
}

export function buildOrderConfirmationSummary(
  fields: CheckoutSessionMetadata,
): OrderConfirmationSummary {
  const uploadedName = basenameFromStorageRef(fields.uploaded_file);
  const trackName = fields.track_name.trim() || uploadedName || "Your track";
  const service = fields.service.trim() || "Mastering";

  return {
    trackName,
    service,
    fileName: uploadedName || trackName,
    deliveryTime: deliveryTimeLabelForService(service),
  };
}
