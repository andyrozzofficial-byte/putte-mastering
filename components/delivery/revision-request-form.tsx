"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";

type Props = {
  accessToken: string;
};

export function DeliveryRevisionForm({ accessToken }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setDone(false);
      setBusy(true);
      try {
        const res = await fetch(
          `/api/delivery/${encodeURIComponent(accessToken)}/revision`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ message }),
          },
        );
        const raw = await res.text();
        const json = raw ? (JSON.parse(raw) as { error?: string }) : {};
        if (!res.ok) throw new Error(json.error || "Could not send request.");
        setMessage("");
        setDone(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setBusy(false);
      }
    },
    [accessToken, message, router],
  );

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        Request a revision
      </h2>
      <p className="mt-2 text-[13px] text-gray-600 sm:text-sm">
        Describe the changes you would like. We will confirm by email and update your
        order status.
      </p>
      <form onSubmit={(ev) => void submit(ev)} className="mt-4 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          minLength={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-black shadow-sm outline-none ring-black/5 placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 sm:text-sm"
          placeholder="e.g. More brightness in the chorus, less low-mid buildup…"
        />
        {error ? (
          <p className="text-[13px] text-red-700 sm:text-sm" role="alert">
            {error}
          </p>
        ) : null}
        {done ? (
          <p className="text-[13px] text-emerald-800 sm:text-sm" role="status">
            Thanks — your revision request was sent.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || message.trim().length < 3}
          className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-black shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-sm"
        >
          {busy ? "Sending…" : "Send revision notes"}
        </button>
      </form>
    </div>
  );
}
