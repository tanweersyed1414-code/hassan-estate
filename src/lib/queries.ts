import { cache } from "react";
import { db, schema } from "@/db";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

export interface PropertyFilters {
  city?: string;
  society?: string;
  block?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  featured?: boolean;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
  page?: number;
  pageSize?: number;
}

export async function getProperties(filters: PropertyFilters = {}) {
  const {
    city,
    society,
    block,
    category,
    status,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    featured,
    q,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = filters;

  const conditions = [];
  if (city) conditions.push(eq(schema.properties.city, city));
  if (society) conditions.push(eq(schema.properties.society, society));
  if (block) conditions.push(eq(schema.properties.block, block));
  if (category) conditions.push(eq(schema.properties.category, category as never));
  if (status) conditions.push(eq(schema.properties.status, status as never));
  if (minPrice !== undefined) conditions.push(gte(schema.properties.price, String(minPrice)));
  if (maxPrice !== undefined) conditions.push(lte(schema.properties.price, String(maxPrice)));
  if (minArea !== undefined) conditions.push(gte(schema.properties.area, String(minArea)));
  if (maxArea !== undefined) conditions.push(lte(schema.properties.area, String(maxArea)));
  if (bedrooms !== undefined) conditions.push(gte(schema.properties.bedrooms, bedrooms));
  if (featured) conditions.push(eq(schema.properties.isFeatured, true));
  if (q) {
    conditions.push(
      or(
        ilike(schema.properties.title, `%${q}%`),
        ilike(schema.properties.location, `%${q}%`),
        ilike(schema.properties.society, `%${q}%`),
        ilike(schema.properties.city, `%${q}%`)
      )
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const orderBy =
    sort === "price_asc"
      ? [asc(schema.properties.price)]
      : sort === "price_desc"
      ? [desc(schema.properties.price)]
      : sort === "featured"
      ? [desc(schema.properties.isFeatured), desc(schema.properties.createdAt)]
      : [desc(schema.properties.createdAt)];

  const offset = (page - 1) * pageSize;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(schema.properties)
      .where(where)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.properties).where(where),
  ]);

  return { properties: rows, total: countRows[0]?.count ?? 0, page, pageSize };
}

export async function getFeaturedProperties(limit = 6) {
  return db
    .select()
    .from(schema.properties)
    .where(eq(schema.properties.isFeatured, true))
    .orderBy(desc(schema.properties.createdAt))
    .limit(limit);
}

export async function getPropertyBySlug(slug: string) {
  const [property] = await db.select().from(schema.properties).where(eq(schema.properties.slug, slug)).limit(1);
  if (!property) return null;

  const [images, features, plans] = await Promise.all([
    db
      .select()
      .from(schema.propertyImages)
      .where(eq(schema.propertyImages.propertyId, property.id))
      .orderBy(asc(schema.propertyImages.sortOrder)),
    db
      .select()
      .from(schema.propertyFeatures)
      .where(eq(schema.propertyFeatures.propertyId, property.id))
      .orderBy(asc(schema.propertyFeatures.sortOrder)),
    db
      .select()
      .from(schema.paymentPlans)
      .where(and(eq(schema.paymentPlans.propertyId, property.id), eq(schema.paymentPlans.isActive, true))),
  ]);

  return { ...property, images, features, plans };
}

export async function getRelatedProperties(property: { id: number; category: string; city: string; price: string }, limit = 3) {
  return db
    .select()
    .from(schema.properties)
    .where(
      and(
        eq(schema.properties.category, property.category as never),
        eq(schema.properties.city, property.city),
        sql`${schema.properties.id} != ${property.id}`
      )
    )
    .orderBy(desc(schema.properties.isFeatured), desc(schema.properties.createdAt))
    .limit(limit);
}

export async function getDistinctLocations() {
  const rows = await db
    .select({ city: schema.properties.city, society: schema.properties.society, block: schema.properties.block })
    .from(schema.properties);

  const cities = Array.from(new Set(rows.map((r) => r.city).filter(Boolean)));
  const societies = Array.from(new Set(rows.map((r) => r.society).filter(Boolean)));
  const blocks = Array.from(new Set(rows.map((r) => r.block).filter(Boolean)));
  return { cities, societies, blocks };
}

// ---------------- Construction Projects ----------------

export interface ProjectFilters {
  status?: string;
  projectType?: string;
  page?: number;
  pageSize?: number;
}

export async function getProjects(filters: ProjectFilters = {}) {
  const { status, projectType, page = 1, pageSize = 9 } = filters;
  const conditions = [];
  if (status) conditions.push(eq(schema.constructionProjects.status, status as never));
  if (projectType) conditions.push(eq(schema.constructionProjects.projectType, projectType as never));
  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * pageSize;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(schema.constructionProjects)
      .where(where)
      .orderBy(desc(schema.constructionProjects.isFeatured), desc(schema.constructionProjects.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.constructionProjects).where(where),
  ]);

  return { projects: rows, total: countRows[0]?.count ?? 0, page, pageSize };
}

export async function getFeaturedProjects(limit = 3) {
  return db
    .select()
    .from(schema.constructionProjects)
    .where(eq(schema.constructionProjects.isFeatured, true))
    .orderBy(desc(schema.constructionProjects.createdAt))
    .limit(limit);
}

export async function getProjectBySlug(slug: string) {
  const [project] = await db
    .select()
    .from(schema.constructionProjects)
    .where(eq(schema.constructionProjects.slug, slug))
    .limit(1);
  if (!project) return null;

  const [images, features] = await Promise.all([
    db
      .select()
      .from(schema.projectImages)
      .where(eq(schema.projectImages.projectId, project.id))
      .orderBy(asc(schema.projectImages.sortOrder)),
    db
      .select()
      .from(schema.projectFeatures)
      .where(eq(schema.projectFeatures.projectId, project.id))
      .orderBy(asc(schema.projectFeatures.sortOrder)),
  ]);

  return { ...project, images, features };
}

// ---------------- Payment Plans ----------------

export async function getActivePaymentPlans() {
  const rows = await db
    .select({
      plan: schema.paymentPlans,
      property: schema.properties,
    })
    .from(schema.paymentPlans)
    .leftJoin(schema.properties, eq(schema.paymentPlans.propertyId, schema.properties.id))
    .where(eq(schema.paymentPlans.isActive, true))
    .orderBy(desc(schema.paymentPlans.createdAt));

  return rows;
}

// ---------------- Site settings ----------------

// Wrapped in React's request-scoped cache() since both the root layout
// (theme colors) and the (site) layout (logo/social links) call this on
// every request — dedupes to a single query per request instead of two.
export const getSiteSettingsMap = cache(async () => {
  const rows = await db.select().from(schema.siteSettings);
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
});

// ---------------- AI knowledge base ----------------

export async function searchKnowledgeBase(query: string, limit = 5) {
  const q = `%${query}%`;
  return db
    .select()
    .from(schema.aiKnowledgeBase)
    .where(
      and(
        eq(schema.aiKnowledgeBase.isActive, true),
        or(
          ilike(schema.aiKnowledgeBase.question, q),
          ilike(schema.aiKnowledgeBase.answer, q),
          ilike(schema.aiKnowledgeBase.keywords, q)
        )
      )
    )
    .limit(limit);
}
