"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  WAVEFORM_BAR_COUNT,
  WAVEFORM_HEIGHTS_AFTER,
  WAVEFORM_HEIGHTS_BEFORE,
  waveformBarHeightPercent,
} from "@/lib/landing/waveform-heights";

const AUDIO_BEFORE_PATH = "/audio/before.wav";
const AUDIO_AFTER_PATH = "/audio/after.wav";

const CROSSFADE_MS = 180;
const LEVEL_SMOOTHING = 0.18;

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type Mode = "before" | "after";

type Buffers = {
  before: AudioBuffer;
  after: AudioBuffer;
  gains: { before: number; after: number };
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function computeRms(buffer: AudioBuffer): number {
  const channelCount = buffer.numberOfChannels;
  const length = buffer.length;
  let sumSq = 0;
  for (let c = 0; c < channelCount; c += 1) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i += 1) {
      const s = data[i] ?? 0;
      sumSq += s * s;
    }
  }
  const meanSq = sumSq / Math.max(1, length * channelCount);
  return Math.sqrt(meanSq);
}

function audioUrlCandidates(path: string): string[] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const candidates = new Set<string>([normalized]);
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname.replace(/\/+$/, "");
    if (pathname && pathname !== "/") {
      candidates.add(`${pathname}${normalized}`);
    }
  }
  return [...candidates];
}

async function fetchFirstAvailable(path: string): Promise<Response> {
  const candidates = audioUrlCandidates(path);
  let lastStatus: number | null = null;

  for (const candidate of candidates) {
    const res = await fetch(candidate);
    if (res.ok) return res;
    lastStatus = res.status;
  }

  throw new Error(`Failed to load ${path.split("/").pop() ?? "audio"} (${lastStatus ?? "404"})`);
}

