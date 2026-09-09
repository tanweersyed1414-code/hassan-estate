import { createHash } from "crypto";

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|embedly|quora link preview|pinterest|redditbot|applebot|petalbot|semrush|ahrefs|mj12bot|dotbot|headlesschrome|puppeteer|playwright|lighthouse|curl\/|wget\/|python-requests|axios\/|go-http-client|monitor|uptime|pingdom|statuscake|better uptime/i;

export function isBotUA(ua: string): boolean {
  if (!ua) return true; // no UA at all → almost always a script
  return BOT_RE.test(ua);
}

/**
 * A per-day, per-visitor token that never identifies anyone: it's a one-way
 * hash of IP + user-agent + the date + a server secret, so it can't be linked
 * back to a person and rotates every day.
 */
export function dailyVisitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.AUTH_SECRET || "hassan-estates";
  return createHash("sha256").update(`${ip}|${ua}|${day}|${salt}`).digest("hex").slice(0, 64);
}

/** Keep only a clean pathname: leading slash, no query/hash, capped length. */
export function normalisePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let p = raw.trim();
  if (!p.startsWith("/")) return null;
  p = p.split("#")[0].split("?")[0];
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p.length > 512) return null;
  // Never track admin, API or Next internals.
  if (p.startsWith("/admin") || p.startsWith("/api") || p.startsWith("/_next")) return null;
  return p || "/";
}

/** External referrer hostname only; "" for direct visits or same-site navigation. */
export function referrerHost(raw: unknown, selfHost: string): string {
  if (typeof raw !== "string" || !raw) return "";
  try {
    const h = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    if (!h || h === selfHost.replace(/^www\./, "").toLowerCase() || h === "localhost") return "";
    return h.slice(0, 191);
  } catch {
    return "";
  }
}

/** A friendly label for a stored path, used in the admin Top Pages list. */
export function prettyPath(path: string): string {
  if (path === "/") return "Home";
  const map: Record<string, string> = {
    "/properties": "Properties (listing)",
    "/projects": "Construction Projects (listing)",
    "/builders": "Builders & Services",
    "/payment-plans": "Payment Plans",
    "/about": "About Us",
    "/contact": "Contact Us",
    "/my-visits": "My Visits",
    "/privacy": "Privacy Policy",
    "/terms": "Terms of Use",
  };
  if (map[path]) return map[path];
  const m = path.match(/^\/(properties|projects)\/(.+)$/);
  if (m) {
    const kind = m[1] === "properties" ? "Property" : "Project";
    const slug = m[2].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `${kind}: ${slug}`;
  }
  return path;
}
