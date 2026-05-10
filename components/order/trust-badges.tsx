const items = [
  {
    title: "Nöjd kund-garanti",
    icon: IconShield,
  },
  {
    title: "Säker betalning",
    icon: IconCard,
  },
  {
    title: "Högsta kvalitet",
    icon: IconQuality,
  },
] as const;

export function TrustBadges() {
  return (
    <div className="border-t border-gray-100 pt-12 md:pt-16">
      <ul className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:flex-wrap sm:gap-x-12 sm:gap-y-6 md:gap-x-16">
        {items.map(({ title, icon: Icon }) => (
          <li
            key={title}
            className="flex max-w-xs flex-col items-center gap-3 text-center sm:max-w-none"
          >
            <Icon className="text-gray-700" />
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconQuality({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
