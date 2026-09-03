import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { paymentPlanSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = paymentPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors." }, { status: 400 });
  }
  const data = parsed.data;
  const remaining = Math.max(data.totalPrice - data.bookingAmount - data.downPayment, 0);
  const monthly = data.numberOfInstallments > 0 ? remaining / data.numberOfInstallments : 0;

  const [updated] = await db
    .update(schema.paymentPlans)
    .set({
      title: data.title,
      propertyId: data.propertyId || null,
      totalPrice: String(data.totalPrice),
      bookingAmount: String(data.bookingAmount),
      downPayment: String(data.downPayment),
      remainingAmount: String(remaining),
      monthlyInstallment: String(monthly),
      numberOfInstallments: data.numberOfInstallments,
      notes: data.notes,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(schema.paymentPlans.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ plan: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.delete(schema.paymentPlans).where(eq(schema.paymentPlans.id, Number(id)));
  return NextResponse.json({ success: true });
}
