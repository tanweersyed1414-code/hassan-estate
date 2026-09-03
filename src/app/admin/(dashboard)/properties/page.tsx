import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatPKR, PROPERTY_CATEGORY_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await db.select().from(schema.properties).orderBy(desc(schema.properties.createdAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Properties</h1>
          <p className="text-sm text-gray-500 dark:text-white/50">{properties.length} total listings</p>
        </div>
        <Link href="/admin/properties/new" className="flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500">
          <Plus className="h-4 w-4" /> Add Property
        </Link>
      </div>

      <div className="admin-card overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-white/[0.06] dark:text-white/40">
            <tr>
              <th className="px-5 py-3">Property</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Featured</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-white/5">
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                    {p.featuredImage && <Image src={p.featuredImage} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div>
                    <p className="line-clamp-1 font-medium text-navy-950 dark:text-white">{p.title}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">{p.city} · {p.location}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">{PROPERTY_CATEGORY_LABELS[p.category]}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline">{PROPERTY_STATUS_LABELS[p.status]}</Badge>
                </td>
                <td className="px-5 py-3 font-medium text-navy-900 dark:text-white">{formatPKR(p.price)}</td>
                <td className="px-5 py-3">{p.isFeatured ? <Badge variant="gold">Featured</Badge> : <span className="text-gray-300 dark:text-white/20">—</span>}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/properties/${p.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-full text-navy-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton url={`/api/properties/${p.id}`} label="property" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && <p className="p-8 text-center text-gray-400 dark:text-white/40">No properties yet. Add your first listing.</p>}
      </div>
    </div>
  );
}
