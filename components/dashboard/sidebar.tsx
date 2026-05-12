"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { StudioLogoutButton } from "@/components/dashboard/studio-logout-button";
import {
  IconClose,
  IconFolder,
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
  { href: STUDIO, label: "Overview", icon: IconOverview },
  { href: `${STUDIO}/ordrar`, label: "Orders", icon: IconOrders },
  {
    href: `${STUDIO}/nya-ordrar`,
    label: "New orders",
    icon: IconOrders,
    badge: "2",
  },
  { href: `${STUDIO}/kunder`, label: "Customers", icon: IconUsers },
  { href: `${STUDIO}/filer`, label: "Files", icon: IconFolder },
  {
    href: `${STUDIO}/installningar`,
    label: "Settings",
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
    <nav className="flex flex-col gap-1" aria-label="Primary navigation">
      {nav.map(({ href, label, icon: Icon, badge }) => {
        const active = navItemActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors sm:text-sm ${
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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 md:hidden">
        <Link
          href={STUDIO}
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <IconWaveform className="shrink-0 text-black" />
          <span className="truncate tracking-tight">First Listen Mastering</span>
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="relative hidden min-h-screen w-[15.5rem] shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col md:py-6 lg:w-60">
        <div className="flex flex-1 flex-col px-5">
          <Link href={STUDIO} className="mb-8 flex items-center gap-2">
            <IconWaveform className="shrink-0 text-black" />
            <span className="text-sm font-semibold tracking-tight text-black">
              First Listen Mastering
            </span>
          </Link>
          <NavLinks />
        </div>
        <div className="border-t border-gray-100 px-5 pt-5">
          <StudioLogoutButton variant="desktop" />
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
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold tracking-[0.12em]">
              Menu
            </span>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <IconClose />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-gray-100 p-4">
            <StudioLogoutButton variant="mobile" />
          </div>
        </div>
      </div>
    </>
  );
}
