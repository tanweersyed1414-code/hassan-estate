import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { projectSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";
import { resolveFeaturedImage } from "@/lib/media";

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;
  const rows = await db.select().from(schema.constructionProjects).orderBy(desc(schema.constructionProjects.createdAt));
  return NextResponse.json({ projects: rows });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const imageUrls = data.images.map((img) => img.url);

  const [created] = await db
    .insert(schema.constructionProjects)
    .values({
      name: data.name,
      slug,
      location: data.location,
      description: data.description,
      projectType: data.projectType,
      status: data.status,
      completionDate: data.completionDate ? new Date(data.completionDate) : null,
      featuredImage: resolveFeaturedImage(data.featuredImage, imageUrls),
      videoUrl: data.videoUrl,
      isFeatured: data.isFeatured,
    })
    .returning();

  if (data.images.length) {
    await db.insert(schema.projectImages).values(
      data.images.map((img, i) => ({ projectId: created.id, url: img.url, kind: img.kind, sortOrder: i, alt: data.name }))
    );
  }
  if (data.features.length) {
    await db.insert(schema.projectFeatures).values(
      data.features.map((label, i) => ({ projectId: created.id, label, sortOrder: i }))
    );
  }

  // Projects surface on the homepage, the /projects list and each detail
  // page — refresh the whole public route group so a new project shows up
  // on the next visit instead of waiting out the ISR window.
  revalidatePath("/", "layout");

  return NextResponse.json({ project: created });
}
