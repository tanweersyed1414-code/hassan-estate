import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ProjectForm } from "@/components/admin/project-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project] = await db.select().from(schema.constructionProjects).where(eq(schema.constructionProjects.id, Number(id))).limit(1);
  if (!project) notFound();

  const [images, features] = await Promise.all([
    db.select().from(schema.projectImages).where(eq(schema.projectImages.projectId, project.id)),
    db.select().from(schema.projectFeatures).where(eq(schema.projectFeatures.projectId, project.id)),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Edit Construction Project</h1>
      <ProjectForm project={project} images={images} features={features} />
    </div>
  );
}
