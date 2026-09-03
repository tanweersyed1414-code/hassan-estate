/**
 * Regenerates the browser-tab icons from the brand logo.
 *
 *   node scripts/make-favicon.mjs
 *
 * Reads public/brand/logo.png, crops to the house+wave mark (the wordmark is
 * unreadable at favicon size), and writes the three files Next.js App Router
 * auto-detects: src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico.
 * Re-run this whenever public/brand/logo.png changes.
 */
import sharp from "sharp";
import { writeFile } from "fs/promises";
import path from "path";

const SRC = "public/brand/logo.png";
const BG = { r: 17, g: 19, b: 24, alpha: 1 }; // matches the logo's dark ground / site navy-950

// The logo is 930x593: top ~2/3 is the house+wave mark, bottom ~1/3 is wordmark.
// Crop to just the mark so it stays legible at 16-32px.
const crop = { left: 84, top: 52, width: 656, height: 338 };

async function square(size, pad) {
  const inner = size - pad * 2;
  const mark = await sharp(SRC)
    .extract(crop)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

// PNG-encoded .ico (a single 32x32 entry; every current browser accepts this).
function pngToIco(png32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png32.length, 8); // size of PNG data
  entry.writeUInt32LE(6 + 16, 12); // offset to PNG data
  return Buffer.concat([header, entry, png32]);
}

const icon512 = await square(512, 40);
const apple180 = await square(180, 16);
const png32 = await square(32, 2);

await writeFile(path.join("src", "app", "icon.png"), icon512);
await writeFile(path.join("src", "app", "apple-icon.png"), apple180);
await writeFile(path.join("src", "app", "favicon.ico"), pngToIco(png32));

console.log("wrote src/app/icon.png (512), src/app/apple-icon.png (180), src/app/favicon.ico (32)");
