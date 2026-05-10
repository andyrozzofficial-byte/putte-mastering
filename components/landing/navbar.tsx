"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MastradLogo } from "./logo";

const links = [
  { href: "/#top", label: "Hem" },
  { href: "/#hur", label: "Så fungerar det" },
  { href: "/#priser", label: "Priser" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#kontakt", label: "Kontakt" },
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
    <header className="sticky top-0 z-50 border-b border-gray-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12 lg:py-5">
        <div className="flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <MastradLogo />

          <nav className="hidden md:block md:justify-self-center" aria-label="Primär">
            <ul className="flex items-center gap-6 lg:gap-10">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="whitespace-nowrap text-sm font-medium text-gray-600 transition-colors hover:text-black"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-3 md:min-w-0">
            <Link
              href="/studio"
              className="hidden rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:inline-flex"
            >
              Logga in
            </Link>
            <button
              type="button"
              className="rounded-md p-2 text-gray-600 hover:bg-gray-50 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Stäng meny" : "Öppna meny"}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/studio"
                className="block rounded-lg bg-black px-3 py-3 text-center text-sm font-medium text-white"
                onClick={() => setOpen(false)}
              >
                Logga in
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
