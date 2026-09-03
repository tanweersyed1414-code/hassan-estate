import type { MetadataRoute } from "next";
import { db, schema } from "@/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects] = await Promise.all([
    db.select({ slug: schema.properties.slug, updatedAt: schema.properties.updatedAt }).from(schema.properties),
    db.select({ slug: schema.constructionProjects.slug, updatedAt: schema.constructionProjects.updatedAt }).from(schema.constructionProjects),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/builders`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/projects`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/payment-plans`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${siteUrl}/properties/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...propertyRoutes, ...projectRoutes];
}
