import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { projectSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";
import { resolveFeaturedImage } from "@/lib/media";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const [project] = await db.select().from(schema.constructionProjects).where(eq(schema.constructionProjects.id, Number(id))).limit(1);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [images, features] = await Promise.all([
    db.select().from(schema.projectImages).where(eq(schema.projectImages.projectId, project.id)),
    db.select().from(schema.projectFeatures).where(eq(schema.projectFeatures.projectId, project.id)),
  ]);

  return NextResponse.json({ project, images, features });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const projectId = Number(id);
  const imageUrls = data.images.map((img) => img.url);

  const [updated] = await db
    .update(schema.constructionProjects)
    .set({
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
      updatedAt: new Date(),
    })
    .where(eq(schema.constructionProjects.id, projectId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(schema.projectImages).where(eq(schema.projectImages.projectId, projectId));
  if (data.images.length) {
    await db.insert(schema.projectImages).values(
      data.images.map((img, i) => ({ projectId, url: img.url, kind: img.kind, sortOrder: i, alt: data.name }))
    );
  }

  await db.delete(schema.projectFeatures).where(eq(schema.projectFeatures.projectId, projectId));
  if (data.features.length) {
    await db.insert(schema.projectFeatures).values(
      data.features.map((label, i) => ({ projectId, label, sortOrder: i }))
    );
  }

  // Refresh the homepage, the /projects list and this project's detail page.
  revalidatePath("/", "layout");

  return NextResponse.json({ project: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.delete(schema.constructionProjects).where(eq(schema.constructionProjects.id, Number(id)));
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
