import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, HardHat, Hammer, Home as HomeIcon, PencilRuler, Wrench, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerGroup } from "@/components/site/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { getFeaturedProjects, getSiteSettingsMap } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Construction Company in Islamabad | Sandhu Builders",
  description:
    "Sandhu Builders offers residential and commercial construction, renovation, interior work, architectural planning and project management across Islamabad and Rawalpindi.",
};

const SERVICES = [
  {
    icon: HomeIcon,
    title: "Residential Construction",
    desc: "Complete home construction from grey structure to finishing, tailored to your family's needs and budget.",
    benefits: ["Custom architectural design", "Quality-checked materials", "Transparent cost estimates"],
  },
  {
    icon: Building2,
    title: "Commercial Construction",
    desc: "Plazas, offices, and retail spaces engineered for durability, functionality, and strong return on investment.",
    benefits: ["Code-compliant structural design", "Elevator & parking planning", "Fire & safety systems"],
  },
  {
    icon: HomeIcon,
    title: "House Construction",
    desc: "Turnkey house construction services managed from planning approval to handover of keys.",
    benefits: ["Fixed-price packages available", "Dedicated site supervisor", "Regular progress updates"],
  },
  {
    icon: Hammer,
    title: "Renovation",
    desc: "Give your existing property a modern upgrade — from facades to full interior overhauls.",
    benefits: ["Structural assessment", "Minimal disruption planning", "Before/after documentation"],
  },
  {
    icon: Wrench,
    title: "Interior Work",
    desc: "Premium interior fit-outs, false ceilings, flooring, and finishing carried out by skilled craftsmen.",
    benefits: ["Imported & local material options", "3D visualization on request", "On-time delivery"],
  },
  {
    icon: PencilRuler,
    title: "Architectural Planning",
    desc: "Detailed architectural drawings, structural planning, and authority approvals handled for you.",
    benefits: ["Map approval assistance", "Vastu/orientation guidance", "Detailed BOQ preparation"],
  },
  {
    icon: HardHat,
    title: "Project Management",
    desc: "End-to-end project management so you can build with confidence, wherever you are.",
    benefits: ["Vendor & labor coordination", "Quality control checkpoints", "Milestone-based reporting"],
  },
];

export default async function BuildersPage() {
  const [projects, settings] = await Promise.all([getFeaturedProjects(3), getSiteSettingsMap()]);

  const heroTitle = settings.builders_hero_title || "Professional Construction Solutions, Built on Trust";
  const heroSubtitle =
    settings.builders_hero_subtitle ||
    "From architectural planning to final finishing touches, Sandhu Builders delivers quality construction across Top City-1, Islamabad and Rawalpindi.";
  const heroImage = settings.builders_hero_image || "/demo/builders-hero.jpg";

  return (
    <div className="pt-24">
      <section className="relative overflow-hidden bg-navy-950 py-20 text-white">
        <Image src={heroImage} alt="Sandhu Builders construction site" fill className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 to-navy-950" />
        <div className="section-container relative z-10">
          <Reveal>
            <p className="eyebrow">Sandhu Builders</p>
            <h1 className="mt-2 max-w-2xl font-serif-brand text-4xl font-medium sm:text-5xl">{heroTitle}</h1>
            <p className="mt-4 max-w-xl text-white/70">{heroSubtitle}</p>
            <Button asChild size="lg" variant="gold" className="mt-6">
              <Link href="/contact">Discuss Your Construction Project</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="section-container py-20 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">What We Do</p>
          <h2 className="mt-2 font-serif-brand text-3xl font-medium text-navy-950 sm:text-4xl dark:text-white">Our Services</h2>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((s) => (
            <Reveal key={s.title} className="rounded-lg border border-gray-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg dark:border-white/[0.06] dark:bg-navy-900">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/5 text-navy-900 dark:bg-white/5 dark:text-gold-300">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif-brand text-lg font-medium text-navy-950 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-white/50">{s.desc}</p>
              <ul className="mt-4 space-y-2">
                {s.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" /> {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </StaggerGroup>
      </section>

      {projects.length > 0 && (
        <section className="bg-gray-50 py-20 lg:py-28 dark:bg-white/[0.02]">
          <div className="section-container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Our Work</p>
              <h2 className="mt-2 font-serif-brand text-3xl font-medium text-navy-950 sm:text-4xl dark:text-white">Recent Projects</h2>
            </Reveal>
            <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </StaggerGroup>
            <div className="mt-10 flex justify-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/projects">View Full Portfolio</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="section-container py-20 text-center lg:py-24">
        <Reveal>
          <h2 className="font-serif-brand text-3xl font-medium text-navy-950 sm:text-4xl dark:text-white">
            Ready to Start Building?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500 dark:text-white/50">
            Tell us about your project and our team will get in touch to discuss scope, timeline, and budget.
          </p>
          <Button asChild size="lg" variant="gold" className="mt-6">
            <Link href="/contact">Discuss Your Construction Project</Link>
          </Button>
        </Reveal>
      </section>
    </div>
  );
}
