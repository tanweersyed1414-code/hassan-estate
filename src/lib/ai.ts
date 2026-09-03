import { db, schema } from "@/db";
import { ilike, or, and, eq, desc } from "drizzle-orm";
import { formatPKR, PROPERTY_CATEGORY_LABELS, PROPERTY_STATUS_LABELS } from "./utils";

export interface QuickAction {
  label: string;
  href: string;
}

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { label: "Find a Property", href: "/properties" },
  { label: "Explore Payment Plans", href: "/payment-plans" },
  { label: "Construction Services", href: "/builders" },
  { label: "Contact Us", href: "/contact" },
];

export const FALLBACK_MESSAGE =
  "Our team will confirm the latest information for you. Would you like to contact Hassan Estates with Sandhu Builders directly?";

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "do",
  "you",
  "have",
  "any",
  "in",
  "for",
  "of",
  "to",
  "and",
  "i",
  "want",
  "please",
  "can",
  "me",
  "what",
  "which",
  "how",
  "much",
]);

function extractKeywords(message: string) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export interface ChatContext {
  properties: (typeof schema.properties.$inferSelect)[];
  projects: (typeof schema.constructionProjects.$inferSelect)[];
  knowledge: (typeof schema.aiKnowledgeBase.$inferSelect)[];
  plans: (typeof schema.paymentPlans.$inferSelect)[];
  intent: "property" | "construction" | "payment" | "visit" | "general";
}

/**
 * Scores knowledge base rows by keyword overlap so a broad-word match (e.g.
 * "city" appearing incidentally in an unrelated answer) doesn't outrank a
 * targeted match on the row's own tagged keywords or question.
 */
