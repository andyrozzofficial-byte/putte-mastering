"use client";

import { parseApiJsonBody } from "@/lib/api/client-parse";
import { useCallback, useMemo, useRef, useState } from "react";

type Props = {
  orderId: string;
};

export function DeliveryMasterUpload({ orderId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryUrl, setDeliveryUrl] = useState<string | null>(null);

  const openFile = useCallback(() => inputRef.current?.click(), []);

  const onPick = useCallback((f: File | null) => {
    setError(null);
    setDeliveryUrl(null);
    setFile(f);
  }, []);

  const fileLabel = useMemo(() => {
    if (!file) return "Choose a WAV or MP3 file";
    return file.name;
  }, [file]);

  const upload = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDeliveryUrl(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/studio/orders/${orderId}/deliver`, {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const raw = await res.text();
      const json = parseApiJsonBody(raw, res) as {
        success?: boolean;
        error?: string;
        deliveryUrl?: string;
      };
      if (!res.ok || json.success === false) {
        throw new Error(
          typeof json.error === "string" && json.error.length > 0
            ? json.error
            : "Upload failed.",
        );
      }
      if (json.success !== true || typeof json.deliveryUrl !== "string") {
        throw new Error("Missing delivery link in server response.");
      }
      setDeliveryUrl(json.deliveryUrl);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }, [file, orderId]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        Delivery
      </p>
      <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-black sm:text-base">
        Upload finished master
      </h3>
      <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">
        Upload the final master (WAV or MP3). After upload, the order is marked as
        completed and a customer download link is generated.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={openFile}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFile();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          onPick(f ?? null);
        }}
        className={`mt-6 flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-5 py-10 text-center transition-colors sm:px-6 md:py-12 ${
          drag
            ? "border-gray-400 bg-[var(--accent-warm)]/50"
            : "border-gray-200 bg-neutral-50/30 hover:border-gray-300"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".wav,.mp3,audio/wav,audio/mpeg"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onPick(f);
          }}
        />
        <UploadGlyph className="mb-4 text-gray-400" />
        <p className="text-[15px] font-semibold text-black sm:text-base">
          Drag & drop your file here
        </p>
        <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">
          {file ? fileLabel : "or click to choose a file"}
        </p>
      </div>

      {error ? (
        <p className="mt-4 text-[13px] text-red-700 sm:text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {deliveryUrl ? (
        <div className="mt-5 rounded-lg border border-gray-200 bg-neutral-50/40 p-4">
          <p className="text-[13px] font-medium text-black sm:text-sm">
            Delivery link
          </p>
          <a
            className="mt-1 block break-all text-[13px] text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-black hover:decoration-black sm:text-sm"
            href={deliveryUrl}
            target="_blank"
            rel="noreferrer"
          >
            {deliveryUrl}
          </a>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!file || busy}
        onClick={() => void upload()}
        className="mt-6 w-full rounded-lg bg-black py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
      >
        {busy ? "Uploading…" : "Upload and complete"}
      </button>
    </div>
  );
}

function UploadGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 01-.75-8.963 5.25 5.25 0 0110.5 0 4.5 4.5 0 01-.75 8.963M12 3v2.25" />
    </svg>
  );
}
