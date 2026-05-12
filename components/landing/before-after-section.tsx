"use client";

import { useCallback, useState } from "react";

export function BeforeAfterSection() {
  const [mode, setMode] = useState<"before" | "after">("after");

  const toggle = useCallback((next: "before" | "after") => {
    setMode(next);
  }, []);

  return (
    <section
      id="before-after"
      className="border-t border-neutral-200/90 bg-white py-12 sm:py-14 md:py-16"
      aria-labelledby="before-after-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-100/45 p-7 shadow-[0_2px_16px_-8px_rgba(0,0,0,0.08)] sm:p-9 md:p-10 lg:p-11">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-14">
            <div className="max-w-md space-y-3.5 lg:space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                Hear the difference
              </p>
              <h2
                id="before-after-heading"
                className="text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.03em] text-black sm:text-[1.75rem] md:text-[1.9375rem]"
              >
                Before &amp; after mastering
              </h2>
              <p className="text-[13px] leading-[1.65] text-gray-600 sm:text-sm">
                Industry-ready translation — clarity, punch and balance designed
                to make your music catch attention from the first second.
              </p>
            </div>

            <div className="min-w-0 flex-1 space-y-5">
              <p className="text-[13px] font-medium text-black sm:text-sm">
                Artist name — Track title
              </p>

              <div
                className="flex h-14 items-end gap-0.5 rounded-lg border border-neutral-200/95 bg-white px-2 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] sm:h-16 sm:px-3"
                aria-hidden
              >
                {Array.from({ length: 48 }).map((_, i) => {
                  const h =
                    mode === "after"
                      ? 18 + ((i * 7 + 13) % 38)
                      : 10 + ((i * 5 + 9) % 22);
                  return (
                    <span
                      key={i}
                      className="w-1 rounded-sm bg-gray-900/80"
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="inline-flex rounded-full border border-gray-200 bg-white p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  role="group"
                  aria-label="Compare before and after"
                >
                  <button
                    type="button"
                    onClick={() => toggle("before")}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-colors sm:text-xs ${
                      mode === "before"
                        ? "bg-black text-white"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle("after")}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-colors sm:text-xs ${
                      mode === "after"
                        ? "bg-black text-white"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    After
                  </button>
                </div>

                <div className="flex flex-1 flex-wrap items-center gap-3 text-gray-500">
                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black transition-colors hover:border-gray-300 hover:bg-neutral-50"
                    aria-label="Play preview (demo)"
                  >
                    <PlayIcon />
                  </button>
                  <span className="font-mono text-[11px] tabular-nums sm:text-xs">
                    0:00 / 0:30
                  </span>
                  <span className="ml-auto hidden text-gray-400 sm:inline" aria-hidden>
                    <VolumeIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
