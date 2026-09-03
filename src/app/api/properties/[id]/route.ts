import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { propertySchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";
import { resolveFeaturedImage } from "@/lib/media";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const [property] = await db.select().from(schema.properties).where(eq(schema.properties.id, Number(id))).limit(1);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [images, features] = await Promise.all([
    db.select().from(schema.propertyImages).where(eq(schema.propertyImages.propertyId, property.id)),
    db.select().from(schema.propertyFeatures).where(eq(schema.propertyFeatures.propertyId, property.id)),
  ]);

  return NextResponse.json({ property, images, features });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);
  const propertyId = Number(id);

  const [updated] = await db
    .update(schema.properties)
    .set({
      title: data.title,
      slug,
      description: data.description,
      category: data.category,
      status: data.status,
      price: String(data.price),
      isNegotiable: data.isNegotiable,
      currency: data.currency,
      area: String(data.area),
      areaUnit: data.areaUnit,
      location: data.location,
      city: data.city,
      society: data.society,
      block: data.block,
      fullAddress: data.fullAddress,
      latitude: data.latitude != null ? String(data.latitude) : null,
      longitude: data.longitude != null ? String(data.longitude) : null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parking: data.parking,
      amenities: JSON.stringify(data.amenities),
      featuredImage: resolveFeaturedImage(data.featuredImage, data.images),
      videoUrl: data.videoUrl,
      isFeatured: data.isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(schema.properties.id, propertyId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(schema.propertyImages).where(eq(schema.propertyImages.propertyId, propertyId));
  if (data.images.length) {
    await db.insert(schema.propertyImages).values(
      data.images.map((url, i) => ({ propertyId, url, sortOrder: i, alt: data.title }))
    );
  }

  await db.delete(schema.propertyFeatures).where(eq(schema.propertyFeatures.propertyId, propertyId));
  if (data.features.length) {
    await db.insert(schema.propertyFeatures).values(
      data.features.map((label, i) => ({ propertyId, label, sortOrder: i }))
    );
  }

  // Refresh the homepage, the /properties list and this listing's detail page.
  revalidatePath("/", "layout");

  return NextResponse.json({ property: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.delete(schema.properties).where(eq(schema.properties.id, Number(id)));
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
