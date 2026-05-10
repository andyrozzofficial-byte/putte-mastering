import { StatCard } from "@/components/dashboard/stat-card";
import {
  OrdersTable,
  type OrderRow,
} from "@/components/dashboard/orders-table";
import { Button } from "@/components/ui/button";

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

const recentOrders: OrderRow[] = [
  {
    id: "Order #1023",
    customer: "Andreas L.",
    service: "Standard Master",
    status: "ny",
    date: "Idag 16:02",
  },
  {
    id: "Order #1022",
    customer: "Marcus J.",
    service: "Premium Master",
    status: "in_progress",
    date: "Idag 13:48",
  },
  {
    id: "Order #1021",
    customer: "Erik N.",
    service: "Standard Master",
    status: "klar",
    date: "Igår 22:10",
  },
];

export default function OverviewPage() {
  return (
    <main className="flex-1 px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-10 lg:px-12 lg:pt-12">
      <div className="mx-auto max-w-6xl space-y-10 lg:space-y-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
              Översikt
            </h1>
            <p className="text-sm text-gray-500">
              Din studio — handgjord mastering, inga genvägar.
            </p>
          </div>
          <Button type="button" className="shrink-0 self-stretch sm:self-auto">
            <span className="text-lg leading-none">+</span>
            Ny order
          </Button>
        </header>

        <section aria-label="Nyckeltal">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </section>

        <OrdersTable title="Senaste ordrar" orders={recentOrders} />
      </div>
    </main>
  );
}
