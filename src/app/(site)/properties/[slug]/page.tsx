import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BedDouble, Bath, Car, Check, MapPin, MessageCircle, Phone, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/site/image-gallery";
import { PropertyMap } from "@/components/site/property-map";
import { InquiryForm } from "@/components/site/inquiry-form";
import { VisitForm } from "@/components/site/visit-form";
import { PropertyCard } from "@/components/site/property-card";
import { Reveal } from "@/components/site/reveal";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/queries";
import { auth } from "@/auth";
import {
  AREA_UNIT_LABELS,
  formatPKR,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_STATUS_LABELS,
  telLink,
  whatsappLink,
} from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  return {
    title: property.title,
    description: property.description?.slice(0, 155) || `${property.title} in ${property.location}, ${property.city}.`,
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 155),
      images: property.featuredImage ? [{ url: property.featuredImage }] : undefined,
    },
    alternates: { canonical: `/properties/${property.slug}` },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const related = await getRelatedProperties(property);
  const session = await auth();
  const visitorName = session?.user?.kind === "visitor" ? session.user.name || "" : undefined;
  const images = property.images.map((i) => i.url).filter(Boolean);
  if (images.length === 0 && property.featuredImage) images.push(property.featuredImage);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/properties/${property.slug}`,
    image: images,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.fullAddress || property.location,
      addressLocality: property.city,
      addressCountry: "PK",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability: property.status === "SOLD" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="pt-24 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="section-container pt-6">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
          <Link href="/" className="hover:text-navy-900 dark:hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-navy-900 dark:hover:text-white">
            Properties
          </Link>
          <span>/</span>
          <span className="text-navy-700 dark:text-white/60">{property.title}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{PROPERTY_CATEGORY_LABELS[property.category]}</Badge>
              <Badge variant="success">{PROPERTY_STATUS_LABELS[property.status]}</Badge>
              {property.isFeatured && <Badge variant="gold">Featured</Badge>}
            </div>
            <h1 className="mt-3 font-serif-brand text-2xl font-medium text-navy-950 sm:text-3xl dark:text-white">{property.title}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-gray-500 dark:text-white/50">
              <MapPin className="h-4 w-4" /> {property.fullAddress || property.location}, {property.city}
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif-brand text-3xl font-medium text-navy-950 dark:text-white">{formatPKR(property.price)}</p>
            {property.isNegotiable && <p className="text-sm text-gray-400 dark:text-white/40">Negotiable</p>}
          </div>
        </div>
      </div>

      <div className="section-container mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <ImageGallery images={images} alt={property.title} />

          {property.videoUrl && (
            <div className="mt-6 aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.06]">
              <iframe src={property.videoUrl} title="Property video" className="h-full w-full" allowFullScreen />
            </div>
          )}

          <Reveal className="mt-10">
            <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Property Overview</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <OverviewStat icon={Ruler} label="Area" value={`${property.area} ${AREA_UNIT_LABELS[property.areaUnit]}`} />
              {property.bedrooms > 0 && <OverviewStat icon={BedDouble} label="Bedrooms" value={String(property.bedrooms)} />}
              {property.bathrooms > 0 && <OverviewStat icon={Bath} label="Bathrooms" value={String(property.bathrooms)} />}
              {property.parking > 0 && <OverviewStat icon={Car} label="Parking" value={String(property.parking)} />}
            </div>
            <p className="mt-6 whitespace-pre-line leading-relaxed text-gray-600 dark:text-white/60">{property.description}</p>
          </Reveal>

          {property.features.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Features &amp; Amenities</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.features.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                    <Check className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" /> {f.label}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal className="mt-10">
            <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Location</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">{property.fullAddress || property.location}</p>
            <div className="mt-4">
              <PropertyMap address={`${property.location}, ${property.city}`} lat={property.latitude} lng={property.longitude} />
            </div>
          </Reveal>

          {property.plans.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Payment Plan</h2>
              {property.plans.map((plan) => (
                <div key={plan.id} className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-6 dark:border-white/[0.06] sm:grid-cols-4">
                  <PlanStat label="Total Price" value={formatPKR(plan.totalPrice)} />
                  <PlanStat label="Booking Amount" value={formatPKR(plan.bookingAmount)} />
                  <PlanStat label="Down Payment" value={formatPKR(plan.downPayment)} />
                  <PlanStat label="Monthly Installment" value={formatPKR(plan.monthlyInstallment)} />
                  {plan.notes && <p className="col-span-2 sm:col-span-4 text-sm text-gray-500 dark:text-white/50">{plan.notes}</p>}
                </div>
              ))}
              <Link href="/payment-plans" className="mt-3 inline-block text-sm font-semibold text-navy-900 underline-offset-4 hover:underline dark:text-white">
                View all payment plans →
              </Link>
            </Reveal>
          )}

          {related.length > 0 && (
            <Reveal className="mt-14">
              <h2 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Related Properties</h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((p, i) => (
                  <PropertyCard key={p.id} property={p} index={i} />
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* Sidebar action panel */}
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900">
            <h3 className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">Book a Property Visit</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Our team will confirm your requested time.</p>
            <div className="mt-4">
              <VisitForm
                propertyId={property.id}
                visitorName={visitorName}
                bookingEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900">
            <InquiryForm propertyId={property.id} defaultType="PROPERTY" title="Send an Inquiry" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button asChild size="lg" className="w-full">
              <a href={telLink()}>
                <Phone className="h-4 w-4" /> Call Us
              </a>
            </Button>
            <Button asChild size="lg" variant="gold" className="w-full">
              <a href={whatsappLink(`I'm interested in ${property.title}`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile floating action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-gray-200 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-navy-900 lg:hidden">
        <Button asChild variant="outline" className="flex-1">
          <a href={telLink()}>
            <Phone className="h-4 w-4" /> Call
          </a>
        </Button>
        <Button asChild variant="gold" className="flex-1">
          <a href={whatsappLink(`I'm interested in ${property.title}`)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

function OverviewStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-white/5">
      <Icon className="mx-auto h-5 w-5 text-gold-600 dark:text-gold-400" />
      <p className="mt-2 text-sm font-semibold text-navy-950 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 dark:text-white/40">{label}</p>
    </div>
  );
}

function PlanStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-white/40">{label}</p>
      <p className="mt-1 font-semibold text-navy-950 dark:text-white">{value}</p>
    </div>
  );
}
