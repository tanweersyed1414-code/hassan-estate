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
import { projectStatuses, projectTypes } from "@/lib/validations";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS, slugify } from "@/lib/utils";
import type { ConstructionProject, ProjectFeature, ProjectImage } from "@/db/schema";

interface Props {
  project?: ConstructionProject;
  images?: ProjectImage[];
  features?: ProjectFeature[];
}

export function ProjectForm({ project, images: initialImages, features: initialFeatures }: Props) {
  const router = useRouter();
  const isEdit = !!project;
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState(project?.name || "");
  const [slug, setSlug] = React.useState(project?.slug || "");
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [location, setLocation] = React.useState(project?.location || "");
  const [description, setDescription] = React.useState(project?.description || "");
  const [projectType, setProjectType] = React.useState(project?.projectType || "RESIDENTIAL");
  const [status, setStatus] = React.useState(project?.status || "PLANNING");
  const [completionDate, setCompletionDate] = React.useState(
    project?.completionDate ? new Date(project.completionDate).toISOString().split("T")[0] : ""
  );
  const [videoUrl, setVideoUrl] = React.useState(project?.videoUrl || "");
  const [isFeatured, setIsFeatured] = React.useState(project?.isFeatured || false);
  const [featuresList, setFeaturesList] = React.useState<string[]>(initialFeatures?.map((f) => f.label) || []);
  const [uploaderImages, setUploaderImages] = React.useState<UploaderImage[]>(
    initialImages?.map((i) => ({ url: i.url, kind: i.kind as UploaderImage["kind"] })) || []
  );
  const [featuredImage, setFeaturedImage] = React.useState(project?.featuredImage || "");

  React.useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      slug,
      location,
      description,
      projectType,
      status,
      completionDate: completionDate || null,
      featuredImage: featuredImage || uploaderImages[0]?.url || "",
      videoUrl,
      isFeatured,
      features: featuresList,
      images: uploaderImages.map((i) => ({ url: i.url, kind: i.kind || "GALLERY" })),
    };

    try {
      const res = await fetch(isEdit ? `/api/projects/${project!.id}` : "/api/projects", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save project");
      toast.success(isEdit ? "Project updated." : "Project created.");
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project Name" required span={2}>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
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
          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Completion Date">
            <Input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
          </Field>
          <Field label="Project Type">
            <Select value={projectType} onChange={(e) => setProjectType(e.target.value as never)}>
              {projectTypes.map((t) => (
                <option key={t} value={t}>
                  {PROJECT_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as never)}>
              {projectStatuses.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description" span={2}>
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Project Features">
        <TagInput value={featuresList} onChange={setFeaturesList} placeholder="e.g. Basement Parking" />
      </Section>

      <Section title="Media">
        <Field label="Images (tag as Gallery, Before, or After)">
          <ImageUploader images={uploaderImages} onChange={setUploaderImages} featuredImage={featuredImage} onFeaturedChange={setFeaturedImage} withKind />
        </Field>
        <Field label="Video URL (embed link, optional)">
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." />
        </Field>
      </Section>

      <Section title="Visibility">
        <label className="flex items-center gap-3">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          <span className="text-sm text-navy-900 dark:text-white">Show in Featured Projects</span>
        </label>
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Project"}
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
