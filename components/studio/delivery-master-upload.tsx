"use client";

import { useCallback, useRef, useState } from "react";

export function DeliveryMasterUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const openFile = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        Leverans
      </p>
      <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-black sm:text-base">
        Ladda upp färdig master
      </h3>
      <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">
        WAV eller AIFF i målformat som kunden beställt.
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
          accept=".wav,.aiff,audio/wav,audio/aiff"
        />
        <UploadGlyph className="mb-4 text-gray-400" />
        <p className="text-[15px] font-semibold text-black sm:text-base">
          Dra & släpp din fil här
        </p>
        <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">
          eller klicka för att välja fil
        </p>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-lg bg-black py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 sm:text-sm"
      >
        Markera som klar
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
