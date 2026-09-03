import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/require-admin";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const [updated] = await db
    .update(schema.propertyVisits)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.propertyVisits.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ visit: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.delete(schema.propertyVisits).where(eq(schema.propertyVisits.id, Number(id)));
  return NextResponse.json({ success: true });
}
