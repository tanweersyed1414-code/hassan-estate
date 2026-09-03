import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const rows = await db.select().from(schema.siteSettings);
  return NextResponse.json({ settings: rows });
}

const bulkSchema = z.object({
  entries: z.array(z.object({ key: z.string().min(1).max(120), value: z.string().max(2000) })),
});

export async function PATCH(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });

  for (const entry of parsed.data.entries) {
    const existing = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, entry.key)).limit(1);
    if (existing.length) {
      await db.update(schema.siteSettings).set({ value: entry.value, updatedAt: new Date() }).where(eq(schema.siteSettings.key, entry.key));
    } else {
      await db.insert(schema.siteSettings).values({ key: entry.key, value: entry.value });
    }
  }

  // Settings feed the shared site layout (logo) plus the homepage, about,
  // and builders pages — revalidate the whole public route group so edits
  // are visible on the very next page load instead of waiting out the ISR window.
  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
