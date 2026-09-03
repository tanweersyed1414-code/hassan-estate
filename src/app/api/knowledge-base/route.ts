import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { knowledgeSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const rows = await db.select().from(schema.aiKnowledgeBase).orderBy(desc(schema.aiKnowledgeBase.createdAt));
  return NextResponse.json({ entries: rows });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = knowledgeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form for errors." }, { status: 400 });

  const [created] = await db.insert(schema.aiKnowledgeBase).values(parsed.data).returning();
  return NextResponse.json({ entry: created });
}
