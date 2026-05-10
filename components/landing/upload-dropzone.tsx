"use client";

import { useCallback, useRef, useState } from "react";

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const onPick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div
      id="upload"
      className={`rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-colors md:p-10 ${
        active ? "ring-1 ring-gray-300/80" : ""
      }`}
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
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center transition-colors md:py-16 ${
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
        />
        <UploadCloudIcon className="mb-6 text-gray-400" />
        <p className="text-lg font-semibold tracking-tight text-black">
          Dra & släpp din fil här
        </p>
        <p className="mt-2 text-sm text-gray-500">eller klicka för att välja fil</p>
        <p className="mt-8 text-xs text-gray-400">
          WAV, AIFF, FLAC, MP3 upp till 500MB
        </p>
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
