import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { knowledgeSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = knowledgeSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form for errors." }, { status: 400 });

  const [updated] = await db
    .update(schema.aiKnowledgeBase)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.aiKnowledgeBase.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ entry: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.delete(schema.aiKnowledgeBase).where(eq(schema.aiKnowledgeBase.id, Number(id)));
  return NextResponse.json({ success: true });
}
