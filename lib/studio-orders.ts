import type { OrderStatus } from "@/components/dashboard/order-status-badge";
import type { OrderRow } from "@/components/dashboard/orders-table";

export type StudioOrderDetail = {
  slug: string;
  label: string;
  status: OrderStatus;
  customerShort: string;
  customerName: string;
  customerEmail: string;
  orderedAt: string;
  dateRelative: string;
  service: string;
  price: string;
  customerNote: string | null;
  sourceFile: {
    name: string;
    sizeLabel: string;
    durationLabel: string;
    formatLabel: string;
  };
};

const orders: Record<string, StudioOrderDetail> = {
  "1023": {
    slug: "1023",
    label: "Order #1023",
    status: "ny",
    customerShort: "Andreas L.",
    customerName: "Andreas Larsson",
    customerEmail: "andreas@example.com",
    orderedAt: "2026-05-10",
    dateRelative: "Idag 16:02",
    service: "Standard Master",
    price: "1 500 kr",
    customerNote:
      "Vill behålla lite mer dynamik i versen — inte för hård limitering på refrengen.",
    sourceFile: {
      name: "andreas_track_mix_v3.wav",
      sizeLabel: "48 MB",
      durationLabel: "3:42",
      formatLabel: "24-bit / 48 kHz stereo WAV",
    },
  },
  "1022": {
    slug: "1022",
    label: "Order #1022",
    status: "in_progress",
    customerShort: "Marcus J.",
    customerName: "Marcus Johansson",
    customerEmail: "marcus.j@example.com",
    orderedAt: "2026-05-10",
    dateRelative: "Idag 13:48",
    service: "Premium Master",
    price: "2 000 kr",
    customerNote: null,
    sourceFile: {
      name: "MJ_EP02_master_ready.aiff",
      sizeLabel: "62 MB",
      durationLabel: "4:08",
      formatLabel: "24-bit / 44.1 kHz stereo AIFF",
    },
  },
  "1021": {
    slug: "1021",
    label: "Order #1021",
    status: "klar",
    customerShort: "Erik N.",
    customerName: "Erik Nilsson",
    customerEmail: "erik.nilsson@example.com",
    orderedAt: "2026-05-09",
    dateRelative: "Igår 22:10",
    service: "Standard Master",
    price: "1 500 kr",
    customerNote: "Tack för snabb leverans senast!",
    sourceFile: {
      name: "single_final_mix.wav",
      sizeLabel: "41 MB",
      durationLabel: "2:55",
      formatLabel: "24-bit / 48 kHz stereo WAV",
    },
  },
};

export function getStudioOrder(slug: string): StudioOrderDetail | undefined {
  return orders[slug];
}

export function studioOrdersAsRows(): OrderRow[] {
  return Object.values(orders).map((o) => ({
    id: o.label,
    customer: o.customerShort,
    service: o.service,
    status: o.status,
    date: o.dateRelative,
  }));
}
