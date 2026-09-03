import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { saveUpload, UploadError } from "@/lib/storage";
import { db, schema } from "@/db";

export async function POST(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const result = await saveUpload(file);

    await db.insert(schema.mediaFiles).values({
      url: result.url,
      type: "IMAGE",
      fileName: result.fileName,
      fileSize: result.fileSize,
      uploadedById: Number(auth.session.user.id),
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
