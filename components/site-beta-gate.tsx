"use client";

import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import {
  getSiteBetaPassword,
  grantSiteBetaAccess,
  hasSiteBetaAccess,
  isSiteBetaExemptPath,
  isSiteBetaGateEnabled,
} from "@/lib/site-beta-gate";

type GateState = "loading" | "locked" | "unlocked";

export function SiteBetaGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [gateState, setGateState] = useState<GateState>("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSiteBetaExemptPath(pathname) || !isSiteBetaGateEnabled()) {
      setGateState("unlocked");
      return;
    }
    setGateState(hasSiteBetaAccess() ? "unlocked" : "locked");
  }, [pathname]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const expected = getSiteBetaPassword();
    if (!expected) {
      setGateState("unlocked");
      return;
    }
    if (password.trim() === expected) {
      grantSiteBetaAccess();
      setGateState("unlocked");
      setPassword("");
      return;
    }
    setError("Incorrect password. Try again.");
  }

  if (gateState === "loading") {
    return <div className="min-h-screen bg-white" aria-hidden />;
  }

  if (gateState === "unlocked") {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-[11px] font-bold tracking-[0.22em] text-black">FIRST LISTEN</p>
        <p className="mt-0.5 text-[9px] font-medium tracking-[0.26em] text-black/45">
          MASTERING
        </p>
        <p className="mt-10 text-[10px] font-medium uppercase tracking-[0.34em] text-black/38">
          Private preview
        </p>
        <p className="mt-4 text-[13px] leading-relaxed text-black/44">
          Enter the site password to continue.
        </p>

        <form className="mt-8 space-y-4 text-left" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="site-beta-password">
            Site password
          </label>
          <input
            id="site-beta-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-black/15 bg-transparent px-0 py-3 text-center text-[15px] tracking-[0.02em] text-black outline-none transition-colors placeholder:text-black/28 focus:border-black/40"
            placeholder="Password"
            autoFocus
          />
          {error ? (
            <p className="text-center text-[12px] text-black/55" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-full border border-black/12 bg-black py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/90"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
