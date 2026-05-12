import { StatCard } from "@/components/dashboard/stat-card";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { Button } from "@/components/ui/button";
import {
  computeDashboardStats,
  dbRowToOrderRow,
  fetchStudioOrders,
  formatKr,
} from "@/lib/studio/orders-data";

export const dynamic = "force-dynamic";

const RECENT_LIMIT = 15;

export default async function OverviewPage() {
  const rows = await fetchStudioOrders();
  const stats = computeDashboardStats(rows);
  const recentOrders = rows.slice(0, RECENT_LIMIT).map(dbRowToOrderRow);

  const statCards = [
    {
      label: "Total orders",
      value: String(stats.total),
      hint: "All time",
    },
    {
      label: "New orders",
      value: String(stats.newOrders),
      hint: "Needs attention",
    },
    {
      label: "Completed orders",
      value: String(stats.completed),
      hint: "Delivered",
    },
    {
      label: "Revenue",
      value: formatKr(stats.revenueKr),
      hint: "Sum of prices",
    },
  ] as const;

  return (
    <main className="flex-1 px-4 pb-10 pt-5 md:px-7 md:pb-14 md:pt-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-6xl space-y-8 lg:space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-0.5">
            <h1 className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
              Overview
            </h1>
            <p className="text-[13px] text-gray-500 sm:text-sm">
              Your studio — manual mastering, no shortcuts.
            </p>
          </div>
          <Button type="button" className="shrink-0 self-stretch sm:self-auto">
            <span className="text-base leading-none sm:text-[15px]">+</span>
            New order
          </Button>
        </header>

        <section aria-label="Nyckeltal">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </section>

        <OrdersTable
          title="Recent orders"
          orders={recentOrders}
          orderDetailBase="/studio/orders"
        />
      </div>
    </main>
  );
}
