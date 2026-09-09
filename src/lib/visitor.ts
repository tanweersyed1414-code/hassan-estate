import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import type { Visitor } from "@/db/schema";

/**
 * The signed-in public visitor (Google), or null. Safe to call in server
 * components and route handlers.
 */
export async function getVisitor(): Promise<Visitor | null> {
  const session = await auth();
  const visitorId = session?.user?.kind === "visitor" ? Number(session.user.visitorId) : NaN;
  if (!Number.isInteger(visitorId)) return null;
  const [row] = await db.select().from(schema.visitors).where(eq(schema.visitors.id, visitorId)).limit(1);
  return row ?? null;
}

/**
 * Route-handler guard: returns the visitor, or a ready 401 response.
 */
export async function requireVisitor() {
  const visitor = await getVisitor();
  if (!visitor) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Please sign in with Google to book a visit." }, { status: 401 }),
    };
  }
  return { ok: true as const, visitor };
}
