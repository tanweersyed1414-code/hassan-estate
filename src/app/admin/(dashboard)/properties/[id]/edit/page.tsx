import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { PropertyForm } from "@/components/admin/property-form";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property] = await db.select().from(schema.properties).where(eq(schema.properties.id, Number(id))).limit(1);
  if (!property) notFound();

  const [images, features] = await Promise.all([
    db.select().from(schema.propertyImages).where(eq(schema.propertyImages.propertyId, property.id)),
    db.select().from(schema.propertyFeatures).where(eq(schema.propertyFeatures.propertyId, property.id)),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Edit Property</h1>
      <PropertyForm property={property} images={images} features={features} />
    </div>
  );
}
