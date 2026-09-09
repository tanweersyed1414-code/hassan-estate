import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { getVisitor, markVisitUpdatesSeen } from "@/lib/visitor";
import { SignInPrompt } from "./sign-in-prompt";
import { MarkSeen } from "./mark-seen";

export const metadata: Metadata = {
  title: "My Visits",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  NEW: { label: "Pending review", cls: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  CONFIRMED: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  COMPLETED: { label: "Completed", cls: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
};

export default async function MyVisitsPage() {
  const visitor = await getVisitor();

  if (!visitor) {
    const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
    return (
      <div className="pt-28 pb-24">
        <div className="section-container max-w-lg">
          <h1 className="font-serif-brand text-3xl font-medium text-navy-950 dark:text-white">My Visits</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/55">
            {googleEnabled
              ? "Sign in with Google to see the property visits you've booked and their status."
              : "Online booking is being set up. For now, please call or WhatsApp our team to arrange a visit."}
          </p>
          {googleEnabled ? (
            <div className="mt-6">
              <SignInPrompt />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Opening this page counts as "seen" — clears the unread dot in the header.
  await markVisitUpdatesSeen(visitor.id);

  const visits = await db
    .select({
      id: schema.propertyVisits.id,
      status: schema.propertyVisits.status,
      preferredDate: schema.propertyVisits.preferredDate,
      preferredTime: schema.propertyVisits.preferredTime,
      message: schema.propertyVisits.message,
      adminNote: schema.propertyVisits.adminNote,
      createdAt: schema.propertyVisits.createdAt,
      propertyTitle: schema.properties.title,
      propertySlug: schema.properties.slug,
    })
    .from(schema.propertyVisits)
    .leftJoin(schema.properties, eq(schema.propertyVisits.propertyId, schema.properties.id))
    .where(eq(schema.propertyVisits.visitorId, visitor.id))
    .orderBy(desc(schema.propertyVisits.createdAt));

  return (
    <div className="pt-28 pb-24">
      <MarkSeen />
      <div className="section-container max-w-2xl">
        <h1 className="font-serif-brand text-3xl font-medium text-navy-950 dark:text-white">My Visits</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/55">
          Signed in as {visitor.name || visitor.email}. You&apos;ll also get an email when a visit is confirmed or
          declined.
        </p>

        {visits.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.06] dark:bg-navy-900">
            <p className="text-sm text-gray-500 dark:text-white/55">You haven&apos;t booked any visits yet.</p>
            <Link
              href="/properties"
              className="mt-4 inline-flex rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white/10"
            >
              Browse properties
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {visits.map((v) => {
              const s = STATUS_STYLE[v.status] ?? STATUS_STYLE.NEW;
              return (
                <li
                  key={v.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-navy-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {v.propertySlug ? (
                        <Link
                          href={`/properties/${v.propertySlug}`}
                          className="font-serif-brand text-lg font-medium text-navy-950 hover:text-gold-600 dark:text-white dark:hover:text-gold-300"
                        >
                          {v.propertyTitle}
                        </Link>
                      ) : (
                        <span className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">
                          {v.propertyTitle || "Property"}
                        </span>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-600 dark:text-white/60">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                      {v.preferredDate
                        ? new Date(v.preferredDate).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Date TBC"}
                    </span>
                    {v.preferredTime ? (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                        {v.preferredTime}
                      </span>
                    ) : null}
                  </div>

                  {v.message ? (
                    <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
                      <span className="font-medium text-gray-600 dark:text-white/70">Your note:</span> {v.message}
                    </p>
                  ) : null}

                  {v.adminNote ? (
                    <div className="mt-3 flex gap-2 rounded-xl bg-gold-50 p-3 text-sm text-navy-900 dark:bg-gold-500/10 dark:text-white/80">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
                      <span>
                        <span className="font-semibold">From our team:</span> {v.adminNote}
                      </span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
