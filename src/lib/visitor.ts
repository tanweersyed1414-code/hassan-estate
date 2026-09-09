import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { and, desc, eq, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
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

/** A visit has an "unread" update when the admin decided it after the visitor last looked. */
const unseenUpdate = (visitorId: number) =>
  and(
    eq(schema.propertyVisits.visitorId, visitorId),
    isNotNull(schema.propertyVisits.decidedAt),
    or(
      isNull(schema.propertyVisits.visitorSeenAt),
      lt(schema.propertyVisits.visitorSeenAt, schema.propertyVisits.decidedAt)
    )
  );

/** How many of this visitor's visits have an admin decision they haven't seen yet. */
export async function countUnseenVisitUpdates(visitorId: number): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.propertyVisits)
    .where(unseenUpdate(visitorId));
  return row?.n ?? 0;
}

/** Called when the visitor opens /my-visits — clears the unread dot. */
export async function markVisitUpdatesSeen(visitorId: number): Promise<void> {
  await db
    .update(schema.propertyVisits)
    .set({ visitorSeenAt: new Date() })
    .where(unseenUpdate(visitorId));
}

/** The visitor's most recent visit request for a given property, if any. */
export async function getVisitorRequestForProperty(visitorId: number, propertyId: number) {
  const [row] = await db
    .select()
    .from(schema.propertyVisits)
    .where(and(eq(schema.propertyVisits.visitorId, visitorId), eq(schema.propertyVisits.propertyId, propertyId)))
    .orderBy(desc(schema.propertyVisits.createdAt))
    .limit(1);
  return row ?? null;
}