export function EditorialWaveformPlayer() {
  const [mode, setMode] = useState<Mode>("after");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveLevel, setLiveLevel] = useState(0); // 0..1 (smoothed)

  const rootRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const analyserRafRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Buffers | null>(null);

  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startTimeRef = useRef(0); // audioCtx.currentTime when started
  const offsetRef = useRef(0); // seconds offset into buffer at startTime
  const durationRef = useRef(0);
  const modeRef = useRef<Mode>("after");
  const liveLevelRef = useRef(0);

  const heights = mode === "after" ? WAVEFORM_HEIGHTS_AFTER : WAVEFORM_HEIGHTS_BEFORE;

  const totalSec = durationSec ?? 0;
  const currentSec = useMemo(() => {
    if (!durationSec) return 0;
    return progress * durationSec;
  }, [durationSec, progress]);

  const getAudioCtx = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    return ctx;
  }, []);

  const stopRafs = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRafRef.current != null) {
      cancelAnimationFrame(analyserRafRef.current);
      analyserRafRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(
    (opts?: { keepProgress?: boolean }) => {
      stopRafs();
      const src = currentSourceRef.current;
      const gain = currentGainRef.current;
      currentSourceRef.current = null;
      currentGainRef.current = null;

      try {
        if (gain) gain.gain.cancelScheduledValues(0);
      } catch {
        // ignore
      }

      try {
        src?.stop();
      } catch {
        // ignore
      }

      if (!opts?.keepProgress) {
        setProgress(0);
        offsetRef.current = 0;
      }
      setIsPlaying(false);
      setLiveLevel(0);
      liveLevelRef.current = 0;
    },
    [stopRafs],
  );

  const getCurrentPositionSec = useCallback(() => {
    if (!durationRef.current) return 0;
    const ctx = audioCtxRef.current;
    if (!ctx || !isPlaying) return offsetRef.current;
    const elapsed = Math.max(0, ctx.currentTime - startTimeRef.current);
    return Math.min(durationRef.current, offsetRef.current + elapsed);
  }, [isPlaying]);

  const startSource = useCallback(
    async (nextMode: Mode, offsetSec: number, opts?: { crossfadeFrom?: GainNode | null }) => {
      const ctx = getAudioCtx();
      await ctx.resume();
      const buffers = buffersRef.current;
      if (!buffers) throw new Error("Audio not loaded");

      const buffer = nextMode === "after" ? buffers.after : buffers.before;
      const duration = buffer.duration;
      durationRef.current = duration;
      setDurationSec(duration);

      const analyser = analyserRef.current ?? ctx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.86;

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const gain = ctx.createGain();
      const baseGain = nextMode === "after" ? buffers.gains.after : buffers.gains.before;
      gain.gain.value = Math.max(0, Math.min(1.2, baseGain));

      src.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      const safeOffset = Math.max(0, Math.min(duration, offsetSec));

      startTimeRef.current = ctx.currentTime;
      offsetRef.current = safeOffset;
      modeRef.current = nextMode;
      setMode(nextMode);

      currentSourceRef.current = src;
      currentGainRef.current = gain;

      if (opts?.crossfadeFrom) {
        const t0 = ctx.currentTime;
        const fade = CROSSFADE_MS / 1000;
        try {
          gain.gain.setValueAtTime(0, t0);
          gain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1.2, baseGain)), t0 + fade);
        } catch {
          // ignore
        }
        try {
          opts.crossfadeFrom.gain.cancelScheduledValues(t0);
          opts.crossfadeFrom.gain.setValueAtTime(opts.crossfadeFrom.gain.value, t0);
          opts.crossfadeFrom.gain.linearRampToValueAtTime(0, t0 + fade);
        } catch {
          // ignore
        }
      }

      src.onended = () => {
        if (currentSourceRef.current === src) stopPlayback();
      };

      src.start(0, safeOffset);
      setIsPlaying(true);
    },
    [getAudioCtx, stopPlayback],
  );

  const tickProgress = useCallback(() => {
    const duration = durationRef.current;
    if (!duration) return;
    const pos = getCurrentPositionSec();
    const nextProgress = clamp01(pos / duration);
    setProgress(nextProgress);
    if (nextProgress >= 1) {
      stopPlayback();
      return;
    }
    rafRef.current = requestAnimationFrame(tickProgress);
  }, [getCurrentPositionSec, stopPlayback]);

  const tickAnalyser = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(bins);
    let sum = 0;
    for (let i = 0; i < bins.length; i += 1) {
      const v = (bins[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / Math.max(1, bins.length));
    const normalized = clamp01(rms * 2.25);
    const prev = liveLevelRef.current;
    const next = prev + (normalized - prev) * LEVEL_SMOOTHING;
    liveLevelRef.current = next;
    setLiveLevel(next);
    analyserRafRef.current = requestAnimationFrame(tickAnalyser);
  }, []);

  const play = useCallback(async () => {
    if (!buffersRef.current) return;
    const duration = durationRef.current || buffersRef.current.after.duration;
    const pos = getCurrentPositionSec();
    const nextPos = pos >= duration ? 0 : pos;
    await startSource(modeRef.current, nextPos);
    stopRafs();
    rafRef.current = requestAnimationFrame(tickProgress);
    analyserRafRef.current = requestAnimationFrame(tickAnalyser);
  }, [getCurrentPositionSec, startSource, stopRafs, tickAnalyser, tickProgress]);

  const pause = useCallback(() => {
    const pos = getCurrentPositionSec();
    stopPlayback({ keepProgress: true });
    offsetRef.current = pos;
    const duration = durationRef.current;
    if (duration) setProgress(clamp01(pos / duration));
  }, [getCurrentPositionSec, stopPlayback]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else void play();
  }, [isPlaying, pause, play]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const ctx = getAudioCtx();
        const [beforeRes, afterRes] = await Promise.all([
          fetchFirstAvailable(AUDIO_BEFORE_PATH),
          fetchFirstAvailable(AUDIO_AFTER_PATH),
        ]);
        const [beforeBuf, afterBuf] = await Promise.all([
          beforeRes.arrayBuffer(),
          afterRes.arrayBuffer(),
        ]);
        const [before, after] = await Promise.all([
          ctx.decodeAudioData(beforeBuf.slice(0)),
          ctx.decodeAudioData(afterBuf.slice(0)),
        ]);
        if (cancelled) return;

        const rmsBefore = computeRms(before);
        const rmsAfter = computeRms(after);
        const target = Math.min(rmsBefore || 1, rmsAfter || 1);
        const gainBefore = rmsBefore > 0 ? Math.min(1, target / rmsBefore) : 1;
        const gainAfter = rmsAfter > 0 ? Math.min(1, target / rmsAfter) : 1;

        buffersRef.current = { before, after, gains: { before: gainBefore, after: gainAfter } };
        durationRef.current = after.duration;
        setDurationSec(after.duration);
        setIsLoading(false);
      } catch (e) {
        if (cancelled) return;
        setIsLoading(false);
        setError(e instanceof Error ? e.message : "Failed to load audio");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [getAudioCtx]);

  useEffect(() => {
    return () => {
      stopPlayback();
      try {
        audioCtxRef.current?.close();
      } catch {
        // ignore
      }
    };
  }, [stopPlayback]);

  const handleModeChange = useCallback(
    async (next: Mode) => {
      if (next === modeRef.current) return;
      const buffers = buffersRef.current;
      if (!buffers) {
        setMode(next);
        modeRef.current = next;
        return;
      }

      const pos = getCurrentPositionSec();
      if (!isPlaying) {
        setMode(next);
        modeRef.current = next;
        offsetRef.current = pos;
        const nextDuration = next === "after" ? buffers.after.duration : buffers.before.duration;
        durationRef.current = nextDuration;
        setDurationSec(nextDuration);
        setProgress(clamp01(pos / nextDuration));
        return;
      }

      const prevGain = currentGainRef.current;
      const prevSrc = currentSourceRef.current;
      await startSource(next, pos, { crossfadeFrom: prevGain });
      stopRafs();
      rafRef.current = requestAnimationFrame(tickProgress);
      analyserRafRef.current = requestAnimationFrame(tickAnalyser);

      window.setTimeout(() => {
        try {
          prevSrc?.stop();
        } catch {
          // ignore
        }
      }, CROSSFADE_MS + 30);
    },
    [getCurrentPositionSec, isPlaying, startSource, stopRafs, tickAnalyser, tickProgress],
  );

  const progressPercent = useMemo(() => `${Math.round(progress * 10000) / 100}%`, [progress]);
  const isReady = !isLoading && !error && !!buffersRef.current;

  const handleSeek = useCallback(
    async (clientX: number) => {
      const el = rootRef.current;
      const buffers = buffersRef.current;
      if (!el || !buffers) return;
      const rect = el.getBoundingClientRect();
      const ratio = clamp01((clientX - rect.left) / Math.max(1, rect.width));
      const buffer = modeRef.current === "after" ? buffers.after : buffers.before;
      const nextPos = ratio * buffer.duration;

      if (!isPlaying) {
        offsetRef.current = nextPos;
        durationRef.current = buffer.duration;
        setDurationSec(buffer.duration);
        setProgress(clamp01(nextPos / buffer.duration));
        return;
      }

      const prevGain = currentGainRef.current;
      const prevSrc = currentSourceRef.current;
      await startSource(modeRef.current, nextPos, { crossfadeFrom: prevGain });
      stopRafs();
      rafRef.current = requestAnimationFrame(tickProgress);
      analyserRafRef.current = requestAnimationFrame(tickAnalyser);
      window.setTimeout(() => {
        try {
          prevSrc?.stop();
        } catch {
          // ignore
        }
      }, CROSSFADE_MS + 30);
    },
    [isPlaying, startSource, stopRafs, tickAnalyser, tickProgress],
  );

  return (
    <div className="min-w-0 space-y-0">
      <p className="mb-4 text-[13px] font-medium tracking-[-0.01em] text-black/88 sm:text-sm">
        4ever Falling, Miless — Walking Dead
      </p>
      <p className="-mt-3 mb-4 text-[11px] uppercase tracking-[0.18em] text-black/45 sm:text-xs">
        Original mix vs final master
      </p>

      <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-[#fafafa] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div
          className="relative px-4 pb-3 pt-5 sm:px-5 sm:pt-6"
          role="img"
          aria-label={
            isPlaying
              ? `Waveform preview playing, ${formatTime(currentSec)} of ${formatTime(totalSec)}`
              : `Waveform preview, ${mode === "after" ? "after" : "before"} mastering`
          }
        >
          <div
            ref={rootRef}
            className="relative h-[4.9rem] sm:h-[5.35rem]"
            onPointerDown={(e) => {
              if (!isReady) return;
              void handleSeek(e.clientX);
            }}
            role="presentation"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm" aria-hidden>
              <div
                className="h-full bg-black/[0.022] transition-[width] duration-75 ease-linear"
                style={{ width: progressPercent }}
              />
            </div>

            <div className="relative flex h-full items-end justify-between gap-[2px] sm:gap-[2.5px]" aria-hidden>
              {heights.map((h, i) => {
                const barProgress = (i + 0.5) / WAVEFORM_BAR_COUNT;
                const played = barProgress <= progress;
                const phase = (i % 11) * 0.09;
                const heightPct = waveformBarHeightPercent(h);
                const reactiveScale = 1 + liveLevel * 0.18;
                const computed = Math.min(100, Math.round(heightPct * reactiveScale));
                return (
                  <span
                    key={`${mode}-${i}`}
                    className={`w-[1.5px] shrink-0 rounded-full sm:w-[2px] ${
                      played
                        ? "bg-gradient-to-t from-black/55 via-black/45 to-black/30"
                        : "bg-gradient-to-t from-black/22 via-black/16 to-black/10"
                    } ${isPlaying ? "transition-[height] duration-75 ease-out" : "transition-[height] duration-150 ease-out"}`}
                    style={{
                      height: `${computed}%`,
                      opacity: isLoading ? 0.55 : 1,
                      filter: played ? "drop-shadow(0 1px 6px rgba(0,0,0,0.08))" : undefined,
                      transitionDelay: isPlaying ? `${phase * 0.35}s` : undefined,
                    }}
                  />
                );
              })}
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-black/25 transition-[left] duration-75 ease-linear"
              style={{ left: progressPercent }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/12 to-transparent" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-black/[0.06] bg-white/80 px-4 py-3.5 sm:px-5 sm:py-4">
          <div
            className="inline-flex rounded-full border border-black/[0.08] bg-neutral-50/80 p-0.5"
            role="group"
            aria-label="Compare before and after"
          >
            <button
              type="button"
              onClick={() => void handleModeChange("before")}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors sm:text-[11px] ${
                mode === "before" ? "bg-black text-white" : "text-black/45 hover:text-black/70"
              }`}
              disabled={!isReady}
            >
              Before
            </button>
            <button
              type="button"
              onClick={() => void handleModeChange("after")}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors sm:text-[11px] ${
                mode === "after" ? "bg-black text-white" : "text-black/45 hover:text-black/70"
              }`}
              disabled={!isReady}
            >
              After
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
            <button
              type="button"
              onClick={togglePlay}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.1] bg-white text-black/85 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-black/20 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                isPlaying ? "ring-1 ring-black/[0.05]" : ""
              }`}
              aria-label={!isReady ? "Loading preview" : isPlaying ? "Pause preview" : "Play preview"}
              disabled={!isReady}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <span className="font-mono text-[11px] tabular-nums tracking-[0.02em] text-black/42 sm:text-xs">
              {formatTime(currentSec)}
              <span className="text-black/25"> / </span>
              {formatTime(totalSec)}
            </span>
            {isLoading ? (
              <span className="ml-1 text-[11px] text-black/35 sm:text-xs">Loading audio…</span>
            ) : null}
            {error ? (
              <span className="ml-1 text-[11px] text-red-700/70 sm:text-xs">{error}</span>
            ) : null}
            <span className="ml-auto hidden text-black/28 sm:inline-flex" aria-hidden>
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
