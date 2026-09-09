import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";

const SCOPES: Record<string, string | null> = {
  all: null,
  "older-90d": "90 days",
  "older-365d": "365 days",
};

export async function POST(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const scope = String(body?.scope || "all");
  if (!(scope in SCOPES)) {
    return NextResponse.json({ error: "Unknown scope." }, { status: 400 });
  }

  const interval = SCOPES[scope];
  if (interval === null) {
    await db.execute(sql`TRUNCATE TABLE page_views RESTART IDENTITY`);
  } else {
    await db.execute(sql.raw(`DELETE FROM page_views WHERE created_at < now() - interval '${interval}'`));
  }

  return NextResponse.json({ ok: true, scope });
}
