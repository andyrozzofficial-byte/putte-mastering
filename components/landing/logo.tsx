import Link from "next/link";

export function MastradLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 font-bold tracking-[0.14em] text-black ${className ?? ""}`}
    >
      <span className="inline-flex text-black" aria-hidden>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 12v-2" />
          <path d="M8 8v8" />
          <path d="M12 5v14" />
          <path d="M16 9v6" />
          <path d="M20 11v2" />
        </svg>
      </span>
      <span className="text-sm md:text-[15px]">MASTRAD</span>
    </Link>
  );
}
