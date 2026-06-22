"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OrderRowActions } from "./order-row-actions";
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
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());

  const visibleOrders = orders.filter((order) => !removedIds.has(order.id));

  function handleDeleted(orderId: string) {
    setRemovedIds((current) => new Set(current).add(orderId));
  }

  if (visibleOrders.length === 0) {
    return (
      <tr>
        <td
          colSpan={7}
          className="px-5 py-14 text-center text-[13px] text-gray-500 sm:text-sm"
        >
          No orders in this list.
        </td>
      </tr>
    );
  }

  return (
    <>
      {visibleOrders.map((order, i) => (
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
            borderedRows && i < visibleOrders.length - 1
              ? "border-b border-gray-100"
              : ""
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
            <OrderRowActions
              orderId={order.id}
              orderLabel={order.trackName}
              onDeleted={handleDeleted}
            />
          </td>
        </tr>
      ))}
    </>
  );
}
