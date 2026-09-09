import Link from "next/link";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Eye, Users, MousePointerClick, ExternalLink } from "lucide-react";
import { prettyPath } from "@/lib/analytics";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;
async function q<T = Row>(query: ReturnType<typeof sql>): Promise<T[]> {
  const res = await db.execute(query);
  // postgres-js returns an array-like of rows
  return (Array.isArray(res) ? res : (res as { rows?: T[] }).rows || []) as T[];
}

const num = (v: unknown) => Number(v ?? 0);

export default async function AdminStatisticsPage() {
  const [totals, series, topPages, topProps, topProjects, topReferrers] = await Promise.all([
    q<{ label: string; views: number; visitors: number }>(sql`
      SELECT w.label,
             count(pv.*)::int AS views,
             count(DISTINCT pv.visitor_hash)::int AS visitors
      FROM (VALUES
        ('24 hours', interval '1 day'),
        ('7 days',   interval '7 days'),
        ('30 days',  interval '30 days'),
        ('all',      interval '100 years')
      ) AS w(label, span)
      LEFT JOIN page_views pv
        ON pv.is_bot = false AND pv.created_at >= now() - w.span
      GROUP BY w.label
    `),
    q<{ day: string; views: number; visitors: number }>(sql`
      SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
             count(pv.*)::int AS views,
             count(DISTINCT pv.visitor_hash)::int AS visitors
      FROM generate_series(now()::date - interval '29 days', now()::date, interval '1 day') AS d
      LEFT JOIN page_views pv
        ON pv.is_bot = false AND pv.created_at >= d::date AND pv.created_at < d::date + interval '1 day'
      GROUP BY d ORDER BY d
    `),
    q<{ path: string; views: number; visitors: number }>(sql`
      SELECT path, count(*)::int AS views, count(DISTINCT visitor_hash)::int AS visitors
      FROM page_views
      WHERE is_bot = false AND created_at >= now() - interval '30 days'
      GROUP BY path ORDER BY views DESC LIMIT 12
    `),
    q<{ id: number; title: string; slug: string; views: number }>(sql`
      SELECT p.id, p.title, p.slug, count(*)::int AS views
      FROM page_views pv JOIN properties p ON p.id = pv.property_id
      WHERE pv.is_bot = false AND pv.created_at >= now() - interval '30 days'
      GROUP BY p.id, p.title, p.slug ORDER BY views DESC LIMIT 8
    `),
    q<{ id: number; name: string; slug: string; views: number }>(sql`
      SELECT c.id, c.name, c.slug, count(*)::int AS views
      FROM page_views pv JOIN construction_projects c ON c.id = pv.project_id
      WHERE pv.is_bot = false AND pv.created_at >= now() - interval '30 days'
      GROUP BY c.id, c.name, c.slug ORDER BY views DESC LIMIT 6
    `),
    q<{ referrer_host: string; views: number }>(sql`
      SELECT referrer_host, count(*)::int AS views
      FROM page_views
      WHERE is_bot = false AND referrer_host <> '' AND created_at >= now() - interval '30 days'
      GROUP BY referrer_host ORDER BY views DESC LIMIT 8
    `),
  ]);

  const t = Object.fromEntries(totals.map((r) => [r.label, r]));
  const noData =
    num(t["all"]?.views) === 0 &&
    series.every((s) => num(s.views) === 0);

  const maxDay = Math.max(1, ...series.map((s) => num(s.views)));
  const maxPage = Math.max(1, ...topPages.map((p) => num(p.views)));

  const statCards = [
    { label: "Views · last 30 days", value: num(t["30 days"]?.views), icon: Eye },
    { label: "Unique visitors · 30 days", value: num(t["30 days"]?.visitors), icon: Users },
    { label: "Views · last 7 days", value: num(t["7 days"]?.views), icon: Eye },
    { label: "Views · last 24 hours", value: num(t["24 hours"]?.views), icon: MousePointerClick },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Statistics</h1>
        <p className="text-sm text-gray-500 dark:text-white/50">
          Cookieless page-view analytics for the public website. Bot traffic is excluded.
        </p>
      </div>

      {noData ? (
        <div className="admin-card rounded-2xl p-10 text-center">
          <p className="text-sm text-gray-500 dark:text-white/50">
            No visits recorded yet. Data appears here as people browse the site.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((c) => (
              <div key={c.label} className="admin-card rounded-2xl p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900/10 text-navy-900 dark:bg-white/10 dark:text-white">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-2xl font-bold text-navy-950 dark:text-white">{c.value.toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-white/50">{c.label}</p>
              </div>
            ))}
          </div>

          {/* All-time strip */}
          <div className="admin-card rounded-2xl p-5">
            <p className="text-sm text-gray-500 dark:text-white/50">
              All time:{" "}
              <span className="font-semibold text-navy-950 dark:text-white">
                {num(t["all"]?.views).toLocaleString()} views
              </span>{" "}
              from{" "}
              <span className="font-semibold text-navy-950 dark:text-white">
                {num(t["all"]?.visitors).toLocaleString()} visitors
              </span>
            </p>
          </div>

          {/* 30-day bar chart */}
          <div className="admin-card rounded-2xl p-5">
            <h2 className="mb-4 font-semibold text-navy-950 dark:text-white">Views — last 30 days</h2>
            <div className="flex h-40 items-end gap-1">
              {series.map((s) => {
                const h = Math.round((num(s.views) / maxDay) * 100);
                return (
                  <div
                    key={s.day}
                    title={`${s.day} · ${num(s.views)} views · ${num(s.visitors)} visitors`}
                    className="group relative flex-1 rounded-t bg-gold-400/70 transition-colors hover:bg-gold-500 dark:bg-gold-500/50 dark:hover:bg-gold-400"
                    style={{ height: `${Math.max(h, 2)}%` }}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-gray-400 dark:text-white/40">
              <span>{series[0]?.day}</span>
              <span>{series[series.length - 1]?.day}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top pages */}
            <div className="admin-card rounded-2xl p-5">
              <h2 className="mb-4 font-semibold text-navy-950 dark:text-white">Top pages · 30 days</h2>
              <ul className="space-y-2.5">
                {topPages.map((p) => (
                  <li key={p.path}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="line-clamp-1 text-navy-900 dark:text-white/80">{prettyPath(p.path)}</span>
                      <span className="shrink-0 text-gray-500 dark:text-white/50">
                        {num(p.views).toLocaleString()} <span className="text-gray-300 dark:text-white/25">/ {num(p.visitors)}</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-navy-800 dark:bg-white/40"
                        style={{ width: `${Math.round((num(p.views) / maxPage) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
                {topPages.length === 0 && <li className="text-sm text-gray-400 dark:text-white/40">No data yet.</li>}
              </ul>
              <p className="mt-3 text-[11px] text-gray-400 dark:text-white/40">views / unique visitors</p>
            </div>

            {/* Top referrers */}
            <div className="admin-card rounded-2xl p-5">
              <h2 className="mb-4 font-semibold text-navy-950 dark:text-white">Where visitors came from · 30 days</h2>
              <ul className="space-y-2.5 text-sm">
                {topReferrers.map((r) => (
                  <li key={r.referrer_host} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-navy-900 dark:text-white/80">
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 dark:text-white/40" />
                      {r.referrer_host}
                    </span>
                    <span className="text-gray-500 dark:text-white/50">{num(r.views).toLocaleString()}</span>
                  </li>
                ))}
                {topReferrers.length === 0 && (
                  <li className="text-sm text-gray-400 dark:text-white/40">
                    Nothing yet — most visits are direct or from unrecorded sources.
                  </li>
                )}
              </ul>
            </div>

            {/* Top properties */}
            <div className="admin-card rounded-2xl p-5">
              <h2 className="mb-4 font-semibold text-navy-950 dark:text-white">Most viewed properties · 30 days</h2>
              <ul className="space-y-2.5 text-sm">
                {topProps.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/properties/${p.slug}`}
                      target="_blank"
                      className="line-clamp-1 text-navy-900 hover:text-gold-600 dark:text-white/80 dark:hover:text-gold-300"
                    >
                      {p.title}
                    </Link>
                    <span className="shrink-0 text-gray-500 dark:text-white/50">{num(p.views).toLocaleString()}</span>
                  </li>
                ))}
                {topProps.length === 0 && <li className="text-gray-400 dark:text-white/40">No property views yet.</li>}
              </ul>
            </div>

            {/* Top projects */}
            <div className="admin-card rounded-2xl p-5">
              <h2 className="mb-4 font-semibold text-navy-950 dark:text-white">Most viewed projects · 30 days</h2>
              <ul className="space-y-2.5 text-sm">
                {topProjects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/projects/${p.slug}`}
                      target="_blank"
                      className="line-clamp-1 text-navy-900 hover:text-gold-600 dark:text-white/80 dark:hover:text-gold-300"
                    >
                      {p.name}
                    </Link>
                    <span className="shrink-0 text-gray-500 dark:text-white/50">{num(p.views).toLocaleString()}</span>
                  </li>
                ))}
                {topProjects.length === 0 && <li className="text-gray-400 dark:text-white/40">No project views yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
