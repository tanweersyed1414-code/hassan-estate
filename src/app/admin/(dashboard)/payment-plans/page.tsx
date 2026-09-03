import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { PaymentPlanModal } from "@/components/admin/payment-plan-modal";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPlansPage() {
  const [plans, properties] = await Promise.all([
    db.select().from(schema.paymentPlans).orderBy(desc(schema.paymentPlans.createdAt)),
    db.select().from(schema.properties),
  ]);
  const propertyMap = new Map(properties.map((p) => [p.id, p.title]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Payment Plans</h1>
          <p className="text-sm text-gray-500 dark:text-white/50">{plans.length} plans configured</p>
        </div>
        <PaymentPlanModal properties={properties} />
      </div>

      <div className="admin-card overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-white/[0.06] dark:text-white/40">
            <tr>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Property</th>
              <th className="px-5 py-3">Total Price</th>
              <th className="px-5 py-3">Monthly</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-white/5">
                <td className="px-5 py-3 font-medium text-navy-950 dark:text-white">{p.title}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">{p.propertyId ? propertyMap.get(p.propertyId) || "—" : "—"}</td>
                <td className="px-5 py-3 dark:text-white/80">{formatPKR(p.totalPrice)}</td>
                <td className="px-5 py-3 dark:text-white/80">{formatPKR(p.monthlyInstallment)}</td>
                <td className="px-5 py-3">
                  <Badge variant={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <PaymentPlanModal
                      plan={p}
                      properties={properties}
                      trigger={
                        <button className="flex h-8 w-8 items-center justify-center rounded-full text-navy-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10">
                          <Pencil className="h-4 w-4" />
                        </button>
                      }
                    />
                    <DeleteButton url={`/api/payment-plans/${p.id}`} label="payment plan" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 && <p className="p-8 text-center text-gray-400 dark:text-white/40">No payment plans yet.</p>}
      </div>
    </div>
  );
}
