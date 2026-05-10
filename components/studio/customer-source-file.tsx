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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        Kundfil
      </p>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={toggle}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
          aria-pressed={playing}
          aria-label={playing ? "Pausa" : "Spela"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-black">{fileName}</p>
          <p className="mt-1 text-sm text-gray-500">
            {formatLabel}
            <span className="mx-2 text-gray-300">·</span>
            {durationLabel}
            <span className="mx-2 text-gray-300">·</span>
            {sizeLabel}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-black bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-50"
        >
          Ladda ner
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
