/**
 * One-time migration: copy ALL content from your local database to a remote
 * (production) database, and move locally-uploaded images to Cloudinary.
 *
 * What it does
 *   1. Reads every row from the SOURCE database (your local Postgres).
 *   2. Uploads each referenced /public/uploads/* image to Cloudinary and
 *      rewrites the image URLs in the data (skipped with --skip-images).
 *   3. TRUNCATEs the TARGET tables and inserts the rewritten rows, in
 *      foreign-key order, inside one transaction.
 *   4. Resets each table's id sequence so the admin panel keeps working.
 *
 * Usage (PowerShell)
 *   $env:TARGET_DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
 *   $env:CLOUDINARY_CLOUD_NAME="..."; $env:CLOUDINARY_API_KEY="..."; $env:CLOUDINARY_API_SECRET="..."
 *   node scripts/migrate-to-live.mjs --yes
 *
 * Options
 *   --yes           Required. Confirms the TARGET tables will be wiped & replaced.
 *   --skip-images   Copy rows only; leave /uploads/... URLs untouched
 *                   (use when the target host keeps a persistent public/uploads).
 *   SOURCE_DATABASE_URL  Override the local source (defaults to the dev DB).
 */
import "dotenv/config";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import postgres from "postgres";

const args = new Set(process.argv.slice(2));
const CONFIRMED = args.has("--yes");
const SKIP_IMAGES = args.has("--skip-images");

const SOURCE_URL =
  process.env.SOURCE_DATABASE_URL ||
  "postgresql://postgres:devpass123@127.0.0.1:5432/hassan_estates";
const TARGET_URL = process.env.TARGET_DATABASE_URL;

// Parent-before-child insert order. Truncation runs in the reverse order.
const TABLES = [
  "users",
  "construction_projects",
  "properties",
  "property_images",
  "property_features",
  "payment_plans",
  "payment_installments",
  "project_images",
  "project_features",
  "inquiries",
  "property_visits",
  "ai_knowledge_base",
  "site_settings",
  "media_files",
];

// Columns that hold an image URL and may point at /uploads/*
const URL_COLUMNS = {
  properties: ["featured_image"],
  property_images: ["url"],
  construction_projects: ["featured_image"],
  project_images: ["url"],
  media_files: ["url"],
  site_settings: ["value"],
};

function die(msg) {
  console.error("\n✖ " + msg + "\n");
  process.exit(1);
}

if (!TARGET_URL) die("Set TARGET_DATABASE_URL to your production (Neon) connection string.");
if (!CONFIRMED) {
  die(
    "This wipes and replaces every table in the TARGET database.\n" +
      "  Re-run with --yes once you've pointed TARGET_DATABASE_URL at the right database."
  );
}

const cloud = {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
};
if (!SKIP_IMAGES && (!cloud.name || !cloud.key || !cloud.secret)) {
  die(
    "Cloudinary env vars are required to move uploaded images.\n" +
      "  Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET,\n" +
      "  or pass --skip-images to copy the database rows only."
  );
}

async function cloudinaryUpload(absPath, publicId) {
  const buf = await readFile(absPath);
  const ts = Math.floor(Date.now() / 1000);
  // Sign only the params we send, in alphabetical order, then append the secret.
  const toSign = `public_id=${publicId}&timestamp=${ts}`;
  const signature = createHash("sha1")
    .update(toSign + cloud.secret.trim())
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([buf]));
  form.append("api_key", cloud.key.trim());
  form.append("timestamp", String(ts));
  form.append("public_id", publicId);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.name.trim()}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status}): ${await res.text()}`);
  return (await res.json()).secure_url;
}

const source = postgres(SOURCE_URL, { max: 4 });
const target = postgres(TARGET_URL, { max: 4 });

try {
  // ---- 0. sanity checks ----
  const [{ exists: targetReady }] = await target`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'properties'
    ) AS exists`;
  if (!targetReady) {
    die(
      "The target database has no tables yet.\n" +
        "  Run this first:  $env:DATABASE_URL=\"<target url>\"; npm run db:push"
    );
  }

  // ---- 1. read every table from the source ----
  const data = {};
  for (const t of TABLES) {
    data[t] = await source`SELECT * FROM ${source(t)}`;
    console.log(`  read ${String(data[t].length).padStart(4)}  ${t}`);
  }

  // ---- 2. move referenced uploads to Cloudinary, build a rewrite map ----
  const urlMap = new Map(); // "/uploads/abc.jpg" -> "https://res.cloudinary.com/..."
  if (!SKIP_IMAGES) {
    const referenced = new Set();
    for (const [t, cols] of Object.entries(URL_COLUMNS)) {
      for (const row of data[t] || []) {
        for (const c of cols) {
          const v = row[c];
          if (typeof v === "string" && v.startsWith("/uploads/")) referenced.add(v);
        }
      }
    }
    console.log(`\n  ${referenced.size} uploaded image(s) to move to Cloudinary`);
    for (const rel of referenced) {
      const file = rel.replace(/^\/uploads\//, "");
      const abs = path.join(process.cwd(), "public", "uploads", file);
      const publicId = "hassan-estates/" + file.replace(/\.[^.]+$/, "");
      try {
        const secureUrl = await cloudinaryUpload(abs, publicId);
        urlMap.set(rel, secureUrl);
        console.log(`    ✓ ${file}`);
      } catch (err) {
        console.log(`    ✖ ${file} — ${err.message}`);
        die("Aborting so the database is left untouched. Fix the upload issue and re-run.");
      }
    }
  }

  const rewrite = (t, row) => {
    const cols = URL_COLUMNS[t];
    if (!cols) return row;
    const out = { ...row };
    for (const c of cols) {
      if (urlMap.has(out[c])) out[c] = urlMap.get(out[c]);
    }
    return out;
  };

  // ---- 3. replace the target contents in one transaction ----
  await target.begin(async (tx) => {
    await tx.unsafe(
      `TRUNCATE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`
    );
    for (const t of TABLES) {
      const rows = (data[t] || []).map((r) => rewrite(t, r));
      if (!rows.length) continue;
      await tx`INSERT INTO ${tx(t)} ${tx(rows)}`;
      console.log(`  wrote ${String(rows.length).padStart(4)}  ${t}`);
    }
  });

  // ---- 4. reset id sequences ----
  for (const t of TABLES) {
    const [{ max }] = await target`SELECT COALESCE(MAX(id), 0)::int AS max FROM ${target(t)}`;
    if (max > 0) await target`SELECT setval(pg_get_serial_sequence(${t}, 'id'), ${max})`;
  }

  console.log("\n✓ Done. Your live database now mirrors your local content.");
  if (!SKIP_IMAGES) console.log("  Images are served from Cloudinary.");
  console.log("  Do NOT run `npm run db:seed` against this database — the admin");
  console.log("  users were copied over, so log in with your existing credentials.\n");
} catch (err) {
  console.error("\n✖ Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await source.end();
  await target.end();
}
