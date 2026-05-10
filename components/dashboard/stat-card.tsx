type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-7">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-black md:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-gray-500">{hint}</p>
    </div>
  );
}
