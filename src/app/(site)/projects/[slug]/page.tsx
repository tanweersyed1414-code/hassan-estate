import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/site/image-gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Reveal } from "@/components/site/reveal";
import { getProjectBySlug } from "@/lib/queries";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description?.slice(0, 155),
    openGraph: { title: project.name, images: project.featuredImage ? [{ url: project.featuredImage }] : undefined },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const gallery = project.images.filter((i) => i.kind === "GALLERY").map((i) => i.url);
  const before = project.images.filter((i) => i.kind === "BEFORE").map((i) => i.url);
  const after = project.images.filter((i) => i.kind === "AFTER").map((i) => i.url);
  const allImages = gallery.length ? gallery : project.featuredImage ? [project.featuredImage] : [];

  return (
    <div className="pt-24 pb-20">
      <div className="section-container pt-6">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
          <Link href="/" className="hover:text-navy-900 dark:hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-navy-900 dark:hover:text-white">
            Projects
          </Link>
          <span>/</span>
          <span className="text-navy-700 dark:text-white/60">{project.name}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{PROJECT_TYPE_LABELS[project.projectType]}</Badge>
          <Badge variant="success">{PROJECT_STATUS_LABELS[project.status]}</Badge>
        </div>
        <h1 className="mt-3 font-serif-brand text-3xl font-medium text-navy-950 dark:text-white">{project.name}</h1>
        <p className="mt-1.5 flex items-center gap-1.5 text-gray-500 dark:text-white/50">
          <MapPin className="h-4 w-4" /> {project.location}
        </p>
      </div>

      <div className="section-container mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <ImageGallery images={allImages} alt={project.name} />

          {project.videoUrl && (
            <div className="mt-6 aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.06]">
              <iframe src={project.videoUrl} title="Project video" className="h-full w-full" allowFullScreen />
            </div>
          )}

          <Reveal className="mt-10">
            <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">About This Project</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-600 dark:text-white/60">{project.description}</p>
          </Reveal>

          {project.features.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Project Features</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.features.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                    <Check className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" /> {f.label}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {before.length > 0 && after.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Before &amp; After</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-white/40">Before</p>
                  <ImageGallery images={before} alt={`${project.name} before`} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-white/40">After</p>
                  <ImageGallery images={after} alt={`${project.name} after`} />
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900">
            <InquiryForm projectId={project.id} defaultType="CONSTRUCTION" title="Discuss a Similar Project" />
          </div>
          <Button asChild size="lg" variant="gold" className="w-full">
            <Link href="/contact">Discuss Your Construction Project</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
