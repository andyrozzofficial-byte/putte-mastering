"use client";

import { saveOrderUploadDraft } from "@/lib/order-flow-session";
import { uploadCustomerTrack } from "@/lib/upload-customer-track";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type UploadDropzoneProps = {
  /** Navigates here after a file is chosen or dropped (order flow). */
  nextStepHref?: string;
};

export function UploadDropzone({
  nextStepHref = "/order/tjanst",
}: UploadDropzoneProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setBusy(true);
      try {
        const { storageRef } = await uploadCustomerTrack(file);
        saveOrderUploadDraft({
          storageRef,
          trackName: file.name,
        });
        router.push(nextStepHref);
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Uppladdning misslyckades. Försök igen.";
        setUploadError(msg);
      } finally {
        setBusy(false);
      }
    },
    [router, nextStepHref],
  );

  const onPick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div
      id="upload"
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors md:p-7 ${
        active ? "ring-1 ring-gray-300/80" : ""
      } ${busy ? "pointer-events-none opacity-70" : ""}`}
      aria-busy={busy}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onPick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPick();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setActive(true);
        }}
        onDragLeave={() => setActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-10 text-center transition-colors sm:px-6 md:py-12 ${
          active
            ? "border-gray-400 bg-[var(--accent-warm)]/40"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
        aria-label="Ladda upp ljudfil"
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".wav,.aiff,.flac,.mp3,audio/wav,audio/aiff,audio/flac,audio/mpeg"
          multiple={false}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <UploadCloudIcon className="mb-4 text-gray-400" />
        <p className="text-base font-semibold tracking-tight text-black sm:text-[17px]">
          Dra & släpp din fil här
        </p>
        <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">
          eller klicka för att välja fil
        </p>
        <p className="mt-6 text-[11px] text-gray-400 sm:text-xs">
          WAV, AIFF, FLAC, MP3 upp till 500MB
        </p>
        {busy ? (
          <p className="mt-4 text-[13px] text-gray-500">Laddar upp…</p>
        ) : null}
        {uploadError ? (
          <p className="mt-4 text-center text-[13px] text-red-700" role="alert">
            {uploadError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function UploadCloudIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
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
