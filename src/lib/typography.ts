// Public-site typography controls. In /admin/settings → "Typography" an admin
// picks a heading font, a body font, a base text size and (optionally) text
// colours for light/dark mode. Those choices are stored as site_settings rows
// (type_* keys) and turned into a small CSS override that the (site) layout
// injects — it only reassigns two font variables plus a handful of colour /
// size declarations, so an unset field always falls back to the built-in
// design. Pure functions, no DOM/server deps — safe to import from a Server
// Component (the layout) or a Client Component (the admin form preview).

export interface FontOption {
  value: string;
  label: string;
  varName: string;
  type: "sans" | "serif";
}

// Every family here is loaded by the root layout via next/font/google and
// exposes the matching --font-* CSS variable on <body>.
export const FONT_OPTIONS: FontOption[] = [
  { value: "jakarta", label: "Plus Jakarta Sans", varName: "--font-jakarta", type: "sans" },
  { value: "inter", label: "Inter", varName: "--font-inter", type: "sans" },
  { value: "poppins", label: "Poppins", varName: "--font-poppins", type: "sans" },
  { value: "montserrat", label: "Montserrat", varName: "--font-montserrat", type: "sans" },
  { value: "nunito", label: "Nunito", varName: "--font-nunito", type: "sans" },
  { value: "roboto", label: "Roboto", varName: "--font-roboto", type: "sans" },
  { value: "open-sans", label: "Open Sans", varName: "--font-open-sans", type: "sans" },
  { value: "lora", label: "Lora", varName: "--font-lora", type: "serif" },
  { value: "playfair", label: "Playfair Display", varName: "--font-playfair", type: "serif" },
  { value: "merriweather", label: "Merriweather", varName: "--font-merriweather", type: "serif" },
];

const SANS_FALLBACK =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF_FALLBACK = 'ui-serif, Georgia, Cambria, "Times New Roman", serif';

/** CSS font-family value for a stored font choice, or null to keep the default. */
export function fontStack(value?: string | null): string | null {
  const opt = FONT_OPTIONS.find((f) => f.value === value);
  if (!opt) return null;
  return `var(${opt.varName}), ${opt.type === "serif" ? SERIF_FALLBACK : SANS_FALLBACK}`;
}

export interface FontSizeOption {
  value: string;
  label: string;
  px: number;
}

export const DEFAULT_BASE_PX = 16;

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: "sm", label: "Small", px: 15 },
  { value: "base", label: "Default", px: DEFAULT_BASE_PX },
  { value: "lg", label: "Large", px: 17 },
  { value: "xl", label: "Extra Large", px: 18 },
];

/** Root font-size in px for a stored size choice (defaults to 16). */
export function baseFontPx(value?: string | null): number {
  return FONT_SIZE_OPTIONS.find((o) => o.value === value)?.px ?? DEFAULT_BASE_PX;
}

export interface TypographySettings {
  headingFont?: string;
  bodyFont?: string;
  baseSize?: string;
  bodyColorLight?: string;
  bodyColorDark?: string;
  headingColorLight?: string;
  headingColorDark?: string;
  accentColorLight?: string;
  accentColorDark?: string;
}

function validHex(v?: string | null): string | null {
  return v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : null;
}

// A custom heading colour is applied to every semantic heading EXCEPT those
// that must stay light for contrast: headings inside the always-dark navy
// services section, and headings carrying an explicit text-white / gold
// utility (dark photo banners, gold stat figures).
const HEADING_SELECTOR =
  ':is(h1,h2,h3,h4,h5,h6):not(.bg-navy-950 *):not(.text-white):not([class*="text-gold"])';

// The "accent / highlight words": the small uppercase section labels
// (.eyebrow), the gold words highlighted inside a heading (e.g. the hero
// accent span), and the large gold stat figures (tagged .accent-text in the
// markup). Recoloured independently of the theme's accent (buttons/links).
// Wrapped in :is() so the `.dark ` prefix applies to the whole group, not
// just the first comma-separated part.
const ACCENT_SELECTOR =
  ':is(.eyebrow,.accent-text,:is(h1,h2,h3,h4,h5,h6) [class*="text-gold"])';

/**
 * CSS override for the public site. Returns "" when nothing is customised, so
 * the caller can skip rendering a <style> tag entirely.
 */
export function buildTypographyCss(s: TypographySettings): string {
  const rules: string[] = [];
  const rootDecls: string[] = [];

  const bodyStack = fontStack(s.bodyFont);
  if (bodyStack) rootDecls.push(`--font-sans:${bodyStack}`);
  const headingStack = fontStack(s.headingFont);
  if (headingStack) rootDecls.push(`--font-serif:${headingStack}`);

  const bodyLight = validHex(s.bodyColorLight);
  if (bodyLight) rootDecls.push(`--foreground:${bodyLight}`);

  if (rootDecls.length) {
    rules.push(`:root{${rootDecls.map((d) => `${d} !important`).join(";")}}`);
  }

  const bodyDark = validHex(s.bodyColorDark);
  if (bodyDark) rules.push(`.dark{--foreground:${bodyDark} !important}`);

  const px = baseFontPx(s.baseSize);
  if (px !== DEFAULT_BASE_PX) rules.push(`html{font-size:${px}px}`);

  const headLight = validHex(s.headingColorLight);
  if (headLight) rules.push(`${HEADING_SELECTOR}{color:${headLight} !important}`);
  const headDark = validHex(s.headingColorDark);
  if (headDark) rules.push(`.dark ${HEADING_SELECTOR}{color:${headDark} !important}`);

  const accentLight = validHex(s.accentColorLight);
  if (accentLight) rules.push(`${ACCENT_SELECTOR}{color:${accentLight} !important}`);
  const accentDark = validHex(s.accentColorDark);
  if (accentDark) rules.push(`.dark ${ACCENT_SELECTOR}{color:${accentDark} !important}`);

  return rules.join("");
}
