import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { dailyVisitorHash, isBotUA, normalisePath, referrerHost } from "@/lib/analytics";

const NO_CONTENT = new Response(null, { status: 204 });

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Generous — a normal browsing session fires one per page.
    const rl = checkRateLimit(`track:${ip}`, { limit: 150, windowMs: 60 * 1000 });
    if (!rl.success) return NO_CONTENT;

    const body = await req.json().catch(() => null);
    const path = normalisePath(body?.path);
    if (!path) return NO_CONTENT;

    const ua = req.headers.get("user-agent") || "";
    const host = req.headers.get("host") || process.env.NEXT_PUBLIC_SITE_URL || "";

    const isBot = isBotUA(ua);
    const rHost = referrerHost(body?.referrer, host);
    const visitorHash = dailyVisitorHash(ip, ua);

    // Attach the property/project so "most viewed" is a clean join.
    let propertyId: number | null = null;
    let projectId: number | null = null;
    const detail = path.match(/^\/(properties|projects)\/([^/]+)$/);
    if (detail) {
      const slug = detail[2];
      if (detail[1] === "properties") {
        const [row] = await db
          .select({ id: schema.properties.id })
          .from(schema.properties)
          .where(eq(schema.properties.slug, slug))
          .limit(1);
        propertyId = row?.id ?? null;
      } else {
        const [row] = await db
          .select({ id: schema.constructionProjects.id })
          .from(schema.constructionProjects)
          .where(eq(schema.constructionProjects.slug, slug))
          .limit(1);
        projectId = row?.id ?? null;
      }
    }

    await db.insert(schema.pageViews).values({
      path,
      referrerHost: rHost,
      visitorHash,
      propertyId,
      projectId,
      isBot,
    });
  } catch {
    // Analytics must never break a page — swallow everything.
  }
  return NO_CONTENT;
}
