"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FirstListenLogo } from "./first-listen-logo";

const links = [
  { href: "/#top", label: "Home" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
] as const;

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/85 bg-white/[0.97] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 py-3.5 sm:px-6 lg:px-10 lg:py-4">
        <div className="flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <FirstListenLogo />

          <nav className="hidden md:block md:justify-self-center" aria-label="Primary">
            <ul className="flex items-center gap-6 lg:gap-8">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="whitespace-nowrap text-[13px] font-medium text-gray-600 transition-colors hover:text-black md:text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3 md:min-w-0">
            <Link
              href="#upload"
              className="hidden rounded-lg bg-black px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 sm:inline-flex"
            >
              Upload your track
            </Link>
            <Link
              href="/login"
              className="hidden text-[13px] font-medium text-gray-600 transition-colors hover:text-black lg:inline"
            >
              Studio
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-neutral-50 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="border-t border-gray-100 bg-white px-5 py-3 md:hidden">
          <ul className="flex flex-col gap-0.5">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg px-3 py-2.5 text-[13px] font-medium text-gray-800 hover:bg-neutral-50"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="#upload"
                className="block rounded-lg bg-black px-3 py-2.5 text-center text-[13px] font-medium text-white"
                onClick={() => setOpen(false)}
              >
                Upload your track
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2.5 text-center text-[13px] font-medium text-gray-700 hover:bg-neutral-50"
                onClick={() => setOpen(false)}
              >
                Studio
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
