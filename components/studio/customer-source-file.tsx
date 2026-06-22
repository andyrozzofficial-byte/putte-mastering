"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CustomerSourceFileProps = {
  orderId: string;
  fileName: string;
};

function formatLabelFromFileName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".wav")) return "WAV";
  if (lower.endsWith(".mp3")) return "MP3";
  if (lower.endsWith(".aiff") || lower.endsWith(".aif")) return "AIFF";
  if (lower.endsWith(".flac")) return "FLAC";
  const dot = fileName.lastIndexOf(".");
  if (dot >= 0 && dot < fileName.length - 1) {
    return fileName.slice(dot + 1).toUpperCase();
  }
  return "Audio";
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—:—";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CustomerSourceFile({ orderId, fileName }: CustomerSourceFileProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [durationLabel, setDurationLabel] = useState("—:—");
  const [sizeLabel, setSizeLabel] = useState("—");

  const sourceUrl = `/api/studio/orders/${orderId}/source`;
  const downloadUrl = `/api/studio/orders/${orderId}/source?download=1`;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(sourceUrl, {
          method: "GET",
          headers: { Range: "bytes=0-0" },
          credentials: "same-origin",
        });
        const contentRange = res.headers.get("content-range");
        const totalMatch = contentRange?.match(/\/(\d+)$/);
        const contentLength = res.headers.get("content-length");
        const bytes = totalMatch
          ? Number.parseInt(totalMatch[1], 10)
          : contentLength
            ? Number.parseInt(contentLength, 10)
            : NaN;
        if (!cancelled && Number.isFinite(bytes) && bytes > 0) {
          setSizeLabel(formatBytes(bytes));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceUrl]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }
    audio.pause();
    setPlaying(false);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        Source file
      </p>
      <audio
        ref={audioRef}
        src={sourceUrl}
        preload="metadata"
        className="sr-only"
        onLoadedMetadata={(e) => {
          setDurationLabel(formatDuration(e.currentTarget.duration));
        }}
        onDurationChange={(e) => {
          setDurationLabel(formatDuration(e.currentTarget.duration));
        }}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onError={() => {
          setPlaying(false);
          setDurationLabel("—:—");
        }}
      />
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void toggle()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 sm:h-[3.25rem] sm:w-[3.25rem]"
          aria-pressed={playing}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-black">{fileName}</p>
          <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
            {formatLabelFromFileName(fileName)}
            <span className="mx-2 text-gray-300">·</span>
            {durationLabel}
            <span className="mx-2 text-gray-300">·</span>
            {sizeLabel}
          </p>
        </div>
        <a
          href={downloadUrl}
          className="shrink-0 rounded-lg border border-black bg-white px-4 py-2 text-[13px] font-medium text-black transition-colors hover:bg-gray-50 sm:text-sm"
        >
          Download
        </a>
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
