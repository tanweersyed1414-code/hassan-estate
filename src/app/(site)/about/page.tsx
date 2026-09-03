import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Building2, Handshake, ShieldCheck, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerGroup } from "@/components/site/reveal";
import { AnimatedCounter } from "@/components/site/animated-counter";
import { getSiteSettingsMap } from "@/lib/queries";
import { renderRichText } from "@/lib/rich-text";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Hassan Estates with Sandhu Builders — our mission, vision, values, and why we're a trusted name in Top City-1, Islamabad.",
};

const VALUES = [
  { icon: ShieldCheck, title: "Integrity", desc: "Transparent dealings and honest advice, every time." },
  { icon: Award, title: "Quality", desc: "Premium standards in every property and every build." },
  { icon: Handshake, title: "Trust", desc: "Long-term relationships built on reliability." },
  { icon: Target, title: "Excellence", desc: "Continuous improvement in service and construction." },
];

export default async function AboutPage() {
  const settings = await getSiteSettingsMap();

  const aboutImage = settings.about_image || "/demo/about-story.jpg";
  const missionImage = settings.about_mission_image || "/demo/about-story.jpg";
  const aboutBody =
    settings.about_body ||
    "**Hassan Estates** specializes in connecting buyers, sellers, and investors with the right residential and commercial opportunities in Top City-1 and its surrounding areas — offering verified listings, honest guidance, and end-to-end transaction support.\n\n**Sandhu Builders** complements this with professional construction services — from architectural planning to final finishing — delivering homes and commercial buildings constructed to premium standards.\n\nTogether, we offer a single trusted destination for anyone looking to buy, sell, or build property in the region, with plans to expand our services across Pakistan.";

  const stats = [
    { label: settings.stat_properties_listed_label || "Properties Listed", value: parseInt(settings.stat_properties_listed || "250"), suffix: "+" },
    { label: settings.stat_projects_completed_label || "Projects Completed", value: parseInt(settings.stat_projects_completed || "60"), suffix: "+" },
    { label: settings.stat_satisfied_clients_label || "Satisfied Clients", value: parseInt(settings.stat_satisfied_clients || "500"), suffix: "+" },
    { label: settings.stat_years_experience_label || "Years of Experience", value: parseInt(settings.stat_years_experience || "12"), suffix: "+" },
  ];

  return (
    <div className="pt-24">
      <section className="section-container py-16 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">About Us</p>
          <h1 className="mt-2 font-serif-brand text-3xl font-medium text-navy-950 sm:text-4xl dark:text-white">
            Real Estate Expertise, Construction Capability — Under One Roof
          </h1>
          <p className="mt-4 text-gray-500 dark:text-white/50">
            Hassan Estates with Sandhu Builders brings together property expertise and professional construction to
            serve Top City-1, Islamabad, Rawalpindi, and surrounding areas.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={aboutImage}
                alt="Hassan Estates with Sandhu Builders"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif-brand text-2xl font-medium text-navy-950 dark:text-white">Who We Are</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-gray-600 dark:text-white/60 dark:[&_strong]:text-white">{renderRichText(aboutBody)}</div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy-950 py-16 text-white lg:py-20">
        <Image src={missionImage} alt="Hassan Estates with Sandhu Builders" fill className="object-cover opacity-25" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 to-navy-950" />
        <div className="section-container relative z-10 grid gap-8 sm:grid-cols-3">
          <Reveal className="rounded-lg border border-white/10 bg-white/[0.03] p-7">
            <Target className="h-7 w-7 text-gold-400" />
            <h3 className="mt-4 font-serif-brand text-lg font-medium">Our Mission</h3>
            <p className="mt-2 text-sm text-white/60">
              To deliver trustworthy real estate services and quality construction solutions that exceed client
              expectations.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-lg border border-white/10 bg-white/[0.03] p-7">
            <Building2 className="h-7 w-7 text-gold-400" />
            <h3 className="mt-4 font-serif-brand text-lg font-medium">Our Vision</h3>
            <p className="mt-2 text-sm text-white/60">
              To become Pakistan&apos;s most trusted name in integrated real estate and construction services.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="rounded-lg border border-white/10 bg-white/[0.03] p-7">
            <Users className="h-7 w-7 text-gold-400" />
            <h3 className="mt-4 font-serif-brand text-lg font-medium">Why Choose Us</h3>
            <p className="mt-2 text-sm text-white/60">
              Verified listings, transparent pricing, professional construction, and a dedicated team that puts
              clients first.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-container py-16 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our Values</p>
          <h2 className="mt-2 font-serif-brand text-3xl font-medium text-navy-950 dark:text-white">What Drives Us</h2>
        </Reveal>
        <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <Reveal key={v.title} className="rounded-lg border border-gray-200 p-6 text-center shadow-sm dark:border-white/[0.06]">
              <v.icon className="mx-auto h-7 w-7 text-gold-600 dark:text-gold-400" />
              <h3 className="mt-3 font-serif-brand text-base font-medium text-navy-950 dark:text-white">{v.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-white/50">{v.desc}</p>
            </Reveal>
          ))}
        </StaggerGroup>
      </section>

      <section className="bg-gold-50 py-16 dark:bg-navy-900">
        <div className="section-container grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="accent-text font-serif-brand text-4xl font-medium text-navy-950 sm:text-5xl dark:text-gold-300">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container py-16 text-center lg:py-20">
        <Reveal>
          <h2 className="font-serif-brand text-3xl font-medium text-navy-950 dark:text-white">Let&apos;s Work Together</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500 dark:text-white/50">
            Whether you&apos;re looking for a property or planning to build, our team is ready to help.
          </p>
          <Button asChild size="lg" variant="gold" className="mt-6">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </Reveal>
      </section>
    </div>
  );
}
