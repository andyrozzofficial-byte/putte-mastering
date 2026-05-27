import { OrdersTable } from "@/components/dashboard/orders-table";
import { dbRowToOrderRow, fetchStudioOrders } from "@/lib/studio/orders-data";

export const dynamic = "force-dynamic";

export default function NewOrdersPage() {
  return (
    <main className="flex-1 px-4 pb-12 pt-5 md:px-7 md:pb-16 md:pt-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
        <header className="space-y-0.5">
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
            New orders
          </h1>
          <p className="text-[13px] text-gray-500 sm:text-sm">
            Orders that need attention right now.
          </p>
        </header>
        <NewOrdersTable />
      </div>
    </main>
  );
}

async function NewOrdersTable() {
  const rows = await fetchStudioOrders();
  const orders = rows
    .filter((row) => (row.status ?? "").toLowerCase().trim() === "new")
    .map(dbRowToOrderRow);

  return (
    <OrdersTable
      title="Incoming"
      orders={orders}
      orderDetailBase="/studio/orders"
      emptyStateText="No new orders yet. Incoming mastering projects will appear here."
    />
  );
}
