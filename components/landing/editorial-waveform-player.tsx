"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const BAR_COUNT = 104;
const DEMO_DURATION_SEC = 30;

/** Organic, non-uniform bar heights — reads like a real waveform, not a randomizer. */
function buildWaveformHeights(variant: "before" | "after"): number[] {
  const scale = variant === "before" ? 0.68 : 1;
  const detail = variant === "before" ? 0.55 : 1;

  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const x = i / (BAR_COUNT - 1);
    const envelope = 0.12 + 0.88 * Math.pow(Math.sin(x * Math.PI), 0.78);
    const body =
      0.34 +
      Math.sin(x * Math.PI * 2.6 + 0.35) * 0.2 +
      Math.sin(x * Math.PI * 6.4 + i * 0.11) * 0.14 * detail +
      Math.sin(x * Math.PI * 13.1 + i * 0.19) * 0.09 * detail;
    const micro = (((i * 23 + 7) % 17) / 17) * 0.07 * detail;
    const raw = envelope * body * scale + micro * scale;
    return Math.min(0.94, Math.max(0.05, raw));
  });
}

const HEIGHTS_BEFORE = buildWaveformHeights("before");
const HEIGHTS_AFTER = buildWaveformHeights("after");

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type Mode = "before" | "after";

export function EditorialWaveformPlayer() {
  const [mode, setMode] = useState<Mode>("after");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const heights = mode === "after" ? HEIGHTS_AFTER : HEIGHTS_BEFORE;

  const currentSec = progress * DEMO_DURATION_SEC;

  const stopPlayback = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
    setIsPlaying(false);
  }, []);

  const tick = useCallback(
    (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      const next = Math.min(1, elapsed / DEMO_DURATION_SEC);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) {
        stopPlayback();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [stopPlayback],
  );

  const play = useCallback(() => {
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setProgress(0);
    }
    startRef.current = null;
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleModeChange = useCallback(
    (next: Mode) => {
      setMode(next);
      stopPlayback();
      progressRef.current = 0;
      setProgress(0);
    },
    [stopPlayback],
  );

  const progressPercent = useMemo(() => `${progress * 100}%`, [progress]);

  return (
    <div className="min-w-0 space-y-0">
      <p className="mb-4 text-[13px] font-medium tracking-[-0.01em] text-black/88 sm:text-sm">
        Artist name — Track title
      </p>

      <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-[#fafafa] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        {/* Waveform canvas */}
        <div
          className="relative px-4 pb-3 pt-5 sm:px-5 sm:pt-6"
          role="img"
          aria-label={
            isPlaying
              ? `Waveform preview playing, ${formatTime(currentSec)} of ${formatTime(DEMO_DURATION_SEC)}`
              : `Waveform preview, ${mode === "after" ? "after" : "before"} mastering`
          }
        >
          <div className="relative h-[4.75rem] sm:h-[5.25rem]">
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm"
              aria-hidden
            >
              <div
                className="h-full bg-black/[0.025] transition-[width] duration-75 ease-linear"
                style={{ width: progressPercent }}
              />
            </div>

            <div
              className="relative flex h-full items-end justify-between gap-[2px] sm:gap-[2.5px]"
              aria-hidden
            >
              {heights.map((h, i) => {
                const barProgress = (i + 0.5) / BAR_COUNT;
                const played = barProgress <= progress;
                const phase = (i % 11) * 0.09;
                return (
                  <span
                    key={`${mode}-${i}`}
                    className={`editorial-waveform-bar w-[1.5px] shrink-0 rounded-full sm:w-[2px] ${
                      isPlaying ? "editorial-waveform-bar--live" : ""
                    } ${played ? "bg-black/[0.5]" : "bg-black/[0.18]"}`}
                    style={{
                      height: `${h * 100}%`,
                      animationDelay: isPlaying ? `${phase}s` : undefined,
                      ["--bar-pulse" as string]: `${1 + (h * 0.1).toFixed(3)}`,
                    }}
                  />
                );
              })}
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-black/30 transition-[left] duration-75 ease-linear"
              style={{ left: progressPercent }}
              aria-hidden
            />
          </div>
        </div>

        {/* Controls — aligned to waveform grid */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-black/[0.06] bg-white/80 px-4 py-3.5 sm:px-5 sm:py-4">
          <div
            className="inline-flex rounded-full border border-black/[0.08] bg-neutral-50/80 p-0.5"
            role="group"
            aria-label="Compare before and after"
          >
            <button
              type="button"
              onClick={() => handleModeChange("before")}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors sm:text-[11px] ${
                mode === "before"
                  ? "bg-black text-white"
                  : "text-black/45 hover:text-black/70"
              }`}
            >
              Before
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("after")}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors sm:text-[11px] ${
                mode === "after"
                  ? "bg-black text-white"
                  : "text-black/45 hover:text-black/70"
              }`}
            >
              After
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.1] bg-white text-black/85 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-black/20 hover:bg-neutral-50"
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <span className="font-mono text-[11px] tabular-nums tracking-[0.02em] text-black/42 sm:text-xs">
              {formatTime(currentSec)}
              <span className="text-black/25"> / </span>
              {formatTime(DEMO_DURATION_SEC)}
            </span>
            <span
              className="ml-auto hidden text-black/28 sm:inline-flex"
              aria-hidden
            >
              <VolumeIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
