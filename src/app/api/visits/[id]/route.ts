import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/require-admin";
import { eq } from "drizzle-orm";
import { visitDecisionSchema } from "@/lib/validations";
import { sendVisitStatusEmail } from "@/lib/email";

const NOTIFY_STATUSES = new Set(["CONFIRMED", "CANCELLED", "COMPLETED"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const visitId = Number(id);
  const body = await req.json().catch(() => null);
  const parsed = visitDecisionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const [before] = await db.select().from(schema.propertyVisits).where(eq(schema.propertyVisits.id, visitId)).limit(1);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextStatus = parsed.data.status ?? before.status;
  const nextNote = parsed.data.adminNote ?? before.adminNote;
  const statusChanged = nextStatus !== before.status;
  const shouldNotify = statusChanged && NOTIFY_STATUSES.has(nextStatus) && Boolean(before.email);

  const [updated] = await db
    .update(schema.propertyVisits)
    .set({
      status: nextStatus,
      adminNote: nextNote,
      updatedAt: new Date(),
      ...(statusChanged ? { decidedAt: new Date() } : {}),
    })
    .where(eq(schema.propertyVisits.id, visitId))
    .returning();

  if (shouldNotify) {
    const property = updated.propertyId
      ? (await db.select().from(schema.properties).where(eq(schema.properties.id, updated.propertyId)).limit(1))[0]
      : undefined;

    const result = await sendVisitStatusEmail({
      to: updated.email,
      visitorName: updated.name,
      propertyTitle: property?.title || "the property",
      dateLabel: updated.preferredDate
        ? new Date(updated.preferredDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "your requested date",
      timeLabel: updated.preferredTime || "",
      status: nextStatus as "CONFIRMED" | "CANCELLED" | "COMPLETED",
      adminNote: updated.adminNote || undefined,
    });

    if (result.sent) {
      await db.update(schema.propertyVisits).set({ notifiedAt: new Date() }).where(eq(schema.propertyVisits.id, visitId));
    }
    return NextResponse.json({ visit: updated, emailed: result.sent, emailReason: result.sent ? undefined : result.reason });
  }

  return NextResponse.json({ visit: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.delete(schema.propertyVisits).where(eq(schema.propertyVisits.id, Number(id)));
  return NextResponse.json({ success: true });
}
