export type OrderStatus =
  | "new"
  | "in_progress"
  | "waiting_revision"
  | "completed";

const styles: Record<OrderStatus, string> = {
  new: "bg-gray-100 text-gray-700",
  in_progress: "bg-[var(--accent-warm-strong)] text-amber-950/90",
  waiting_revision: "bg-blue-50 text-blue-900",
  completed: "bg-emerald-50 text-emerald-900",
};

const labels: Record<OrderStatus, string> = {
  new: "New",
  in_progress: "In progress",
  waiting_revision: "Waiting revision",
  completed: "Completed",
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
