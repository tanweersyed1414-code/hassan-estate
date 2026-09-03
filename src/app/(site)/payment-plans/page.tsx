import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InstallmentCalculator } from "@/components/site/installment-calculator";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { getActivePaymentPlans, getSiteSettingsMap } from "@/lib/queries";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment Plans & Installment Calculator",
  description: "Explore flexible easy installment payment plans for plots, houses and construction projects with Hassan Estates with Sandhu Builders.",
};

export default async function PaymentPlansPage() {
  const [plans, settings] = await Promise.all([getActivePaymentPlans(), getSiteSettingsMap()]);
  const bannerImage = settings.payment_plans_hero_image || "/demo/house-block-b-2.jpg";

  return (
    <div className="pt-28 pb-20">
      <div className="relative overflow-hidden bg-navy-950 py-10 text-white">
        <Image src={bannerImage} alt="Payment plans for Top City-1 properties" fill className="object-cover opacity-35" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 to-navy-950" />
        <div className="section-container relative z-10">
          <p className="eyebrow">Flexible Payments</p>
          <h1 className="mt-1 font-serif-brand text-3xl font-medium sm:text-4xl">Payment Plans</h1>
          <p className="mt-2 max-w-xl text-white/60">
            Easy installment options designed to make property ownership accessible.
          </p>
        </div>
      </div>

      <div className="section-container mt-12">
        <Reveal>
          <InstallmentCalculator />
        </Reveal>
      </div>

      <div className="section-container mt-16">
        <Reveal className="mb-8 text-center">
          <h2 className="font-serif-brand text-2xl font-medium text-navy-950 sm:text-3xl dark:text-white">Available Payment Plans</h2>
        </Reveal>

        {plans.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-white/40">No active payment plans right now — contact us for custom options.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map(({ plan, property }) => (
              <div key={plan.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">{plan.title}</h3>
                  {property && <Badge variant="outline">{property.city}</Badge>}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <PlanRow label="Total Price" value={formatPKR(plan.totalPrice)} />
                  <PlanRow label="Booking Amount" value={formatPKR(plan.bookingAmount)} />
                  <PlanRow label="Down Payment" value={formatPKR(plan.downPayment)} />
                  <PlanRow label="Remaining Amount" value={formatPKR(plan.remainingAmount)} />
                  <PlanRow label="Monthly Installment" value={formatPKR(plan.monthlyInstallment)} highlight />
                  <PlanRow label="Installments" value={`${plan.numberOfInstallments} months`} />
                </div>
                {plan.notes && <p className="mt-3 text-xs text-gray-400 dark:text-white/35">{plan.notes}</p>}
                {property && (
                  <Link
                    href={`/properties/${property.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-navy-900 underline-offset-4 hover:underline dark:text-white"
                  >
                    View Property →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-400 dark:text-white/35">
          All figures shown are indicative. Final payment terms are subject to confirmation by Hassan Estates with
          Sandhu Builders.
        </p>
      </div>
    </div>
  );
}

function PlanRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-white/50">{label}</span>
      <span className={highlight ? "font-semibold text-gold-600 dark:text-gold-400" : "font-medium text-navy-900 dark:text-white"}>{value}</span>
    </div>
  );
}
