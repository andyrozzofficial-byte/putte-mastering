"use client";

import { createStudioBrowserClient } from "@/lib/supabase/studio-browser";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { IconLogout } from "./icons";

type StudioLogoutButtonProps = {
  variant?: "desktop" | "mobile";
};

export function StudioLogoutButton({
  variant = "desktop",
}: StudioLogoutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      const supabase = createStudioBrowserClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [router]);

  const className =
    variant === "desktop"
      ? "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black disabled:opacity-60 sm:text-sm"
      : "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black disabled:opacity-60";

  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={() => void logout()}
    >
      <IconLogout />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
