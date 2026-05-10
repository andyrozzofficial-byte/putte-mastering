"use client";

import { useRouter } from "next/navigation";

import { OrderStatusBadge, type OrderStatus } from "./order-status-badge";

export type OrderTableRowModel = {
  id: string;
  customer: string;
  trackName: string;
  service: string;
  status: OrderStatus;
  price: string;
  date: string;
};

function RowActions() {
  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
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

type OrdersTableRowsProps = {
  orders: OrderTableRowModel[];
  orderDetailBase: string;
  borderedRows: boolean;
};

export function OrdersTableRows({
  orders,
  orderDetailBase,
  borderedRows,
}: OrdersTableRowsProps) {
  const router = useRouter();

  return (
    <>
      {orders.map((order, i) => (
        <tr
          key={order.id}
          role="link"
          tabIndex={0}
          onClick={() => router.push(`${orderDetailBase}/${order.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push(`${orderDetailBase}/${order.id}`);
            }
          }}
          className={`cursor-pointer transition-colors hover:bg-gray-50/80 focus-visible:bg-gray-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/10 ${
            borderedRows && i < orders.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          <td className="px-4 py-3 text-gray-800 sm:px-5">{order.customer}</td>
          <td className="px-4 py-3 font-medium text-black sm:px-5">
            {order.trackName}
          </td>
          <td className="px-4 py-3 text-gray-700 sm:px-5">{order.service}</td>
          <td className="px-4 py-3 sm:px-5">
            <OrderStatusBadge status={order.status} />
          </td>
          <td className="px-4 py-3 tabular-nums text-gray-700 sm:px-5">
            {order.price}
          </td>
          <td className="px-4 py-3 tabular-nums text-gray-600 sm:px-5">
            {order.date}
          </td>
          <td className="px-1.5 py-2.5 text-right sm:px-2">
            <RowActions />
          </td>
        </tr>
      ))}
    </>
  );
}
