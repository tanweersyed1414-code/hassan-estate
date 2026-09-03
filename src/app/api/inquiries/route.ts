import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { inquirySchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/require-admin";
import { desc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`inquiry:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const [created] = await db
    .insert(schema.inquiries)
    .values({
      name: data.name,
      phone: data.phone,
      email: data.email || "",
      inquiryType: data.inquiryType,
      propertyId: data.propertyId || null,
      projectId: data.projectId || null,
      message: data.message,
      source: data.source,
    })
    .returning();

  return NextResponse.json({ success: true, id: created.id });
}

export async function GET(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const rows = status
    ? await db.select().from(schema.inquiries).where(eq(schema.inquiries.status, status as never)).orderBy(desc(schema.inquiries.createdAt))
    : await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt));

  return NextResponse.json({ inquiries: rows });
}
