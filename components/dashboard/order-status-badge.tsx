export type OrderStatus = "ny" | "in_progress" | "klar";

const styles: Record<OrderStatus, string> = {
  ny: "bg-gray-100 text-gray-700",
  in_progress: "bg-[var(--accent-warm-strong)] text-amber-950/90",
  klar: "bg-emerald-50 text-emerald-900",
};

const labels: Record<OrderStatus, string> = {
  ny: "New",
  in_progress: "In progress",
  klar: "Completed",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:text-xs ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
