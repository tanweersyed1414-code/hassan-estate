import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Hammer,
  Home as HomeIcon,
  LandPlot,
  MapPin,
  PencilRuler,
  ShieldCheck,
  Store,
  TreePalm,
  Wallet,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/site/hero-search";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { AboutCollage } from "@/components/site/about-collage";
import { ProjectCard } from "@/components/site/project-card";
import { PropertyCard } from "@/components/site/property-card";
import { Reveal, StaggerGroup } from "@/components/site/reveal";
import { AnimatedCounter } from "@/components/site/animated-counter";
import { Tilt3D } from "@/components/site/tilt-3d";
import { PropertyCardPremium } from "@/components/ui/property-card-premium";
import { ProductHighlightCard } from "@/components/ui/product-card";
import { getFeaturedProjects, getFeaturedProperties, getSiteSettingsMap } from "@/lib/queries";
import { PROPERTY_CATEGORY_LABELS, whatsappLink } from "@/lib/utils";

export const revalidate = 60;

const FEATURE_CARDS = [
  { icon: MapPin, title: "Prime Location", desc: "Verified addresses across Top City-1 and Islamabad." },
  { icon: HomeIcon, title: "Every Property Type", desc: "Plots, houses, apartments, shops and offices." },
  { icon: Wallet, title: "Flexible Budgets", desc: "Easy installment plans, calculated instantly." },
  { icon: ShieldCheck, title: "Trusted Builders", desc: "Construction backed by Sandhu Builders." },
];

const SERVICES = [
  { icon: HomeIcon, title: "Residential", desc: "Custom homes, foundation to finishing." },
  { icon: Building2, title: "Commercial", desc: "Plazas and retail built for value." },
  { icon: Hammer, title: "Renovation", desc: "Modernizing existing properties." },
  { icon: Wrench, title: "Interiors", desc: "Premium finishing and fit-outs." },
  { icon: PencilRuler, title: "Architecture", desc: "Design and approvals, end-to-end." },
  { icon: ShieldCheck, title: "Supervision", desc: "On-site management, stress-free." },
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  RESIDENTIAL_PLOT: LandPlot,
  COMMERCIAL_PLOT: LandPlot,
  HOUSE: HomeIcon,
  APARTMENT: Building2,
  FARMHOUSE: TreePalm,
  SHOP: Store,
  OFFICE: Briefcase,
  COMMERCIAL_BUILDING: Building2,
  OTHER: HomeIcon,
};

