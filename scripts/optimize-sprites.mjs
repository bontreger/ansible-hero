/**
 * Crop watermark region on large masters, then downscale PNGs under public/sprites.
 * Skips public/sprites/originals/ entirely (local masters; use npm run sprites:restore).
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPRITES_ROOT = path.join(__dirname, "..", "public", "sprites");

/** @param {string} relPosix path relative to sprites root, forward slashes */
function maxDimension(relPosix) {
  if (relPosix.startsWith("bg/")) return { width: 1280, height: 1280 };
  if (relPosix.startsWith("enemies/")) return { width: 720, height: 720 };
  if (relPosix.includes("portrait")) return { width: 128, height: 128 };
  if (relPosix.startsWith("player/")) return { width: 480, height: 480 };
  if (relPosix.startsWith("fx/")) return { width: 448, height: 448 };
  return { width: 512, height: 512 };
}

/**
 * Large-master crop: bg keeps symmetric inset; chroma subjects trim more on right/bottom (watermark).
 * @param {string} relPosix
 * @param {number} iw
 * @param {number} ih
 */
function extractRegion(relPosix, iw, ih) {
  if (relPosix.startsWith("bg/")) {
    const left = Math.round(iw * 0.05);
    const top = Math.round(ih * 0.05);
    const width = Math.max(1, Math.round(iw * 0.9));
    const height = Math.max(1, Math.round(ih * 0.9));
    return {
      left: Math.min(left, iw - 2),
      top: Math.min(top, ih - 2),
      width: Math.min(width, iw - left),
      height: Math.min(height, ih - top),
    };
  }
  const left = Math.round(iw * 0.06);
  const top = Math.round(ih * 0.05);
  const width = Math.max(1, Math.round(iw * 0.86));
  const height = Math.max(1, Math.round(ih * 0.9));
  return {
    left: Math.min(left, iw - 2),
    top: Math.min(top, ih - 2),
    width: Math.min(width, iw - left),
    height: Math.min(height, ih - top),
  };
}

/** Pixel-art paths: nearest-neighbor resize (avoids magenta bleeding into edges). */
function useNearestKernel(relPosix) {
  return (
    relPosix.startsWith("enemies/") ||
    relPosix.startsWith("player/") ||
    relPosix.startsWith("fx/")
  );
}

/** @returns {Promise<string[]>} */
async function collectPngs(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory() && ent.name === "originals") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await collectPngs(full, acc);
    } else if (ent.name.toLowerCase().endsWith(".png")) {
      acc.push(full);
    }
  }
  return acc;
}

async function main() {
  let files;
  try {
    files = await collectPngs(SPRITES_ROOT);
  } catch (e) {
    console.warn("optimize-sprites: no public/sprites directory, skipping.", e);
    return;
  }

  if (files.length === 0) {
    console.log("optimize-sprites: no PNG files found.");
    return;
  }

  for (const file of files) {
    const rel = path.relative(SPRITES_ROOT, file).split(path.sep).join("/");
    const meta = await sharp(file).metadata();
    const iw = meta.width ?? 0;
    const ih = meta.height ?? 0;
    if (iw < 4 || ih < 4) {
      console.warn(`optimize-sprites: skip tiny image ${rel}`);
      continue;
    }

    const { width: maxW, height: maxH } = maxDimension(rel);

    /** Only crop when still "master" sized so re-running optimize on shipped assets does not stack crops. */
    const shouldWatermarkCrop = iw > 900 || ih > 900;
    let pipeline = sharp(file);
    if (shouldWatermarkCrop) {
      pipeline = pipeline.extract(extractRegion(rel, iw, ih));
    }

    const resizeOpts = {
      width: maxW,
      height: maxH,
      fit: "inside",
      withoutEnlargement: true,
      ...(useNearestKernel(rel) ? { kernel: sharp.kernel.nearest } : {}),
    };

    const out = await pipeline
      .resize(resizeOpts)
      .png({ compressionLevel: 9 })
      .toBuffer();

    await sharp(out).toFile(file);
    const after = await sharp(file).metadata();
    const step = shouldWatermarkCrop ? "crop+scale" : "scale";
    console.log(
      `optimize-sprites: ${rel} ${iw}x${ih} -> ${step} -> ${after.width}x${after.height}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
