import Image from "next/image";
import Link from "next/link";
import { Globe, MapPin, Phone } from "lucide-react";
import { telLink, whatsappLink, type CustomSocialLink } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./social-icons";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All Properties" },
      { href: "/builders", label: "Builders & Services" },
      { href: "/projects", label: "Construction Projects" },
      { href: "/payment-plans", label: "Payment Plans" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

interface FooterProps {
  logoUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  customSocialLinks?: CustomSocialLink[];
}

export function Footer({ logoUrl, facebookUrl, instagramUrl, youtubeUrl, customSocialLinks }: FooterProps) {
  const socialLinks = [
    { url: facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { url: instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { url: youtubeUrl, label: "YouTube", Icon: YoutubeIcon },
    ...(customSocialLinks || [])
      .filter((s) => s.url && s.label)
      .map((s) => ({ url: s.url, label: s.label, Icon: Globe })),
  ].filter((s) => s.url);

  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="section-container grid gap-12 py-20 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
        <div>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="Hassan Estates with Sandhu Builders" width={220} height={140} className="h-12 w-auto" />
            ) : (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 font-serif-brand text-lg font-bold text-navy-950">
                  H
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-serif-brand text-lg font-medium text-white">Hassan Estates</span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/45">Sandhu Builders</span>
                </div>
              </>
            )}
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
            Your trusted partner in real estate and construction — serving Top City-1, Islamabad, Rawalpindi and
            surrounding areas with premium properties and professional building solutions.
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socialLinks.map(({ url, label, Icon }, i) => (
                <a
                  key={`${label}-${i}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-gold-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="eyebrow">{col.title}</h4>
            <ul className="mt-5 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="eyebrow">Get in Touch</h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <span>Top City-1, B Block Commercial, Islamabad, Pakistan</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <a href={telLink()} className="hover:text-white">
                0331 8987584
              </a>
            </li>
          </ul>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 shadow-warm-sm transition-colors hover:bg-gold-400"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="section-container flex flex-col items-center justify-between gap-2 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Hassan Estates with Sandhu Builders. All rights reserved.</p>
          <p>Top City-1 · Islamabad · Rawalpindi</p>
        </div>
      </div>
    </footer>
  );
}
