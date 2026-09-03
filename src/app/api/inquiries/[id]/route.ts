import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/require-admin";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "INTERESTED", "CLOSED"]).optional(),
  internalNotes: z.string().max(3000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const [updated] = await db
    .update(schema.inquiries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.inquiries.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ inquiry: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.delete(schema.inquiries).where(eq(schema.inquiries.id, Number(id)));
  return NextResponse.json({ success: true });
}
