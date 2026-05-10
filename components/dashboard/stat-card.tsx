type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
      <p className="text-[13px] font-medium text-gray-500 sm:text-sm">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
        {value}
      </p>
      <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">{hint}</p>
    </div>
  );
}
