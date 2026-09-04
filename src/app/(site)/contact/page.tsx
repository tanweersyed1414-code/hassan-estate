import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Reveal } from "@/components/site/reveal";
import { getSiteSettingsMap } from "@/lib/queries";
import { telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Hassan Estates with Sandhu Builders at Top City-1, B Block Commercial, Islamabad. Call or WhatsApp 0331 8987584.",
};

export default async function ContactPage() {
  const settings = await getSiteSettingsMap();
  const address = settings.contact_address || "Top City-1, B Block Commercial, Islamabad, Pakistan";
  const email = settings.contact_email || "info@hassanestates.pk";
  const mapLocation = settings.contact_map_query || address;
  const mapSrc = /^https?:\/\//.test(mapLocation)
    ? mapLocation
    : `https://www.google.com/maps?q=${encodeURIComponent(mapLocation)}&output=embed`;
  const bannerImage = settings.contact_hero_image || "/demo/office-1.jpg";

  return (
    <div className="pt-28 pb-20">
      <div className="relative overflow-hidden bg-navy-950 py-10 text-white">
        <Image src={bannerImage} alt="Contact Hassan Estates with Sandhu Builders" fill className="object-cover opacity-35" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 to-navy-950" />
        <div className="section-container relative z-10">
          <p className="eyebrow">Get in Touch</p>
          <h1 className="mt-1 font-serif-brand text-3xl font-medium sm:text-4xl">Contact Us</h1>
        </div>
      </div>

      <div className="section-container mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900">
            <h2 className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">Hassan Estates with Sandhu Builders</h2>
            <ul className="mt-4 space-y-4 text-sm text-gray-600 dark:text-white/60">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600 dark:text-gold-400" />
                <span>{address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold-600 dark:text-gold-400" />
                <a href={telLink()} className="hover:text-navy-900 dark:hover:text-white">
                  0331 8987584
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold-600 dark:text-gold-400" />
                <a href={`mailto:${email}`} className="hover:text-navy-900 dark:hover:text-white">
                  {email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600 dark:text-gold-400" />
                <span>{settings.office_hours || "Mon - Sat: 10:00 AM - 8:00 PM"}</span>
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <a
                href={telLink()}
                className="flex flex-1 items-center justify-center gap-2 border border-navy-900/15 py-2.5 text-sm font-medium text-navy-900 hover:border-navy-900 dark:border-white/20 dark:text-white dark:hover:border-white"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.06]">
            <iframe title="Office location" src={mapSrc} width="100%" height="280" style={{ border: 0 }} loading="lazy" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900 lg:p-8">
          <InquiryForm title="Send Us a Message" />
        </Reveal>
      </div>
    </div>
  );
}
