import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { userSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = userSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form for errors." }, { status: 400 });
  const data = parsed.data;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email.toLowerCase();
  if (data.role) updates.role = data.role;
  if (data.isActive !== undefined) updates.isActive = data.isActive;
  if (data.password) updates.passwordHash = await bcrypt.hash(data.password, 12);

  const [updated] = await db
    .update(schema.users)
    .set(updates)
    .where(eq(schema.users.id, Number(id)))
    .returning({ id: schema.users.id, name: schema.users.name, email: schema.users.email, role: schema.users.role, isActive: schema.users.isActive });

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (Number(id) === Number(auth.session.user.id)) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  await db.delete(schema.users).where(eq(schema.users.id, Number(id)));
  return NextResponse.json({ success: true });
}
