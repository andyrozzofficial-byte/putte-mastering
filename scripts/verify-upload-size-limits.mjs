#!/usr/bin/env node
/**
 * Validates upload size math and optionally uploads a ~53 MiB test WAV to Supabase.
 * Run: node scripts/verify-upload-size-limits.mjs
 * With upload: node --env-file=.env.local scripts/verify-upload-size-limits.mjs --upload
 */

import { readFileSync, statSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BYTES_PER_MIB = 1024 * 1024;
const MAX_UPLOAD_BYTES = 500 * BYTES_PER_MIB;
const FIFTY_MIB = 50 * BYTES_PER_MIB;

function bytesToMebibytes(bytes) {
  return bytes / BYTES_PER_MIB;
}

function isWithinUploadLimit(bytes) {
  return Number.isFinite(bytes) && bytes >= 0 && bytes <= MAX_UPLOAD_BYTES;
}

function getUploadSizeValidationError(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "invalid size";
  if (isWithinUploadLimit(bytes)) return null;
  return "too large";
}

/** ~52.7 MiB — typical Finder “52.7 MB” WAV (binary). */
const FILE_52_7_MIB = Math.round(52.7 * BYTES_PER_MIB);
/** 53 full mebibytes */
const FILE_53_MIB = 53 * BYTES_PER_MIB;
/** Just over 50 MiB binary (old Supabase local cap). */
const FILE_50_MIB_PLUS = FIFTY_MIB + 1;
/** Just under 500 MiB */
const FILE_499_MIB = 499 * BYTES_PER_MIB;

const cases = [
  { label: "52.7 MiB WAV (typical)", bytes: FILE_52_7_MIB, expectOk: true },
  { label: "53 MiB", bytes: FILE_53_MIB, expectOk: true },
  { label: "50 MiB + 1 byte (old bucket cap)", bytes: FILE_50_MIB_PLUS, expectOk: true },
  { label: "499 MiB", bytes: FILE_499_MIB, expectOk: true },
  { label: "500 MiB + 1 byte", bytes: MAX_UPLOAD_BYTES + 1, expectOk: false },
  { label: "50 MiB exactly", bytes: FIFTY_MIB, expectOk: true },
];

let failed = 0;
for (const c of cases) {
  const ok = isWithinUploadLimit(c.bytes);
  const err = getUploadSizeValidationError(c.bytes);
  const pass = ok === c.expectOk && (c.expectOk ? err === null : err !== null);
  console.log(
    pass ? "✓" : "✗",
    c.label,
    "|",
    c.bytes.toLocaleString(),
    "bytes",
    `(${bytesToMebibytes(c.bytes).toFixed(2)} MiB)`,
    pass ? "" : `EXPECTED ${c.expectOk ? "accept" : "reject"}, got ${ok ? "accept" : "reject"}`,
  );
  if (!pass) failed++;
}

console.log("\nConstants:", {
  MAX_UPLOAD_BYTES,
  MAX_MIB: bytesToMebibytes(MAX_UPLOAD_BYTES),
  FIFTY_MIB,
});

const testWavPath = join(tmpdir(), `putte-upload-test-${Date.now()}.wav`);
const payloadBytes = FILE_53_MIB;
const dataBytes = payloadBytes - 44;

async function writeTestWav(path, dataSize) {
  const { open, write, close } = await import("node:fs/promises");
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(44100, 24);
  header.writeUInt32LE(44100 * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  const fd = await open(path, "w");
  await write(fd, header);
  const chunk = Buffer.alloc(4 * 1024 * 1024);
  let remaining = dataSize;
  while (remaining > 0) {
    const n = Math.min(remaining, chunk.length);
    await write(fd, n === chunk.length ? chunk : chunk.subarray(0, n));
    remaining -= n;
  }
  await close(fd);
}

console.log(`\nWriting test WAV (~${bytesToMebibytes(payloadBytes).toFixed(1)} MiB) → ${testWavPath}`);
await writeTestWav(testWavPath, dataBytes);
const fileBytes = statSync(testWavPath).size;
const validationErr = getUploadSizeValidationError(fileBytes);
console.log("On-disk size:", fileBytes.toLocaleString(), "bytes", `(${bytesToMebibytes(fileBytes).toFixed(2)} MiB)`);
console.log("Validation:", validationErr ?? "accepted");

if (validationErr) {
  failed++;
  console.error("Test WAV should be accepted by app validation.");
}

const doUpload = process.argv.includes("--upload");
if (doUpload) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("Skip upload: set NEXT_PUBLIC_SUPABASE_URL and a Supabase key in .env.local");
  } else {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const objectPath = `incoming/test-${Date.now()}.wav`;
    const body = readFileSync(testWavPath);
    console.log("\nUploading to uploads/", objectPath, "…");
    const { error } = await supabase.storage.from("uploads").upload(objectPath, body, {
      contentType: "audio/wav",
      upsert: false,
    });
    if (error) {
      console.error("Upload failed:", error.message);
      failed++;
    } else {
      console.log("Upload OK");
      await supabase.storage.from("uploads").remove([objectPath]);
    }
  }
}

try {
  unlinkSync(testWavPath);
} catch {
  /* ignore */
}

if (failed > 0) {
  process.exit(1);
}
console.log("\nAll checks passed.");
