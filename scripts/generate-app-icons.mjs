#!/usr/bin/env node
/**
 * Copies the brand icon source file byte-for-byte to app/public paths.
 * No resize, padding, or format conversion.
 *
 * Run: node scripts/generate-app-icons.mjs
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "assets/brand/icon-source.jpg");
const targets = [
  join(root, "app/icon.jpg"),
  join(root, "app/apple-icon.jpg"),
  join(root, "public/icon.jpg"),
  join(root, "public/apple-icon.jpg"),
];

mkdirSync(join(root, "assets/brand"), { recursive: true });
mkdirSync(join(root, "public"), { recursive: true });

for (const dest of targets) {
  copyFileSync(source, dest);
  console.log("copied ->", dest.replace(root + "/", ""));
}

console.log("Done (exact copy, no transforms).");
