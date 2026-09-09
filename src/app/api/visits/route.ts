import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { visitSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/require-admin";
import { requireVisitor } from "@/lib/visitor";
import { desc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  // Booking a visit requires a signed-in Google visitor.
  const gate = await requireVisitor();
  if (!gate.ok) return gate.response;
  const { visitor } = gate;

  const rl = checkRateLimit(`visit:${visitor.id}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = visitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const [created] = await db
    .insert(schema.propertyVisits)
    .values({
      name: visitor.name || "Google user",
      email: visitor.email,
      visitorId: visitor.id,
      phone: data.phone,
      propertyId: data.propertyId || null,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
      preferredTime: data.preferredTime,
      message: data.message,
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
    ? await db.select().from(schema.propertyVisits).where(eq(schema.propertyVisits.status, status as never)).orderBy(desc(schema.propertyVisits.createdAt))
    : await db.select().from(schema.propertyVisits).orderBy(desc(schema.propertyVisits.createdAt));

  return NextResponse.json({ visits: rows });
}
