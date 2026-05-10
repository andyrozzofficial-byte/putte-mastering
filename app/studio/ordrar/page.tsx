import { OrdersTable } from "@/components/dashboard/orders-table";
import { studioOrdersAsRows } from "@/lib/studio-orders";

export default function OrdersPage() {
  const orders = studioOrdersAsRows();

  return (
    <main className="flex-1 px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-10 lg:px-12 lg:pt-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
            Ordrar
          </h1>
          <p className="text-sm text-gray-500">
            Öppna en order för att se kundfil, detaljer och leverans.
          </p>
        </header>
        <OrdersTable
          title="Alla ordrar"
          orders={orders}
          orderDetailBase="/studio/orders"
        />
      </div>
    </main>
  );
}
