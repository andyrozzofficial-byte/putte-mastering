"use client";

import { useCallback, useState } from "react";

type CustomerSourceFileProps = {
  fileName: string;
  formatLabel: string;
  durationLabel: string;
  sizeLabel: string;
};

export function CustomerSourceFile({
  fileName,
  formatLabel,
  durationLabel,
  sizeLabel,
}: CustomerSourceFileProps) {
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        Source file
      </p>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={toggle}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 sm:h-[3.25rem] sm:w-[3.25rem]"
          aria-pressed={playing}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-black">{fileName}</p>
          <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
            {formatLabel}
            <span className="mx-2 text-gray-300">·</span>
            {durationLabel}
            <span className="mx-2 text-gray-300">·</span>
            {sizeLabel}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-black bg-white px-4 py-2 text-[13px] font-medium text-black transition-colors hover:bg-gray-50 sm:text-sm"
        >
          Download
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}
