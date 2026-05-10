"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import {
  IconClose,
  IconFolder,
  IconLogout,
  IconMenu,
  IconOrders,
  IconOverview,
  IconSettings,
  IconUsers,
  IconWaveform,
} from "./icons";

type NavIcon = ComponentType<{ className?: string }>;

const STUDIO = "/studio";

const nav: {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: string;
}[] = [
  { href: STUDIO, label: "Översikt", icon: IconOverview },
  { href: `${STUDIO}/ordrar`, label: "Ordrar", icon: IconOrders },
  {
    href: `${STUDIO}/nya-ordrar`,
    label: "Nya ordrar",
    icon: IconOrders,
    badge: "2",
  },
  { href: `${STUDIO}/kunder`, label: "Kunder", icon: IconUsers },
  { href: `${STUDIO}/filer`, label: "Filer", icon: IconFolder },
  {
    href: `${STUDIO}/installningar`,
    label: "Inställningar",
    icon: IconSettings,
  },
];

function navItemActive(pathname: string, href: string): boolean {
  if (href === STUDIO) {
    return pathname === STUDIO;
  }
  if (href === `${STUDIO}/ordrar`) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith(`${STUDIO}/orders`)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Huvudnavigation">
      {nav.map(({ href, label, icon: Icon, badge }) => {
        const active = navItemActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--accent-warm)] text-black"
                : "text-gray-600 hover:bg-gray-50 hover:text-black"
            }`}
          >
            <Icon className="shrink-0 text-gray-500" />
            <span className="flex flex-1 items-center justify-between gap-2">
              {label}
              {badge ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {badge}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Link
          href={STUDIO}
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <IconWaveform className="shrink-0 text-black" />
          <span className="truncate tracking-tight">Putte Mastering</span>
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Öppna meny"
        >
          <IconMenu />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="relative hidden min-h-screen w-64 shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col md:py-8">
        <div className="flex flex-1 flex-col px-6">
          <Link href={STUDIO} className="mb-10 flex items-center gap-2.5">
            <IconWaveform className="shrink-0 text-black" />
            <span className="text-sm font-semibold tracking-tight text-black">
              Putte Mastering
            </span>
          </Link>
          <NavLinks />
        </div>
        <div className="border-t border-gray-100 px-6 pt-6">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
          >
            <IconLogout />
            Logga ut
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/20 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Stäng meny"
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <span className="text-sm font-semibold tracking-[0.12em]">
              Meny
            </span>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setOpen(false)}
              aria-label="Stäng"
            >
              <IconClose />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-gray-100 p-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600"
            >
              <IconLogout />
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
