// Generates premium, branded placeholder imagery for demo content.
//
// This project ships with demo/seed data so it works out of the box. Rather
// than hot-linking third-party stock photos (a dependency that can be
// blocked by a network/firewall, rate-limited, or simply offline — as it was
// in the environment this project was built in), we generate our own
// on-brand placeholder images locally. They use the site's navy/gold palette,
// a relevant icon, and a caption, and always render regardless of network
// conditions. Replace any of these with real photography at any time by
// uploading through the admin panel — nothing in the app depends on these
// specific files.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "demo");

const NAVY = { deep: "#0a0e1a", mid: "#10162a", light: "#202c4a" };
const GOLD = "#d4a72c";

// Simple line-art icon paths, drawn in a 100x100 box, centered later.
const ICONS = {
  plot: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <rect x="18" y="30" width="64" height="52" />
    <line x1="18" y1="46" x2="82" y2="46" />
    <line x1="42" y1="30" x2="42" y2="82" />
    <line x1="62" y1="30" x2="62" y2="82" />
    <path d="M10 30 L50 10 L90 30" />
  </g>`,
  house: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <path d="M14 46 L50 16 L86 46" />
    <path d="M22 40 V86 H78 V40" />
    <rect x="43" y="58" width="14" height="28" />
    <rect x="30" y="52" width="10" height="10" />
    <rect x="60" y="52" width="10" height="10" />
  </g>`,
  apartment: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <rect x="24" y="12" width="52" height="76" />
    <line x1="24" y1="30" x2="76" y2="30" />
    <line x1="24" y1="48" x2="76" y2="48" />
    <line x1="24" y1="66" x2="76" y2="66" />
    <line x1="40" y1="12" x2="40" y2="88" />
    <line x1="60" y1="12" x2="60" y2="88" />
  </g>`,
  farmhouse: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <path d="M14 50 L40 26 L66 50" />
    <path d="M20 46 V86 H60 V46" />
    <rect x="36" y="62" width="12" height="24" />
    <circle cx="78" cy="40" r="14" />
    <path d="M78 54 V86 M66 70 H90" />
  </g>`,
  shop: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <path d="M14 34 L20 14 H80 L86 34" />
    <path d="M14 34 V40 A10 10 0 0 0 34 40 A10 10 0 0 0 54 40 A10 10 0 0 0 74 40 A10 10 0 0 0 86 40 V34" />
    <path d="M20 40 V86 H80 V40" />
    <rect x="44" y="60" width="12" height="26" />
  </g>`,
  office: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <rect x="16" y="20" width="68" height="66" />
    <rect x="30" y="60" width="16" height="26" />
    <line x1="28" y1="34" x2="36" y2="34" /><line x1="46" y1="34" x2="54" y2="34" /><line x1="64" y1="34" x2="72" y2="34" />
    <line x1="28" y1="48" x2="36" y2="48" /><line x1="64" y1="48" x2="72" y2="48" />
  </g>`,
  crane: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <line x1="24" y1="86" x2="24" y2="16" />
    <line x1="24" y1="16" x2="82" y2="16" />
    <line x1="24" y1="30" x2="52" y2="16" />
    <line x1="70" y1="16" x2="70" y2="34" />
    <rect x="14" y="86" width="20" height="6" />
    <rect x="40" y="60" width="30" height="26" />
    <line x1="40" y1="72" x2="70" y2="72" />
  </g>`,
  plaza: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <rect x="16" y="34" width="24" height="52" />
    <rect x="44" y="14" width="24" height="72" />
    <rect x="72" y="44" width="16" height="42" />
    <line x1="20" y1="46" x2="36" y2="46" /><line x1="20" y1="58" x2="36" y2="58" /><line x1="20" y1="70" x2="36" y2="70" />
    <line x1="48" y1="26" x2="64" y2="26" /><line x1="48" y1="40" x2="64" y2="40" /><line x1="48" y1="54" x2="64" y2="54" /><line x1="48" y1="68" x2="64" y2="68" />
  </g>`,
  renovation: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <path d="M20 80 L52 48" />
    <rect x="48" y="34" width="20" height="20" rx="3" transform="rotate(45 58 44)" />
    <path d="M66 32 L82 16" />
    <circle cx="24" cy="84" r="5" />
  </g>`,
  blueprint: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <rect x="16" y="16" width="68" height="68" />
    <path d="M16 50 H84 M50 16 V84" />
    <circle cx="33" cy="33" r="6" />
    <path d="M60 60 L76 76" />
  </g>`,
  check: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <path d="M50 12 L84 24 V48 C84 68 70 82 50 88 C30 82 16 68 16 48 V24 Z" />
    <path d="M34 50 L46 62 L68 38" />
  </g>`,
  camera: `<g stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">
    <rect x="12" y="30" width="76" height="52" rx="6" />
    <path d="M34 30 L42 18 H58 L66 30" />
    <circle cx="50" cy="56" r="16" />
  </g>`,
};

// gradient color pairs (deep ink navy -> lighter navy) for variety
const GRADIENTS = [
  ["#0a0e1a", "#233150"],
  ["#0a0e1a", "#172038"],
  ["#10162a", "#2c3b5e"],
  ["#0a0e1a", "#1c2436"],
  ["#10162a", "#202c4a"],
  ["#0a0e1a", "#2b3d5c"],
];

function buildSvg({ width, height, icon, label, tag, angle, colors, badge = true }) {
  const [c1, c2] = colors;
  const iconSize = Math.min(width, height) * 0.34;
  const iconX = width / 2 - iconSize / 2;
  const iconY = height / 2 - iconSize / 2 - height * 0.03;
  const rad = (angle * Math.PI) / 180;
  const x1 = 50 - Math.cos(rad) * 50;
  const y1 = 50 - Math.sin(rad) * 50;
  const x2 = 50 + Math.cos(rad) * 50;
  const y2 = 50 + Math.sin(rad) * 50;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
        <path d="M46 0 L0 0 0 46" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />
    <circle cx="${width * 0.86}" cy="${height * 0.14}" r="${height * 0.5}" fill="${GOLD}" opacity="0.05" />
    <g transform="translate(${iconX}, ${iconY}) scale(${iconSize / 100})" opacity="0.55">
      ${icon}
    </g>
    <rect x="0" y="${height - 4}" width="${width}" height="4" fill="${GOLD}" opacity="0.85" />
    <text x="${width * 0.045}" y="${height - 42}" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(height * 0.032)}" fill="${GOLD}" letter-spacing="2" opacity="0.9">${escapeXml(tag).toUpperCase()}</text>
    <text x="${width * 0.045}" y="${height - 14}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(height * 0.045)}" font-weight="600" fill="#ffffff" opacity="0.96">${escapeXml(label)}</text>
    ${
      badge
        ? `<g transform="translate(${width - 64}, 22)" opacity="0.9">
      <circle cx="16" cy="16" r="16" fill="${GOLD}" />
      <text x="16" y="21" font-family="Georgia, serif" font-size="14" font-weight="700" fill="${NAVY.deep}" text-anchor="middle">HE</text>
    </g>`
        : ""
    }
  </svg>`;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

// Map every distinct demo image "seed" used across seed.ts / static pages
// to a filename + how it should look.
const IMAGES = [
  { seed: "plot-block-a-1", icon: "plot", tag: "Residential Plot", label: "Block A, Top City-1" },
  { seed: "plot-block-a-2", icon: "plot", tag: "Residential Plot", label: "Site View" },
  { seed: "plot-block-a-3", icon: "blueprint", tag: "Residential Plot", label: "Layout Plan" },

  { seed: "house-block-b-1", icon: "house", tag: "Luxury House", label: "Block B, Top City-1" },
  { seed: "house-block-b-2", icon: "house", tag: "Luxury House", label: "Exterior View" },
  { seed: "house-block-b-3", icon: "house", tag: "Luxury House", label: "Front Elevation" },

  { seed: "commercial-plot-1", icon: "shop", tag: "Commercial Plot", label: "B Block Commercial" },
  { seed: "commercial-plot-2", icon: "shop", tag: "Commercial Plot", label: "Boulevard Frontage" },

  { seed: "apartment-1", icon: "apartment", tag: "Apartment", label: "Top City-1 Heights" },
  { seed: "apartment-2", icon: "apartment", tag: "Apartment", label: "Interior View" },

  { seed: "farmhouse-1", icon: "farmhouse", tag: "Farmhouse", label: "Near Top City-1" },
  { seed: "farmhouse-2", icon: "farmhouse", tag: "Farmhouse", label: "Grounds & Pool" },

  { seed: "shop-1", icon: "shop", tag: "Shop", label: "Commercial Market" },
  { seed: "office-1", icon: "office", tag: "Office Space", label: "Business Center" },
  { seed: "plot-file-1", icon: "blueprint", tag: "Plot File", label: "New Block — Coming Soon" },

  { seed: "project-residency-1", icon: "house", tag: "Sandhu Residency", label: "Completed Project" },
  { seed: "project-residency-2", icon: "check", tag: "Sandhu Residency", label: "Finished Interior" },
  { seed: "project-residency-before", icon: "blueprint", tag: "Before", label: "Sandhu Residency" },
  { seed: "project-residency-after", icon: "check", tag: "After", label: "Sandhu Residency" },

  { seed: "project-plaza-1", icon: "plaza", tag: "Commercial Plaza", label: "Under Construction" },
  { seed: "project-plaza-2", icon: "crane", tag: "Commercial Plaza", label: "Construction Progress" },

  { seed: "project-villa-1", icon: "renovation", tag: "Villa Renovation", label: "Bahria Town, Rawalpindi" },
  { seed: "project-villa-before", icon: "blueprint", tag: "Before", label: "Villa Renovation" },
  { seed: "project-villa-after", icon: "check", tag: "After", label: "Villa Renovation" },

  { seed: "project-planning-1", icon: "blueprint", tag: "Planning Stage", label: "Green Valley Housing Scheme" },

  { seed: "hero-banner", icon: "house", tag: "Hassan Estates with Sandhu Builders", label: "Top City-1, Islamabad", badge: false },
  { seed: "trust-section", icon: "check", tag: "Our Promise", label: "Trusted Since Day One" },
  { seed: "about-story", icon: "house", tag: "Our Journey", label: "Building Trust in Top City-1" },
  { seed: "builders-hero", icon: "crane", tag: "Sandhu Builders", label: "Construction Excellence", badge: false },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let i = 0;
  for (const img of IMAGES) {
    const colors = GRADIENTS[i % GRADIENTS.length];
    const angle = (i * 47) % 360;
    const isWide = img.seed === "hero-banner" || img.seed === "builders-hero";
    const width = isWide ? 2000 : 1200;
    const height = isWide ? 1125 : 800;
    const svg = buildSvg({ width, height, icon: ICONS[img.icon], label: img.label, tag: img.tag, angle, colors, badge: img.badge !== false });
    const outPath = path.join(OUT_DIR, `${img.seed}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(outPath);
    console.log("generated", outPath);
    i++;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
