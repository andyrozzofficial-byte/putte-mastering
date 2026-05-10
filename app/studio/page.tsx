import { StatCard } from "@/components/dashboard/stat-card";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { Button } from "@/components/ui/button";
import { studioOrdersAsRows } from "@/lib/studio-orders";

const stats = [
  {
    label: "Nya ordrar",
    value: "2",
    hint: "Väntar på dig",
  },
  {
    label: "Pågår",
    value: "3",
    hint: "Under arbete",
  },
  {
    label: "Klara",
    value: "15",
    hint: "Denna månad",
  },
  {
    label: "Intäkter",
    value: "22 500 kr",
    hint: "Denna månad",
  },
] as const;

const recentOrders = studioOrdersAsRows();

export default function OverviewPage() {
  return (
    <main className="flex-1 px-4 pb-10 pt-5 md:px-7 md:pb-14 md:pt-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-6xl space-y-8 lg:space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-0.5">
            <h1 className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
              Översikt
            </h1>
            <p className="text-[13px] text-gray-500 sm:text-sm">
              Din studio — handgjord mastering, inga genvägar.
            </p>
          </div>
          <Button type="button" className="shrink-0 self-stretch sm:self-auto">
            <span className="text-base leading-none sm:text-[15px]">+</span>
            Ny order
          </Button>
        </header>

        <section aria-label="Nyckeltal">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </section>

        <OrdersTable
          title="Senaste ordrar"
          orders={recentOrders}
          orderDetailBase="/studio/orders"
        />
      </div>
    </main>
  );
}
