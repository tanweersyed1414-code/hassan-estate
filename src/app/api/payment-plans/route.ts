import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { paymentPlanSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const rows = await db.select().from(schema.paymentPlans).orderBy(desc(schema.paymentPlans.createdAt));
  return NextResponse.json({ plans: rows });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = paymentPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const remaining = Math.max(data.totalPrice - data.bookingAmount - data.downPayment, 0);
  const monthly = data.numberOfInstallments > 0 ? remaining / data.numberOfInstallments : 0;

  const [created] = await db
    .insert(schema.paymentPlans)
    .values({
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
    })
    .returning();

  return NextResponse.json({ plan: created });
}
