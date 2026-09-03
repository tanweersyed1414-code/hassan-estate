import Link from "next/link";
import { db, schema } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import { Building2, CalendarCheck, HardHat, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPKR, INQUIRY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const [[totalProperties], [availableProperties], [soldProperties], [activeProjects], [newInquiries], [newVisits], [totalLeads]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(schema.properties),
      db.select({ count: sql<number>`count(*)::int` }).from(schema.properties).where(eq(schema.properties.status, "AVAILABLE")),
      db.select({ count: sql<number>`count(*)::int` }).from(schema.properties).where(eq(schema.properties.status, "SOLD")),
      db.select({ count: sql<number>`count(*)::int` }).from(schema.constructionProjects).where(eq(schema.constructionProjects.status, "UNDER_CONSTRUCTION")),
      db.select({ count: sql<number>`count(*)::int` }).from(schema.inquiries).where(eq(schema.inquiries.status, "NEW")),
      db.select({ count: sql<number>`count(*)::int` }).from(schema.propertyVisits).where(eq(schema.propertyVisits.status, "NEW")),
      db.select({ count: sql<number>`count(*)::int` }).from(schema.inquiries),
    ]);

  return {
    totalProperties: totalProperties.count,
    availableProperties: availableProperties.count,
    soldProperties: soldProperties.count,
    activeProjects: activeProjects.count,
    newInquiries: newInquiries.count,
    newVisits: newVisits.count,
    totalLeads: totalLeads.count,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const [recentInquiries, recentVisits, recentProperties] = await Promise.all([
    db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt)).limit(5),
    db.select().from(schema.propertyVisits).orderBy(desc(schema.propertyVisits.createdAt)).limit(5),
    db.select().from(schema.properties).orderBy(desc(schema.properties.createdAt)).limit(5),
  ]);

  const cards = [
    { label: "Total Properties", value: stats.totalProperties, icon: Building2, href: "/admin/properties", tint: "bg-navy-900/10 text-navy-900 dark:bg-white/10 dark:text-white" },
    { label: "Available Properties", value: stats.availableProperties, icon: Building2, href: "/admin/properties", tint: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" },
    { label: "Sold Properties", value: stats.soldProperties, icon: Building2, href: "/admin/properties", tint: "bg-gold-500/10 text-gold-600 dark:bg-gold-400/15 dark:text-gold-300" },
    { label: "Active Construction Projects", value: stats.activeProjects, icon: HardHat, href: "/admin/projects", tint: "bg-navy-700/10 text-navy-700 dark:bg-white/10 dark:text-white/80" },
    { label: "New Inquiries", value: stats.newInquiries, icon: MessagesSquare, href: "/admin/inquiries", tint: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300" },
    { label: "New Visit Requests", value: stats.newVisits, icon: CalendarCheck, href: "/admin/visits", tint: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" },
    { label: "Total Leads", value: stats.totalLeads, icon: MessagesSquare, href: "/admin/inquiries", tint: "bg-navy-900/10 text-navy-900 dark:bg-white/10 dark:text-white" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-white/50">Overview of your business activity</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Link href="/admin/properties/new" className="rounded-full bg-navy-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-md dark:bg-navy-600 dark:hover:bg-navy-500">
            + Add Property
          </Link>
          <Link href="/admin/projects/new" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-navy-900 transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md dark:border-white/15 dark:text-white dark:hover:bg-white/5">
            + Add Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group admin-card admin-card-interactive rounded-2xl p-5"
          >
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105", c.tint)}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-2xl font-bold text-navy-950 dark:text-white">{c.value}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/50">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="admin-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-navy-950 dark:text-white">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-gold-600 hover:underline dark:text-gold-400">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentInquiries.length === 0 && <p className="text-sm text-gray-400 dark:text-white/40">No inquiries yet.</p>}
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm last:border-0 dark:border-white/5">
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">{inq.name}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40">{INQUIRY_TYPE_LABELS[inq.inquiryType]} · {inq.phone}</p>
                </div>
                <Badge variant={inq.status === "NEW" ? "warning" : "neutral"}>{inq.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-navy-950 dark:text-white">Recent Visit Requests</h2>
            <Link href="/admin/visits" className="text-xs text-gold-600 hover:underline dark:text-gold-400">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentVisits.length === 0 && <p className="text-sm text-gray-400 dark:text-white/40">No visit requests yet.</p>}
            {recentVisits.map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm last:border-0 dark:border-white/5">
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">{v.name}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40">{v.phone}</p>
                </div>
                <Badge variant={v.status === "NEW" ? "warning" : "neutral"}>{v.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-navy-950 dark:text-white">Recently Added Properties</h2>
            <Link href="/admin/properties" className="text-xs text-gold-600 hover:underline dark:text-gold-400">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentProperties.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm last:border-0 dark:border-white/5">
                <div>
                  <p className="line-clamp-1 font-medium text-navy-900 dark:text-white">{p.title}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40">{formatPKR(p.price)}</p>
                </div>
                <Badge variant="outline">{PROPERTY_STATUS_LABELS[p.status]}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
