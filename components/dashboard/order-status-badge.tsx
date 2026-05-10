export type OrderStatus = "ny" | "in_progress" | "klar";

const styles: Record<OrderStatus, string> = {
  ny: "bg-gray-100 text-gray-700",
  in_progress: "bg-[var(--accent-warm-strong)] text-amber-950/90",
  klar: "bg-emerald-50 text-emerald-900",
};

const labels: Record<OrderStatus, string> = {
  ny: "Ny",
  in_progress: "Pågår",
  klar: "Klar",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
