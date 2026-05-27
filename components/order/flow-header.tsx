import Link from "next/link";
import { FirstListenLogo } from "@/components/landing/first-listen-logo";

export function FlowHeader() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-6 lg:px-7">
        <FirstListenLogo />
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-black"
        >
          Back to home
        </Link>
      </div>
    </header>
  );
}
