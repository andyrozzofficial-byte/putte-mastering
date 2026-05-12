import { OrdersTable } from "@/components/dashboard/orders-table";
import { dbRowToOrderRow, fetchStudioOrders } from "@/lib/studio/orders-data";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const rows = await fetchStudioOrders();
  const orders = rows.map(dbRowToOrderRow);

  return (
    <main className="flex-1 px-4 pb-12 pt-5 md:px-7 md:pb-16 md:pt-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
        <header className="space-y-0.5">
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
            Orders
          </h1>
          <p className="text-[13px] text-gray-500 sm:text-sm">
            Open an order to view the source file, details, and delivery.
          </p>
        </header>
        <OrdersTable
          title="All orders"
          orders={orders}
          orderDetailBase="/studio/orders"
        />
      </div>
    </main>
  );
}
