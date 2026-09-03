// Color utilities for the admin-configurable site theme. Every dark surface
// across the site (hero, nav, footer, cards, admin panel) and every gold
// accent is driven by two CSS custom-property scales — --navy-950..--navy-500
// and --gold-600..--gold-50 — defined in globals.css and consumed by Tailwind
// via `@theme inline`. Rather than asking an admin to pick six-plus precise
// shades, they choose just two base colors (a dark "primary" and a bright
// "accent") and this module derives full, harmonious tonal scales from them.
// Pure math, no DOM/server dependencies — safe to import from a Server
// Component (root layout, to render the override <style>) or a Client
// Component (the admin settings form, for a live preview).

function isValidHex(hex: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number] = [0, 0, 0];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
}

function hexToHsl(hex: string): [number, number, number] {
  return rgbToHsl(...hexToRgb(hex));
}

function hslToHex(h: number, s: number, l: number): string {
  const normalizedH = ((h % 360) + 360) % 360;
  return rgbToHex(...hslToRgb(normalizedH, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l))));
}

export const DEFAULT_PRIMARY_COLOR = "#14161a";
export const DEFAULT_ACCENT_COLOR = "#f5a524";

const NAVY_LIGHTNESS: [string, number][] = [
  ["navy-950", 8],
  ["navy-900", 12],
  ["navy-800", 17],
  ["navy-700", 23],
  ["navy-600", 30],
  ["navy-500", 38],
];

/** Derives the navy-950..navy-500 dark scale from one base color. */
export function generateNavyScale(baseHex: string): Record<string, string> {
  const base = isValidHex(baseHex) ? baseHex : DEFAULT_PRIMARY_COLOR;
  const [h, s] = hexToHsl(base);
  const out: Record<string, string> = {};
  NAVY_LIGHTNESS.forEach(([key, lightness], i) => {
    const t = i / (NAVY_LIGHTNESS.length - 1); // 0 (950, darkest) -> 1 (500, lightest)
    const sat = Math.min(85, Math.max(10, s * (0.55 + t * 0.55)));
    out[key] = hslToHex(h, sat, lightness);
  });
  return out;
}

/** Derives the gold-600..gold-50 accent scale from one base color. */
export function generateGoldScale(baseHex: string): Record<string, string> {
  const base = isValidHex(baseHex) ? baseHex : DEFAULT_ACCENT_COLOR;
  const [h, s, l] = hexToHsl(base);
  return {
    "gold-600": hslToHex(h, Math.min(100, s + 4), Math.max(18, l - 15)),
    "gold-500": base,
    "gold-400": hslToHex(h, Math.max(35, s - 8), Math.min(88, l + 13)),
    "gold-300": hslToHex(h, Math.max(25, s - 18), Math.min(92, l + 24)),
    "gold-50": hslToHex(h, Math.max(15, s - 45), 97),
  };
}

/** Builds the `:root { ... }` override block injected into <head>. */
export function buildThemeCss(primaryHex?: string, accentHex?: string): string {
  const vars = {
    ...generateNavyScale(primaryHex || DEFAULT_PRIMARY_COLOR),
    ...generateGoldScale(accentHex || DEFAULT_ACCENT_COLOR),
  };
  const decls = Object.entries(vars)
    .map(([key, value]) => `--${key}:${value} !important;`)
    .join("");
  return `:root{${decls}}`;
}

export interface ThemePreset {
  name: string;
  primary: string;
  accent: string;
}

// Deliberately steers clear of green/emerald hues site-wide.
export const THEME_PRESETS: ThemePreset[] = [
  { name: "Sunset Orange", primary: "#14161a", accent: "#f5a524" },
  { name: "Clay & Stone", primary: "#1b1712", accent: "#b0502e" },
  { name: "Ink Navy & Gold", primary: "#0a0e1a", accent: "#d4a72c" },
  { name: "Charcoal & Copper", primary: "#17171a", accent: "#c17a4a" },
  { name: "Espresso & Champagne", primary: "#1a120b", accent: "#d9c48f" },
  { name: "Midnight & Ice Blue", primary: "#0b1020", accent: "#6fb3d9" },
  { name: "Onyx & Rose Gold", primary: "#0d0d0f", accent: "#c99383" },
  { name: "Deep Plum & Gold", primary: "#1b1024", accent: "#d4a72c" },
];
