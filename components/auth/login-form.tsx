"use client";

import { createStudioBrowserClient } from "@/lib/supabase/studio-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useState } from "react";

type LoginFormProps = {
  /** Safe internal path after login (must start with `/studio`). */
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        const supabase = createStudioBrowserClient();
        const { error: signError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signError) {
          setError(signError.message);
          return;
        }
        router.replace(redirectTo);
        router.refresh();
      } catch {
        setError("Inloggning misslyckades. Försök igen.");
      } finally {
        setBusy(false);
      }
    },
    [email, password, redirectTo, router],
  );

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="studio-email"
          className="block text-[13px] font-medium text-gray-700"
        >
          E-post
        </label>
        <input
          id="studio-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-black outline-none ring-black/10 transition-shadow placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 sm:text-sm"
          placeholder="du@example.com"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="studio-password"
          className="block text-[13px] font-medium text-gray-700"
        >
          Lösenord
        </label>
        <input
          id="studio-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-black outline-none ring-black/10 transition-shadow placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 sm:text-sm"
        />
      </div>

      {error ? (
        <p className="text-[13px] text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-black py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      >
        {busy ? "Loggar in…" : "Logga in"}
      </button>

      <p className="text-center text-[13px] text-gray-500">
        <Link href="/" className="font-medium text-black underline decoration-gray-300 underline-offset-4 hover:decoration-black">
          Till startsidan
        </Link>
      </p>
    </form>
  );
}
