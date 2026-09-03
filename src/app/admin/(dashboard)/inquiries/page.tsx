import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { StatusSelect } from "@/components/admin/status-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { INQUIRY_TYPE_LABELS } from "@/lib/utils";
import { inquiryStatuses } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Inquiries</h1>
        <p className="text-sm text-gray-500 dark:text-white/50">{inquiries.length} total leads</p>
      </div>

      <div className="admin-card overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-white/[0.06] dark:text-white/40">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-b border-gray-50 align-top last:border-0 hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-white/5">
                <td className="px-5 py-3 font-medium text-navy-950 dark:text-white">{inq.name}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">
                  <p>{inq.phone}</p>
                  {inq.email && <p className="text-xs text-gray-400 dark:text-white/40">{inq.email}</p>}
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">{INQUIRY_TYPE_LABELS[inq.inquiryType]}</td>
                <td className="max-w-xs px-5 py-3 text-gray-500 dark:text-white/50">
                  <p className="line-clamp-2">{inq.message || "—"}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-400 dark:text-white/40">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <StatusSelect url={`/api/inquiries/${inq.id}`} value={inq.status} options={[...inquiryStatuses]} />
                </td>
                <td className="px-5 py-3 text-right">
                  <DeleteButton url={`/api/inquiries/${inq.id}`} label="inquiry" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inquiries.length === 0 && <p className="p-8 text-center text-gray-400 dark:text-white/40">No inquiries yet.</p>}
      </div>
    </div>
  );
}
