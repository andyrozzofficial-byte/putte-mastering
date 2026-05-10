import { OrderStatusBadge, type OrderStatus } from "./order-status-badge";

export type OrderRow = {
  id: string;
  customer: string;
  service: string;
  status: OrderStatus;
  date: string;
};

type OrdersTableProps = {
  title: string;
  orders: OrderRow[];
};

function RowActions() {
  return (
    <button
      type="button"
      className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
      aria-label="Fler åtgärder"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    </button>
  );
}

export function OrdersTable({ title, orders }: OrdersTableProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-black">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-3 font-medium text-gray-500">Order</th>
                <th className="px-5 py-3 font-medium text-gray-500">Kund</th>
                <th className="px-5 py-3 font-medium text-gray-500">
                  Tjänst
                </th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500">Datum</th>
                <th className="px-3 py-3 font-medium text-gray-400">
                  <span className="sr-only">Åtgärder</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className={
                    i < orders.length - 1 ? "border-b border-gray-100" : ""
                  }
                >
                  <td className="px-5 py-4 font-medium text-black">
                    {order.id}
                  </td>
                  <td className="px-5 py-4 text-gray-800">{order.customer}</td>
                  <td className="px-5 py-4 text-gray-700">{order.service}</td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 tabular-nums text-gray-600">
                    {order.date}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <RowActions />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
