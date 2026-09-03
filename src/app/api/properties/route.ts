import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { propertySchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";
import { resolveFeaturedImage } from "@/lib/media";

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const rows = await db.select().from(schema.properties).orderBy(desc(schema.properties.createdAt));
  return NextResponse.json({ properties: rows });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);

  const [created] = await db
    .insert(schema.properties)
    .values({
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
      createdById: Number(auth.session.user.id),
    })
    .returning();

  if (data.images.length) {
    await db.insert(schema.propertyImages).values(
      data.images.map((url, i) => ({ propertyId: created.id, url, sortOrder: i, alt: data.title }))
    );
  }
  if (data.features.length) {
    await db.insert(schema.propertyFeatures).values(
      data.features.map((label, i) => ({ propertyId: created.id, label, sortOrder: i }))
    );
  }

  // Properties surface on the homepage, the /properties list and each detail
  // page — refresh the whole public route group so the new listing shows up
  // on the next visit instead of waiting out the ISR window.
  revalidatePath("/", "layout");

  return NextResponse.json({ property: created });
}
