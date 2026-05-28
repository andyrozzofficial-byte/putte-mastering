"use client";

import { saveOrderUploadDraft } from "@/lib/order-flow-session";
import {
  getUploadSizeValidationError,
  mapStorageUploadError,
  MAX_UPLOAD_LABEL,
} from "@/lib/upload-limits";
import { uploadCustomerTrack } from "@/lib/upload-customer-track";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type UploadDropzoneProps = {
  /** Navigates here after a file is chosen or dropped (order flow). */
  nextStepHref?: string;
  /** Tighter treatment when nested in the hero column. */
  variant?: "default" | "embedded";
};

export function UploadDropzone({
  nextStepHref = "/order/tjanst",
  variant = "default",
}: UploadDropzoneProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [legalConsentAccepted, setLegalConsentAccepted] = useState(false);
  const [legalConsentError, setLegalConsentError] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      const sizeError = getUploadSizeValidationError(file, "upload-dropzone");
      if (sizeError) {
        setUploadError(sizeError);
        return;
      }
      setBusy(true);
      try {
        const { storageRef } = await uploadCustomerTrack(file);
        saveOrderUploadDraft({
          storageRef,
          trackName: file.name,
          legalConsentAccepted: true,
        });
        router.push(nextStepHref);
      } catch (e) {
        const msg =
          e instanceof Error
            ? mapStorageUploadError(e.message, file.size)
            : "Upload failed. Please try again.";
        setUploadError(msg);
      } finally {
        setBusy(false);
      }
    },
    [router, nextStepHref],
  );

  const onPick = useCallback(() => {
    if (!legalConsentAccepted) {
      setLegalConsentError(true);
      return;
    }
    inputRef.current?.click();
  }, [legalConsentAccepted]);

  const embedded = variant === "embedded";

  const consentPadding = embedded ? "px-6 sm:px-7" : "px-5 sm:px-8";

  return (
    <div id="upload" aria-busy={busy}>
      <div className="w-full">
        <div
          className={`rounded-2xl transition-colors ${
            embedded
              ? `bg-neutral-50/55 p-0.5 shadow-[0_10px_40px_-22px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04] ${
                  active ? "ring-1 ring-neutral-300/40" : ""
                }`
              : `border border-neutral-200/50 bg-gradient-to-b from-white to-neutral-50/40 p-1 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.05)] sm:p-1.5 ${
                  active ? "ring-1 ring-neutral-300/50" : ""
                }`
          } ${busy ? "pointer-events-none opacity-70" : ""}`}
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
              if (!legalConsentAccepted) {
                setLegalConsentError(true);
                return;
              }
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            aria-disabled={!legalConsentAccepted}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-center transition-colors ${
              embedded
                ? `px-6 py-7 sm:px-7 sm:py-8 ${
                    active
                      ? "border-neutral-400/60 bg-neutral-50/90"
                      : "border-neutral-300/45 bg-white/75 hover:border-neutral-400/80"
                  }`
                : `px-5 py-8 sm:px-8 sm:py-10 ${
                    active
                      ? "border-neutral-400/70 bg-neutral-50/80"
                      : "border-neutral-300/55 bg-white/80 hover:border-neutral-400/80"
                  }`
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
                if (file && !legalConsentAccepted) {
                  setLegalConsentError(true);
                  e.target.value = "";
                  return;
                }
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
            <UploadCloudIcon className="mb-2 text-gray-400" embedded={embedded} />
            <p
              className={`font-semibold tracking-tight text-black ${
                embedded ? "text-[15px] sm:text-base" : "text-base sm:text-[17px]"
              }`}
            >
              Drag &amp; drop your file here
            </p>
            <p
              className={`mt-1.5 text-gray-500 ${
                embedded ? "text-[12px] sm:text-[13px]" : "text-[13px] sm:text-sm"
              }`}
            >
              or click to choose a file
            </p>
            <p
              className={`mt-4 text-gray-400 ${
                embedded ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-xs"
              }`}
            >
              WAV, AIFF, FLAC, MP3 up to {MAX_UPLOAD_LABEL}
            </p>
            {busy ? <p className="mt-4 text-[13px] text-gray-500">Uploading…</p> : null}
            {uploadError ? (
              <p className="mt-4 text-center text-[13px] text-red-700" role="alert">
                {uploadError}
              </p>
            ) : null}
          </div>
        </div>

        <div className={`mt-6 w-full text-left ${consentPadding}`}>
          <div className="max-w-[520px]">
            <label className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              checked={legalConsentAccepted}
              onChange={(e) => {
                const next = e.target.checked;
                setLegalConsentAccepted(next);
                if (next) setLegalConsentError(false);
              }}
              className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 text-black accent-black"
            />
            <div className="min-w-0">
              <span className="block text-xs leading-relaxed text-black/65">
                I confirm I own or have permission to upload this material.
              </span>
            </div>
            </label>

            <p className="mt-1.5 pl-[26px] text-xs leading-relaxed text-black/60">
            By uploading files, I agree to the{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 transition-colors hover:text-black/75"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-black/75"
            >
              Privacy Policy
            </Link>
            . Uploaded files remain my property and responsibility.
          </p>

            {legalConsentError ? (
              <p
                className="mt-2 pl-[26px] text-[11px] leading-relaxed text-red-700"
                role="alert"
              >
                Please confirm ownership and accept the terms before uploading.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadCloudIcon({
  className,
  embedded,
}: {
  className?: string;
  embedded?: boolean;
}) {
  return (
    <svg
      className={className}
      width={embedded ? 40 : 48}
      height={embedded ? 40 : 48}
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
