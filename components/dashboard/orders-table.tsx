import { OrdersTableRows, type OrderTableRowModel } from "./orders-table-rows";

export type OrderRow = OrderTableRowModel;

type OrdersTableProps = {
  title: string;
  orders: OrderRow[];
  /** e.g. `/studio/orders` — row navigates here + /id */
  orderDetailBase?: string;
};

export function OrdersTable({
  title,
  orders,
  orderDetailBase = "/studio/orders",
}: OrdersTableProps) {
  const hasOrders = orders.length > 0;

  return (
    <section className="space-y-3">
      <h2 className="text-[15px] font-semibold tracking-tight text-black sm:text-base">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {hasOrders ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px] sm:min-w-[840px] sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-2.5 font-medium text-gray-500 sm:px-5">
                    Kund
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-500 sm:px-5">
                    Spår
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-500 sm:px-5">
                    Tjänst
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-500 sm:px-5">
                    Status
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-500 sm:px-5">
                    Pris
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-500 sm:px-5">
                    Datum
                  </th>
                  <th className="px-2 py-2.5 font-medium text-gray-400 sm:px-3">
                    <span className="sr-only">Åtgärder</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <OrdersTableRows
                  orders={orders}
                  orderDetailBase={orderDetailBase}
                  borderedRows
                />
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-14 text-center text-[13px] text-gray-500 sm:px-6 sm:text-sm">
            Inga ordrar ännu
          </p>
        )}
      </div>
    </section>
  );
}
