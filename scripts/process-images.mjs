#!/usr/bin/env node
// Builds the optimized site images in /public from the originals in /assets-src.
// Run once after adding or replacing a source picture:  npm run images
//
// assets-src/
//   logo.png                 brand logo (transparent PNG)
//   hero/*.jpg               hero photos → /public/images/hero/<name>-{640,1024,1600,2048}.webp
//   about/*.jpg              → /public/images/about/<name>.webp (max 1200 wide)
//   vehicles/*.png           transparent vehicle cut-outs → /public/images/vehicles/<name>.webp (max 900 wide)
//   icons/*.png              part icons → /public/images/icons/<name>.webp (240 px)
//   trust/*.png              trust badges → /public/images/trust/<name>.webp (300 px)

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(process.cwd());
const src = path.join(root, "assets-src");
const pub = path.join(root, "public");
const ensure = (d) => mkdir(d, { recursive: true });
const base = (f) => path.basename(f).replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const exists = async (d) => readdir(d).catch(() => []);

async function brand() {
  const file = path.join(src, "logo.png");
  const input = await readFile(file).catch(() => null);
  if (!input) return console.log("skip brand: assets-src/logo.png not found");
  const dir = path.join(pub, "brand");
  await ensure(dir);
  const trimmed = sharp(input).trim();
  const meta = await trimmed.clone().metadata();
  await trimmed.clone().resize({ width: 400, withoutEnlargement: true }).png().toFile(path.join(dir, "logo.png"));
  await trimmed.clone().resize({ width: 400, withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(dir, "logo.webp"));
  await trimmed.clone().resize({ width: 240, withoutEnlargement: true }).png().toFile(path.join(dir, "logo-mark.png"));
  await trimmed.clone().resize({ width: 240, withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(dir, "logo-mark.webp"));
  // Square icons on the dark brand background (Google and home screens want a solid square).
  const square = async (size, out, pad = 0.12) => {
    const inner = Math.round(size * (1 - pad * 2));
    const logo = await trimmed.clone().resize({ width: inner, height: inner, fit: "inside" }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: "#0B0C0F" } })
      .composite([{ input: logo, gravity: "centre" }])
      .png()
      .toFile(out);
  };
  await square(512, path.join(dir, "logo-512.png"));
  await square(180, path.join(root, "src", "app", "apple-icon.png"));
  await square(64, path.join(root, "src", "app", "icon.png"), 0.08);
  // favicon.ico: a 32px PNG wrapped in an ICO container.
  const png32 = await (async () => {
    const inner = 28;
    const logo = await trimmed.clone().resize({ width: inner, height: inner, fit: "inside" }).png().toBuffer();
    return sharp({ create: { width: 32, height: 32, channels: 4, background: "#0B0C0F" } }).composite([{ input: logo, gravity: "centre" }]).png().toBuffer();
  })();
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // planes
  header.writeUInt16LE(32, 12); // bpp
  header.writeUInt32LE(png32.length, 14); // size
  header.writeUInt32LE(22, 18); // offset
  await writeFile(path.join(root, "src", "app", "favicon.ico"), Buffer.concat([header, png32]));
  console.log(`brand: logo ${meta.width}x${meta.height} → logo.webp, logo-mark.webp, logo-512.png, icons`);
}

async function hero() {
  const dir = path.join(src, "hero");
  const files = (await exists(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files.length) return console.log("skip hero: no files in assets-src/hero");
  const out = path.join(pub, "images", "hero");
  await ensure(out);
  for (const f of files) {
    const input = await readFile(path.join(dir, f));
    for (const w of [640, 1024, 1600, 2048]) {
      await sharp(input).resize({ width: w, withoutEnlargement: true }).webp({ quality: w >= 1600 ? 74 : 78, effort: 5 }).toFile(path.join(out, `${base(f)}-${w}.webp`));
    }
    console.log(`hero: ${f} → ${base(f)}-{640,1024,1600,2048}.webp`);
  }
}

async function simple(sub, maxWidth, quality, keepAlpha = false) {
  const dir = path.join(src, sub);
  const files = (await exists(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files.length) return console.log(`skip ${sub}: no files in assets-src/${sub}`);
  const out = path.join(pub, "images", sub);
  await ensure(out);
  for (const f of files) {
    const input = await readFile(path.join(dir, f));
    let img = sharp(input);
    if (keepAlpha) img = img.trim({ threshold: 10 });
    await img.resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality, effort: 5, alphaQuality: 90 }).toFile(path.join(out, `${base(f)}.webp`));
    console.log(`${sub}: ${f} → ${base(f)}.webp`);
  }
}

await brand();
await hero();
await simple("about", 1200, 80);
await simple("vehicles", 900, 82, true);
await simple("icons", 240, 85, true);
await simple("trust", 300, 85, true);
console.log("done");
