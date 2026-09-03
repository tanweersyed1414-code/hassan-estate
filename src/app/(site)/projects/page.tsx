import type { Metadata } from "next";
import Image from "next/image";
import { ProjectCard } from "@/components/site/project-card";
import { Pagination } from "@/components/site/pagination";
import { Reveal } from "@/components/site/reveal";
import { Select } from "@/components/ui/select";
import { getProjects, getSiteSettingsMap } from "@/lib/queries";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Construction Project Portfolio | Sandhu Builders",
  description: "Explore residential and commercial construction projects completed and underway by Sandhu Builders in Islamabad and Rawalpindi.",
};

type SearchParams = { [key: string]: string | string[] | undefined };
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = first(sp.status);
  const projectType = first(sp.projectType);
  const page = sp.page ? Number(first(sp.page)) : 1;

  const [{ projects, total, pageSize }, settings] = await Promise.all([
    getProjects({ status, projectType, page, pageSize: 9 }),
    getSiteSettingsMap(),
  ]);
  const bannerImage = settings.projects_hero_image || "/demo/project-plaza-1.jpg";

  const searchParamsRecord: Record<string, string> = {};
  if (status) searchParamsRecord.status = status;
  if (projectType) searchParamsRecord.projectType = projectType;

  return (
    <div className="pt-28 pb-20">
      <div className="relative overflow-hidden bg-navy-950 py-10 text-white">
        <Image src={bannerImage} alt="Sandhu Builders construction projects" fill className="object-cover opacity-35" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 to-navy-950" />
        <div className="section-container relative z-10">
          <p className="eyebrow">Construction Portfolio</p>
          <h1 className="mt-1 font-serif-brand text-3xl font-medium sm:text-4xl">Our Construction Projects</h1>
        </div>
      </div>

      <div className="section-container mt-10">
        <form className="mb-8 flex flex-wrap gap-3" method="get">
          <Select name="status" defaultValue={status || ""} className="w-auto">
            <option value="">All Statuses</option>
            {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <Select name="projectType" defaultValue={projectType || ""} className="w-auto">
            <option value="">All Types</option>
            {Object.entries(PROJECT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <button type="submit" className="rounded-full bg-navy-900 px-5 py-2 text-sm font-medium text-white hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500">
            Filter
          </button>
        </form>

        {projects.length > 0 ? (
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </Reveal>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 py-20 text-center text-gray-400 dark:border-white/[0.06] dark:text-white/40">
            No projects match this filter yet.
          </div>
        )}

        <Pagination page={page} pageSize={pageSize} total={total} basePath="/projects" searchParams={searchParamsRecord} />
      </div>
    </div>
  );
}
