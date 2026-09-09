import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/delete-button";
import { VisitDecision } from "@/components/admin/visit-decision";

export const dynamic = "force-dynamic";

export default async function AdminVisitsPage() {
  const [visits, properties] = await Promise.all([
    db
      .select({
        v: schema.propertyVisits,
        visitorEmail: schema.visitors.email,
        visitorName: schema.visitors.name,
      })
      .from(schema.propertyVisits)
      .leftJoin(schema.visitors, eq(schema.propertyVisits.visitorId, schema.visitors.id))
      .orderBy(desc(schema.propertyVisits.createdAt)),
    db.select().from(schema.properties),
  ]);
  const propertyMap = new Map(properties.map((p) => [p.id, p.title]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Property Visit Requests</h1>
        <p className="text-sm text-gray-500 dark:text-white/50">
          {visits.length} total · changing status to Confirmed / Cancelled / Completed emails the visitor.
        </p>
      </div>

      <div className="admin-card overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-white/[0.06] dark:text-white/40">
            <tr>
              <th className="px-5 py-3">Visitor</th>
              <th className="px-5 py-3">Property</th>
              <th className="px-5 py-3">Requested Date</th>
              <th className="px-5 py-3">Time Slot</th>
              <th className="px-5 py-3">Decision</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(({ v, visitorEmail, visitorName }) => (
              <tr key={v.id} className="border-b border-gray-50 last:border-0 align-top hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-white/5">
                <td className="px-5 py-3">
                  <p className="font-medium text-navy-950 dark:text-white">{visitorName || v.name}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40">{v.phone}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40">{visitorEmail || v.email || "—"}</p>
                  <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                    {v.visitorId ? "Google account" : "Guest (legacy)"}
                    {v.notifiedAt ? " · emailed ✓" : ""}
                  </p>
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">
                  {v.propertyId ? propertyMap.get(v.propertyId) || "—" : "—"}
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">
                  {v.preferredDate ? new Date(v.preferredDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">{v.preferredTime || "—"}</td>
                <td className="px-5 py-3">
                  <VisitDecision id={v.id} status={v.status} adminNote={v.adminNote} />
                </td>
                <td className="px-5 py-3 text-right">
                  <DeleteButton url={`/api/visits/${v.id}`} label="visit request" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visits.length === 0 && <p className="p-8 text-center text-gray-400 dark:text-white/40">No visit requests yet.</p>}
      </div>
    </div>
  );
}
