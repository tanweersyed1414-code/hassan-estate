import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FloatingButtons } from "@/components/site/floating-buttons";
import { ChatWidget } from "@/components/site/chat-widget";
import { ChatProvider } from "@/components/site/chat-context";
import { getSiteSettingsMap } from "@/lib/queries";
import { parseCustomSocialLinks } from "@/lib/utils";
import { buildTypographyCss } from "@/lib/typography";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Hassan Estates with Sandhu Builders",
  image: `${siteUrl}/opengraph-image`,
  url: siteUrl,
  telephone: "+92-331-8987584",
  priceRange: "PKR",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Top City-1, B Block Commercial",
    addressLocality: "Islamabad",
    addressCountry: "PK",
  },
  areaServed: ["Top City-1 Islamabad", "Islamabad", "Rawalpindi"],
  openingHours: "Mo-Sa 10:00-20:00",
};

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettingsMap();
  const logoUrl = settings.site_logo_url || undefined;

  // Admin-configurable fonts / text size / text colours (Settings → Typography).
  // Scoped to the public site — the admin panel keeps its own default styling.
  const typographyCss = buildTypographyCss({
    headingFont: settings.type_heading_font,
    bodyFont: settings.type_body_font,
    baseSize: settings.type_base_size,
    bodyColorLight: settings.type_body_color_light,
    bodyColorDark: settings.type_body_color_dark,
    headingColorLight: settings.type_heading_color_light,
    headingColorDark: settings.type_heading_color_dark,
    accentColorLight: settings.type_accent_color_light,
    accentColorDark: settings.type_accent_color_dark,
  });

  return (
    <ChatProvider>
      {typographyCss && <style dangerouslySetInnerHTML={{ __html: typographyCss }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <Navbar logoUrl={logoUrl} />
      <main className="min-h-screen">{children}</main>
      <Footer
        logoUrl={logoUrl}
        facebookUrl={settings.facebook_url}
        instagramUrl={settings.instagram_url}
        youtubeUrl={settings.youtube_url}
        customSocialLinks={parseCustomSocialLinks(settings.custom_social_links)}
      />
      <FloatingButtons />
      <ChatWidget />
    </ChatProvider>
  );
}
