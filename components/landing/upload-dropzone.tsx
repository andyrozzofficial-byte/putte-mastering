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
            : "Upload failed. Please try again.";
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
      className={`rounded-2xl border border-neutral-200/50 bg-gradient-to-b from-white to-neutral-50/40 p-1 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.05)] transition-colors sm:p-1.5 ${
        active ? "ring-1 ring-neutral-300/50" : ""
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-11 text-center transition-colors sm:px-8 sm:py-14 ${
          active
            ? "border-neutral-400/70 bg-neutral-50/80"
            : "border-neutral-300/55 bg-white/80 hover:border-neutral-400/80"
        }`}
        aria-label="Upload audio file"
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
          Drag &amp; drop your file here
        </p>
        <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">
          or click to choose a file
        </p>
        <p className="mt-6 text-[11px] text-gray-400 sm:text-xs">
          WAV, AIFF, FLAC, MP3 up to 500MB
        </p>
        {busy ? (
          <p className="mt-4 text-[13px] text-gray-500">Uploading…</p>
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
