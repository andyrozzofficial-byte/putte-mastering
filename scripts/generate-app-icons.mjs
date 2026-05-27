#!/usr/bin/env node
/**
 * Regenerate app + public icons from assets/brand/icon-master.png
 * Run: node scripts/generate-app-icons.mjs
 */
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const master = join(root, "assets/brand/icon-master.png");
const appDir = join(root, "app");
const publicDir = join(root, "public");
const tmp = join(root, ".tmp-icon-build");

function sips(args) {
  execSync(`sips ${args}`, { stdio: "inherit" });
}

async function writeIco() {
  const toIco = (await import(join(tmp, "node_modules/to-ico/index.js"))).default;
  const sizes = [16, 32, 48];
  const pngs = sizes.map((s) => readFileSync(join(tmp, `${s}.png`)));
  const buf = await toIco(pngs);
  writeFileSync(join(appDir, "favicon.ico"), buf);
  writeFileSync(join(publicDir, "favicon.ico"), buf);
  console.log(`favicon.ico (${buf.length} bytes)`);
}

mkdirSync(tmp, { recursive: true });
mkdirSync(join(root, "assets/brand"), { recursive: true });
mkdirSync(publicDir, { recursive: true });

console.log("Source:", master);
sips(`-z 512 512 "${master}" --out "${join(appDir, "icon.png")}"`);
sips(`-z 180 180 "${master}" --out "${join(appDir, "apple-icon.png")}"`);

for (const size of [16, 32, 48]) {
  sips(`-z ${size} ${size} "${master}" --out "${join(tmp, `${size}.png`)}"`);
}

execSync("npm init -y", { cwd: tmp, stdio: "ignore" });
execSync("npm install to-ico --silent", { cwd: tmp, stdio: "ignore" });
await writeIco();

copyFileSync(join(appDir, "icon.png"), join(publicDir, "icon.png"));
copyFileSync(join(appDir, "apple-icon.png"), join(publicDir, "apple-icon.png"));
sips(`-z 192 192 "${master}" --out "${join(publicDir, "icon-192.png")}"`);
sips(`-z 512 512 "${master}" --out "${join(publicDir, "icon-512.png")}"`);
copyFileSync(
  join(publicDir, "apple-icon.png"),
  join(publicDir, "apple-touch-icon.png"),
);

console.log("Done. Updated app/ and public/ icons.");
