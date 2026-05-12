import Link from "next/link";

export function FirstListenLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group flex flex-col leading-none text-black ${className ?? ""}`}
    >
      <span className="text-[11px] font-bold tracking-[0.22em] sm:text-xs">
        FIRST LISTEN
      </span>
      <span className="mt-0.5 text-[9px] font-medium tracking-[0.26em] text-gray-500 transition-colors group-hover:text-gray-700 sm:text-[10px]">
        MASTERING
      </span>
    </Link>
  );
}
