import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Inter,
  Poppins,
  Montserrat,
  Nunito,
  Roboto,
  Open_Sans,
  Lora,
  Playfair_Display,
  Merriweather,
} from "next/font/google";
import { Toaster } from "sonner";
import { getSiteSettingsMap } from "@/lib/queries";
import { buildThemeCss } from "@/lib/theme";
import "./globals.css";

// Plus Jakarta Sans (bold, rounded, confident display grotesk) for headings,
// paired with Inter for body/UI text — the site defaults. The remaining
// families are the pool the admin can switch to in Settings → Typography;
// each exposes a --font-* variable that the injected typography override can
// point --font-sans / --font-serif at. If a deployment has no outbound access
// to Google Fonts, next/font build fails; in that case revert to the system
// stacks documented in globals.css's --font-sans / --font-serif fallbacks.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["600", "700", "800"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: ["400", "500", "600", "700"] });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "500", "600", "700", "800"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "500", "700"] });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", weight: ["400", "600", "700"] });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", weight: ["400", "500", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "600", "700", "800"] });
const merriweather = Merriweather({ subsets: ["latin"], variable: "--font-merriweather", weight: ["400", "700"] });

const fontVars = [
  jakarta,
  inter,
  poppins,
  montserrat,
  nunito,
  roboto,
  openSans,
  lora,
  playfair,
  merriweather,
]
  .map((f) => f.variable)
  .join(" ");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hassan Estates with Sandhu Builders | Real Estate & Construction, Top City-1 Islamabad",
    template: "%s | Hassan Estates with Sandhu Builders",
  },
  description:
    "Premium real estate and construction company in Top City-1, Islamabad. Plots, houses, commercial properties, and professional construction services across Islamabad and Rawalpindi.",
  keywords: [
    "Real Estate Top City Islamabad",
    "Plots for Sale Top City-1",
    "Property Dealer Top City Islamabad",
    "Hassan Estates Islamabad",
    "Sandhu Builders Islamabad",
    "House Construction Islamabad",
    "Construction Company Top City",
  ],
  authors: [{ name: "Hassan Estates with Sandhu Builders" }],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Hassan Estates with Sandhu Builders",
    title: "Hassan Estates with Sandhu Builders",
    description: "Your Trusted Partner in Real Estate & Construction — Top City-1, Islamabad.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hassan Estates with Sandhu Builders",
    description: "Your Trusted Partner in Real Estate & Construction — Top City-1, Islamabad.",
  },
  robots: { index: true, follow: true },
};

// Runs before paint so the site never flashes light-then-dark (or vice
// versa) on load. Kept as a plain inline script (not a component) because
// it has to execute synchronously in <head>, ahead of hydration.
const themeBootScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Admin-configurable brand colors (Appearance section in /admin/settings).
  // Falls back to the site's default ink-navy/gold palette when unset.
  const settings = await getSiteSettingsMap();
  const themeCss = buildThemeCss(settings.theme_primary_color, settings.theme_accent_color);

  return (
    <html lang="en" data-scroll-behavior="smooth" className={fontVars} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