async function rankKnowledgeBase(keywords: string[]) {
  const rows = await db.select().from(schema.aiKnowledgeBase).where(eq(schema.aiKnowledgeBase.isActive, true));
  if (!keywords.length) return rows.slice(0, 3);

  const scored = rows
    .map((row) => {
      const tags = row.keywords.toLowerCase().split(",").map((t) => t.trim());
      const question = row.question.toLowerCase();
      const answer = row.answer.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (tags.some((t) => t.includes(kw) || kw.includes(t))) score += 4;
        if (question.includes(kw)) score += 2;
        if (answer.includes(kw)) score += 1;
      }
      return { row, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((s) => s.row);
}

export async function buildChatContext(message: string): Promise<ChatContext> {
  const lower = message.toLowerCase();
  const keywords = extractKeywords(message);

  let intent: ChatContext["intent"] = "general";
  if (/(plot|house|apartment|property|shop|office|farmhouse|buy|rent|sale)/.test(lower)) intent = "property";
  else if (/(construct|builder|build|renovat|interior|architect)/.test(lower)) intent = "construction";
  else if (/(installment|payment|plan|down payment|booking amount|emi)/.test(lower)) intent = "payment";
  else if (/(visit|appointment|schedule|see the property|site visit)/.test(lower)) intent = "visit";

  const [properties, projects, knowledge, plans] = await Promise.all([
    intent === "property" || intent === "general"
      ? db
          .select()
          .from(schema.properties)
          .where(
            keywords.length
              ? or(
                  ...keywords.flatMap((k) => [
                    ilike(schema.properties.title, `%${k}%`),
                    ilike(schema.properties.location, `%${k}%`),
                    ilike(schema.properties.city, `%${k}%`),
                    ilike(schema.properties.society, `%${k}%`),
                  ])
                )
              : undefined
          )
          .orderBy(desc(schema.properties.isFeatured), desc(schema.properties.createdAt))
          .limit(5)
      : Promise.resolve([]),
    intent === "construction" || intent === "general"
      ? db
          .select()
          .from(schema.constructionProjects)
          .orderBy(desc(schema.constructionProjects.isFeatured))
          .limit(4)
      : Promise.resolve([]),
    rankKnowledgeBase(keywords),
    intent === "payment" || intent === "general"
      ? db.select().from(schema.paymentPlans).where(eq(schema.paymentPlans.isActive, true)).limit(4)
      : Promise.resolve([]),
  ]);

  return { properties, projects, knowledge, plans, intent };
}

export function contextToPromptText(ctx: ChatContext): string {
  const parts: string[] = [];

  if (ctx.knowledge.length) {
    parts.push(
      "Company knowledge base:\n" + ctx.knowledge.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n")
    );
  }

  if (ctx.properties.length) {
    parts.push(
      "Matching properties in our database:\n" +
        ctx.properties
          .map(
            (p) =>
              `- ${p.title} | ${PROPERTY_CATEGORY_LABELS[p.category]} | ${PROPERTY_STATUS_LABELS[p.status]} | ${p.location}, ${p.city} | Price: ${formatPKR(
                p.price
              )} | Area: ${p.area} ${p.areaUnit} | URL: /properties/${p.slug}`
          )
          .join("\n")
    );
  }

  if (ctx.projects.length) {
    parts.push(
      "Construction projects:\n" +
        ctx.projects.map((p) => `- ${p.name} (${p.status}) in ${p.location} | URL: /projects/${p.slug}`).join("\n")
    );
  }

  if (ctx.plans.length) {
    parts.push(
      "Active payment plans:\n" +
        ctx.plans
          .map(
            (p) =>
              `- ${p.title}: Total ${formatPKR(p.totalPrice)}, Booking ${formatPKR(p.bookingAmount)}, Down Payment ${formatPKR(
                p.downPayment
              )}, Monthly ${formatPKR(p.monthlyInstallment)} over ${p.numberOfInstallments} months`
          )
          .join("\n")
    );
  }

  return parts.join("\n\n") || "No matching verified records were found in the database for this query.";
}

export function quickActionsForIntent(intent: ChatContext["intent"]): QuickAction[] {
  switch (intent) {
    case "property":
      return [
        { label: "Browse Properties", href: "/properties" },
        { label: "Book a Visit", href: "/properties" },
        { label: "Contact Us", href: "/contact" },
      ];
    case "construction":
      return [
        { label: "Construction Services", href: "/builders" },
        { label: "View Projects", href: "/projects" },
        { label: "Contact Us", href: "/contact" },
      ];
    case "payment":
      return [
        { label: "Payment Plans", href: "/payment-plans" },
        { label: "Installment Calculator", href: "/payment-plans" },
      ];
    case "visit":
      return [
        { label: "Find a Property", href: "/properties" },
        { label: "Contact Us", href: "/contact" },
      ];
    default:
      return DEFAULT_QUICK_ACTIONS;
  }
}

/**
 * Deterministic, database-grounded responder used when no OPENAI_API_KEY is
 * configured. It never invents availability, pricing, or policy — it only
 * restates verified records, or returns the required fallback message.
 */
export function ruleBasedReply(ctx: ChatContext): string {
  if (ctx.intent === "property" && ctx.properties.length) {
    const list = ctx.properties
      .slice(0, 3)
      .map((p) => `• ${p.title} — ${formatPKR(p.price)} (${p.location}, ${p.city})`)
      .join("\n");
    return `Here are some properties that match your search:\n${list}\n\nWould you like to see full details or book a visit?`;
  }

  if (ctx.intent === "construction" && ctx.projects.length) {
    const list = ctx.projects
      .slice(0, 3)
      .map((p) => `• ${p.name} — ${p.location} (${p.status.replace("_", " ").toLowerCase()})`)
      .join("\n");
    return `Sandhu Builders' recent work includes:\n${list}\n\nWould you like to discuss a similar project?`;
  }

  if (ctx.intent === "payment" && ctx.plans.length) {
    const list = ctx.plans
      .slice(0, 3)
      .map((p) => `• ${p.title} — Monthly installment ${formatPKR(p.monthlyInstallment)} over ${p.numberOfInstallments} months`)
      .join("\n");
    return `Here are some available payment plans:\n${list}\n\nUse our Installment Calculator on the Payment Plans page for a custom estimate.`;
  }

  if (ctx.intent === "visit") {
    return "You can request a property visit directly from any property's detail page, or share the property you're interested in and our team will help schedule it.";
  }

  if (ctx.knowledge.length) {
    return ctx.knowledge[0].answer;
  }

  return FALLBACK_MESSAGE;
}
