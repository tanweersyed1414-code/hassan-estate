import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { userSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const rows = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      lastLoginAt: schema.users.lastLoginAt,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt));

  return NextResponse.json({ users: rows });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form for errors." }, { status: 400 });
  const data = parsed.data;

  if (!data.password) {
    return NextResponse.json({ error: "Password is required for new users." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const [created] = await db
    .insert(schema.users)
    .values({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      isActive: data.isActive,
    })
    .returning({ id: schema.users.id, name: schema.users.name, email: schema.users.email, role: schema.users.role });

  return NextResponse.json({ user: created });
}
