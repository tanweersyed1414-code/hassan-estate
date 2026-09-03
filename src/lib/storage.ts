import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

// Magic-byte signatures so we validate the *actual* file content, not just
// the client-supplied MIME type / extension (prevents disguised uploads).
const SIGNATURES: { mime: string; bytes: number[]; offset?: number }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP
];

function detectRealType(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    const offset = sig.offset || 0;
    if (sig.bytes.every((b, i) => buffer[offset + i] === b)) {
      if (sig.mime === "image/webp") {
        const marker = buffer.subarray(8, 12).toString("ascii");
        if (marker !== "WEBP") continue;
      }
      return sig.mime;
    }
  }
  return null;
}

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
}

export class UploadError extends Error {}

export async function saveUpload(file: File): Promise<UploadResult> {
  if (file.size === 0) throw new UploadError("Empty file.");
  if (file.size > MAX_SIZE_BYTES) throw new UploadError("File is too large. Maximum size is 8MB.");
  if (!ALLOWED_TYPES[file.type]) {
    throw new UploadError("Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const realType = detectRealType(buffer);
  if (!realType || !ALLOWED_TYPES[realType]) {
    throw new UploadError("The file content does not match a supported image format.");
  }

  const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryConfigured) {
    return uploadToCloudinary(buffer, ALLOWED_TYPES[realType]);
  }

  return saveLocally(buffer, ALLOWED_TYPES[realType]);
}

async function saveLocally(buffer: Buffer, ext: string): Promise<UploadResult> {
  const fileName = `${randomUUID()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), buffer);

  return { url: `/uploads/${fileName}`, fileName, fileSize: buffer.length };
}

async function uploadToCloudinary(buffer: Buffer, ext: string): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `timestamp=${timestamp}`;
  const { createHash } = await import("crypto");
  const signature = createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), `upload.${ext}`);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new UploadError(`Cloudinary upload failed: ${text}`);
  }

  const data = await res.json();
  return { url: data.secure_url, fileName: data.public_id, fileSize: buffer.length };
}