export default async function HomePage() {
  const [featuredProperties, featuredProjects, settings] = await Promise.all([
    getFeaturedProperties(6),
    getFeaturedProjects(3),
    getSiteSettingsMap(),
  ]);

  const stats = [
    { label: settings.stat_properties_listed_label || "Properties Listed", value: parseInt(settings.stat_properties_listed || "250"), suffix: "+" },
    { label: settings.stat_projects_completed_label || "Projects Completed", value: parseInt(settings.stat_projects_completed || "60"), suffix: "+" },
    { label: settings.stat_satisfied_clients_label || "Satisfied Clients", value: parseInt(settings.stat_satisfied_clients || "500"), suffix: "+" },
    { label: settings.stat_years_experience_label || "Years of Experience", value: parseInt(settings.stat_years_experience || "12"), suffix: "+" },
  ];

  const heroTitleMain = settings.hero_title_main || "Find Your";
  const heroTitleAccent = settings.hero_title_accent || "Luxury Dream Home";
  const heroSubtitle =
    settings.hero_subtitle || "Curated properties and professional construction, all in one trusted name across Top City-1, Islamabad.";
  const heroImage = settings.hero_image || "/homepage/hero-dusk.jpg";
  const heroCardImage = settings.hero_card_image || "/demo/trust-section.jpg";

  const trustTitle = settings.trust_title || "A Name You Can Trust in Top City-1";
  const trustText =
    settings.trust_text ||
    "Verified listings and construction backed by Sandhu Builders — property expertise and building capability, under one roof.";
  const trustImage = settings.trust_image || "/homepage/cta-banner.jpg";
  const aboutImage = settings.about_image || "/homepage/about-3.jpg";

  const ctaTitle = settings.cta_title || "Ready to find your dream property?";
  const ctaText =
    settings.cta_text ||
    "Speak with our team for a free, no-obligation consultation on buying, selling, or building in Top City-1.";
  const ctaImage = settings.cta_image || "/homepage/consultant.jpg";

  const heroPillImage = settings.hero_pill_image || "/homepage/consultant.jpg";
  const heroPillTitle = settings.hero_pill_title || "Verified listings, honest pricing";
  const heroPillSubtitle = settings.hero_pill_subtitle || "Trusted by 500+ clients across Top City-1";

  const collageImages = [
    { src: settings.homepage_collage_1 || "/homepage/about-1.jpg", alt: "Top City-1 residence" },
    { src: settings.homepage_collage_2 || "/homepage/about-3.jpg", alt: "Modern home built by Sandhu Builders" },
    { src: settings.homepage_collage_3 || "/homepage/about-4.jpg", alt: "Premium finishing detail" },
    { src: settings.homepage_collage_4 || "/homepage/about-2.jpg", alt: "Dusk view of a Top City-1 property" },
  ];

  const heroCarouselImages = [
    { src: heroImage, alt: "Luxury residence in Top City-1, Islamabad" },
    { src: trustImage, alt: "Hassan Estates construction project" },
    { src: aboutImage, alt: "Hassan Estates with Sandhu Builders" },
  ];

  const popularPicks = [...featuredProperties].slice(-3).reverse();
  const spotlightProperties = featuredProperties.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pb-10 pt-28 lg:pt-32">
        {/* Full-bleed backdrop behind the whole hero card, fading to the page's
            white background — the card itself stays exactly as designed. */}
        <div className="absolute inset-0 -z-10">
          <Image src={heroCardImage} alt="" aria-hidden fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/70 to-white dark:from-navy-950/10 dark:via-navy-950/75 dark:to-navy-950" />
        </div>

        <div className="section-container">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-warm dark:border-none dark:bg-navy-900">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                <Reveal>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gold-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold-600 dark:bg-gold-500/10 dark:text-gold-300">
                    <MapPin className="h-3.5 w-3.5" /> Top City-1 · Islamabad · Rawalpindi
                  </span>
                </Reveal>
                <Reveal delay={0.08}>
                  <h1 className="mt-6 font-serif-brand text-4xl font-extrabold leading-[1.1] text-navy-950 dark:text-white sm:text-5xl">
                    {heroTitleMain} <span className="text-gold-500">{heroTitleAccent}</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="mt-5 max-w-md text-gray-500 dark:text-white/60">{heroSubtitle}</p>
                </Reveal>
                <Reveal delay={0.24} className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg">
                    <Link href="/properties">
                      Explore Properties <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="subtle">
                    <Link href="/builders">Construction Services</Link>
                  </Button>
                </Reveal>

                <Reveal delay={0.32} className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-gray-100 pt-6 dark:border-white/[0.06]">
                  {stats.slice(0, 3).map((s) => (
                    <div key={s.label}>
                      <p className="font-serif-brand text-2xl font-extrabold text-navy-950 dark:text-white">
                        <AnimatedCounter value={s.value} suffix={s.suffix} />
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/50">{s.label}</p>
                    </div>
                  ))}
                </Reveal>
              </div>

              <Reveal delay={0.2} className="relative min-h-[360px] lg:min-h-[600px]">
                <HeroCarousel images={heroCarouselImages} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-warm sm:right-auto sm:max-w-xs">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <Image src={heroPillImage} alt="" fill sizes="48px" className="object-cover" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-950">{heroPillTitle}</p>
                    <p className="text-[11px] text-gray-500">{heroPillSubtitle}</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Floating pill search bar, docked to the bottom edge of the hero card */}
          <Reveal delay={0.4} className="relative z-20 -mt-8 px-4 sm:-mt-9">
            <HeroSearch />
          </Reveal>
        </div>
      </section>

      {/* FEATURE ICON ROW */}
      <section className="section-container py-20 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Why Search With Us</p>
          <h2 className="mt-3 font-serif-brand text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
            Everything You Need, Verified
          </h2>
          <p className="mt-3 text-gray-500 dark:text-white/50">
            Clear listings, honest pricing, and construction capability — no guesswork.
          </p>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((f) => (
            <Reveal key={f.title}>
              <Tilt3D max={6} className="h-full">
                <div className="flex h-full flex-col items-center rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-warm-sm transition-shadow hover:shadow-warm dark:border-white/[0.06] dark:bg-navy-900">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-300">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-serif-brand text-base font-bold text-navy-950 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-white/50">{f.desc}</p>
                </div>
              </Tilt3D>
            </Reveal>
          ))}
        </StaggerGroup>
      </section>

      {/* DARK PHOTO BANNER — trust teaser */}
      <section className="section-container pb-20 lg:pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-warm">
          <div className="relative grid min-h-[420px] items-center gap-10 lg:grid-cols-2">
            <Image src={trustImage} alt="Hassan Estates project" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-transparent" />
            <Reveal className="relative z-10 p-10 lg:p-16">
              <p className="eyebrow text-gold-400">Sandhu Builders</p>
              <h2 className="mt-4 max-w-md font-serif-brand text-3xl font-extrabold text-white sm:text-4xl">{trustTitle}</h2>
              <p className="mt-4 max-w-md text-white/70">{trustText}</p>
              <Button asChild size="lg" variant="gold" className="mt-8">
                <Link href="/contact">
                  Book a Consultation <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      {featuredProperties.length > 0 && (
        <section className="section-container py-20 lg:py-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Search Premium Near You</p>
              <h2 className="mt-3 font-serif-brand text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
                Featured Listings
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/properties">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.slice(0, 6).map((property, i) => (
              <Tilt3D key={property.id} max={5}>
                <PropertyCard property={property} index={i} />
              </Tilt3D>
            ))}
          </div>
        </section>
      )}

      {/* SIGNATURE SPOTLIGHTS */}
      {spotlightProperties.length > 0 && (
        <section className="bg-gray-50 py-20 dark:bg-white/[0.035] lg:py-24">
          <div className="section-container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow justify-center">Signature Spotlights</p>
              <h2 className="mt-3 font-serif-brand text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
                A Closer Look
              </h2>
            </Reveal>
            <StaggerGroup className="mt-14 flex flex-wrap justify-center gap-8">
              {spotlightProperties.map((property) => {
                const Icon = CATEGORY_ICONS[property.category] || HomeIcon;
                return (
                  <Reveal key={property.id}>
                    <Link href={`/properties/${property.slug}`}>
                      <ProductHighlightCard
                        category={PROPERTY_CATEGORY_LABELS[property.category] || property.category}
                        categoryIcon={<Icon className="h-5 w-5" />}
                        title={property.title.split(" - ")[0]}
                        description={property.location || property.city}
                        imageSrc={property.featuredImage || "/placeholder-property.svg"}
                        imageAlt={property.title}
                      />
                    </Link>
                  </Reveal>
                );
              })}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* ABOUT — image collage + stats */}
      <section className="py-20 lg:py-24">
        <div className="section-container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <AboutCollage images={collageImages} />
          </Reveal>

          <div>
            <Reveal>
              <p className="eyebrow">About Us</p>
              <h2 className="mt-3 font-serif-brand text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
                Hassan Estate &amp; Sandhu Builders
              </h2>
              <p className="mt-4 max-w-lg text-gray-600 dark:text-white/60">
                Two names, one standard: real estate expertise and construction craftsmanship, built for Top City-1.
              </p>
              <Button asChild size="lg" variant="outline" className="mt-6">
                <Link href="/about">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Reveal>

            <StaggerGroup className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-gray-200 pt-8 dark:border-white/[0.06]">
              {stats.map((stat) => (
                <Reveal key={stat.label}>
                  <p className="accent-text font-serif-brand text-4xl font-extrabold text-gold-500 sm:text-5xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-600 dark:text-white/60">{stat.label}</p>
                </Reveal>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* POPULAR PICKS */}
      {popularPicks.length > 0 && (
        <section className="bg-gray-50 py-20 dark:bg-white/[0.035] lg:py-24">
          <div className="section-container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow justify-center">Popular Picks</p>
              <h2 className="mt-3 font-serif-brand text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
                Popular in Top City-1
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularPicks.map((property, i) => (
                <Tilt3D key={property.id} max={6}>
                  <PropertyCardPremium property={property} index={i} />
                </Tilt3D>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BUILDERS / SERVICES */}
      <section className="bg-navy-950 py-20 text-white lg:py-24">
        <div className="section-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center text-gold-400">Sandhu Builders</p>
            <h2 className="mt-3 font-serif-brand text-3xl font-extrabold sm:text-4xl">Construction, Built to Last</h2>
          </Reveal>

          <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <Reveal key={service.title}>
                <Tilt3D max={6}>
                  <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:bg-white/[0.08]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                      <service.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-serif-brand text-lg font-bold">{service.title}</h3>
                    <p className="mt-2 text-sm text-white/60">{service.desc}</p>
                  </div>
                </Tilt3D>
              </Reveal>
            ))}
          </StaggerGroup>

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" variant="gold">
              <Link href="/contact">Discuss Your Construction Project</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {featuredProjects.length > 0 && (
        <section className="section-container py-20 lg:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">Our Portfolio</p>
            <h2 className="mt-3 font-serif-brand text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
              Construction Projects
            </h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <Tilt3D key={project.id} max={6}>
                <ProjectCard project={project} index={i} />
              </Tilt3D>
            ))}
          </StaggerGroup>
          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/projects">
                View All Projects <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="section-container pb-20 lg:pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gold-500 shadow-warm">
          <div className="relative grid items-center gap-10 p-10 lg:grid-cols-[1.2fr_1fr] lg:p-16">
            <Reveal>
              <ShieldCheck className="h-8 w-8 text-navy-950" />
              <h2 className="mt-5 font-serif-brand text-3xl font-extrabold text-navy-950 sm:text-4xl">
                {ctaTitle}
              </h2>
              <p className="mt-4 max-w-lg whitespace-pre-line text-navy-950/75">{ctaText}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-navy-950 text-white shadow-none hover:bg-white hover:text-navy-950 hover:shadow-warm dark:bg-navy-950 dark:hover:bg-white dark:hover:text-navy-950"
                >
                  <Link href="/contact">Schedule a Consultation</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-navy-950/30 text-navy-950 hover:border-navy-950 dark:border-navy-950/30 dark:text-navy-950">
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </Reveal>
            <div className="relative hidden aspect-square overflow-hidden rounded-[2rem] border-4 border-navy-950/15 lg:block">
              <Image src={ctaImage} alt="Speak with our team" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
