"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader, type UploaderImage } from "@/components/admin/image-uploader";
import { TagInput } from "@/components/admin/tag-input";
import { areaUnits, propertyCategories, propertyStatuses } from "@/lib/validations";
import { AREA_UNIT_LABELS, PROPERTY_CATEGORY_LABELS, PROPERTY_STATUS_LABELS, slugify } from "@/lib/utils";
import type { Property, PropertyFeature, PropertyImage } from "@/db/schema";

interface Props {
  property?: Property;
  images?: PropertyImage[];
  features?: PropertyFeature[];
}

export function PropertyForm({ property, images: initialImages, features: initialFeatures }: Props) {
  const router = useRouter();
  const isEdit = !!property;
  const [saving, setSaving] = React.useState(false);

  const [title, setTitle] = React.useState(property?.title || "");
  const [slug, setSlug] = React.useState(property?.slug || "");
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [description, setDescription] = React.useState(property?.description || "");
  const [category, setCategory] = React.useState(property?.category || "RESIDENTIAL_PLOT");
  const [status, setStatus] = React.useState(property?.status || "AVAILABLE");
  const [price, setPrice] = React.useState(property?.price || "");
  const [isNegotiable, setIsNegotiable] = React.useState(property?.isNegotiable || false);
  const [area, setArea] = React.useState(property?.area || "");
  const [areaUnit, setAreaUnit] = React.useState(property?.areaUnit || "MARLA");
  const [location, setLocation] = React.useState(property?.location || "");
  const [city, setCity] = React.useState(property?.city || "Islamabad");
  const [society, setSociety] = React.useState(property?.society || "Top City-1");
  const [block, setBlock] = React.useState(property?.block || "");
  const [fullAddress, setFullAddress] = React.useState(property?.fullAddress || "");
  const [latitude, setLatitude] = React.useState(property?.latitude || "");
  const [longitude, setLongitude] = React.useState(property?.longitude || "");
  const [bedrooms, setBedrooms] = React.useState(property?.bedrooms || 0);
  const [bathrooms, setBathrooms] = React.useState(property?.bathrooms || 0);
  const [parking, setParking] = React.useState(property?.parking || 0);
  const [videoUrl, setVideoUrl] = React.useState(property?.videoUrl || "");
  const [isFeatured, setIsFeatured] = React.useState(property?.isFeatured || false);
  const [amenities, setAmenities] = React.useState<string[]>(
    property?.amenities ? JSON.parse(property.amenities) : []
  );
  const [featuresList, setFeaturesList] = React.useState<string[]>(initialFeatures?.map((f) => f.label) || []);
  const [uploaderImages, setUploaderImages] = React.useState<UploaderImage[]>(
    initialImages?.map((i) => ({ url: i.url })) || []
  );
  const [featuredImage, setFeaturedImage] = React.useState(property?.featuredImage || "");

  React.useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      slug,
      description,
      category,
      status,
      price: Number(price) || 0,
      isNegotiable,
      currency: "PKR",
      area: Number(area) || 0,
      areaUnit,
      location,
      city,
      society,
      block,
      fullAddress,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      parking: Number(parking) || 0,
      amenities,
      features: featuresList,
      featuredImage: featuredImage || uploaderImages[0]?.url || "",
      images: uploaderImages.map((i) => i.url),
      videoUrl,
      isFeatured,
    };

    try {
      const res = await fetch(isEdit ? `/api/properties/${property!.id}` : "/api/properties", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save property");
      toast.success(isEdit ? "Property updated." : "Property created.");
      router.push("/admin/properties");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required span={2}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="URL Slug" required span={2}>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              required
            />
          </Field>
          <Field label="Category" required>
            <Select value={category} onChange={(e) => setCategory(e.target.value as never)}>
              {propertyCategories.map((c) => (
                <option key={c} value={c}>
                  {PROPERTY_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" required>
            <Select value={status} onChange={(e) => setStatus(e.target.value as never)}>
              {propertyStatuses.map((s) => (
                <option key={s} value={s}>
                  {PROPERTY_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description" span={2}>
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (PKR)" required>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </Field>
          <Field label="Area">
            <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} />
          </Field>
          <Field label="Area Unit">
            <Select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as never)}>
              {areaUnits.map((u) => (
                <option key={u} value={u}>
                  {AREA_UNIT_LABELS[u]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-3">
          <Switch checked={isNegotiable} onCheckedChange={setIsNegotiable} />
          <span className="text-sm text-navy-900 dark:text-white">Price is negotiable</span>
        </label>
      </Section>

      <Section title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location / Area">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Block A" />
          </Field>
          <Field label="City">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="Society">
            <Input value={society} onChange={(e) => setSociety(e.target.value)} />
          </Field>
          <Field label="Block">
            <Input value={block} onChange={(e) => setBlock(e.target.value)} />
          </Field>
          <Field label="Full Address" span={2}>
            <Input value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
          </Field>
          <Field label="Latitude">
            <Input value={latitude ?? ""} onChange={(e) => setLatitude(e.target.value)} placeholder="33.5124" />
          </Field>
          <Field label="Longitude">
            <Input value={longitude ?? ""} onChange={(e) => setLongitude(e.target.value)} placeholder="73.1500" />
          </Field>
        </div>
      </Section>

      <Section title="Details">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bedrooms">
            <Input type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
          </Field>
          <Field label="Bathrooms">
            <Input type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
          </Field>
          <Field label="Parking">
            <Input type="number" min={0} value={parking} onChange={(e) => setParking(Number(e.target.value))} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Features">
            <TagInput value={featuresList} onChange={setFeaturesList} placeholder="e.g. Corner Plot" />
          </Field>
          <Field label="Amenities">
            <TagInput value={amenities} onChange={setAmenities} placeholder="e.g. Gas Backup" />
          </Field>
        </div>
      </Section>

      <Section title="Media">
        <Field label="Images">
          <ImageUploader images={uploaderImages} onChange={setUploaderImages} featuredImage={featuredImage} onFeaturedChange={setFeaturedImage} />
        </Field>
        <Field label="Video URL (embed link, optional)">
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." />
        </Field>
      </Section>

      <Section title="Visibility">
        <label className="flex items-center gap-3">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          <span className="text-sm text-navy-900 dark:text-white">Show in Featured Properties</span>
        </label>
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Property"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card rounded-2xl p-6">
      <h2 className="mb-4 font-serif-brand text-lg font-medium text-navy-950 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, span, children }: { label: string; required?: boolean; span?: number; children: React.ReactNode }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
