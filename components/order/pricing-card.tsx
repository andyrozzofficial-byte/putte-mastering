type PricingCardProps = {
  title: string;
  price: string;
  features: readonly string[];
  popular?: boolean;
  ctaLabel?: string;
  onSelect?: () => void | Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
};

export function PricingCard({
  title,
  price,
  features,
  popular = false,
  ctaLabel = "Välj",
  onSelect,
  disabled = false,
  isLoading = false,
}: PricingCardProps) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-xl border p-5 shadow-sm transition-all duration-200 md:p-6 ${
        popular
          ? "border-[var(--accent-warm-strong)]/80 bg-[var(--accent-warm)]/80 pt-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-gray-300 hover:shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {popular ? (
        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200/80 bg-[var(--accent-warm-strong)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-800">
          Populär
        </span>
      ) : null}

      <h3 className="text-[15px] font-semibold tracking-tight text-black sm:text-base">
        {title}
      </h3>
      <p className="mt-3 text-[1.65rem] font-semibold tracking-tight text-black sm:text-[1.75rem] md:text-[1.85rem]">
        {price}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2.5 text-[13px] text-gray-600 sm:text-sm">
            <CheckIcon className="mt-0.5 shrink-0 text-gray-700" />
            <span className="leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => void onSelect?.()}
        className={`mt-8 w-full rounded-lg py-2.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${
          popular
            ? "bg-black text-white hover:bg-neutral-800"
            : "border border-black bg-white text-black hover:bg-gray-50"
        }`}
      >
        {isLoading ? "Skickar…" : ctaLabel}
      </button>
    </article>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
