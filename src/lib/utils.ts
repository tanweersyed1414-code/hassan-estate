import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number | string) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!isFinite(n)) return "PKR 0";
  if (n >= 10000000) return `PKR ${(n / 10000000).toFixed(2).replace(/\.00$/, "")} Crore`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(2).replace(/\.00$/, "")} Lac`;
  return `PKR ${n.toLocaleString("en-PK")}`;
}

export function formatNumber(n: number | string) {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (!isFinite(v)) return "0";
  return v.toLocaleString("en-PK");
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PROPERTY_CATEGORY_LABELS: Record<string, string> = {
  RESIDENTIAL_PLOT: "Residential Plot",
  COMMERCIAL_PLOT: "Commercial Plot",
  HOUSE: "House",
  APARTMENT: "Apartment",
  FARMHOUSE: "Farmhouse",
  SHOP: "Shop",
  OFFICE: "Office",
  COMMERCIAL_BUILDING: "Commercial Building",
  OTHER: "Other",
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  FOR_SALE: "For Sale",
  FOR_RENT: "For Rent",
  SOLD: "Sold",
  BOOKING_OPEN: "Booking Open",
  COMING_SOON: "Coming Soon",
};

export const AREA_UNIT_LABELS: Record<string, string> = {
  MARLA: "Marla",
  KANAL: "Kanal",
  SQFT: "Sq. Ft",
  SQYD: "Sq. Yd",
  ACRE: "Acre",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  UNDER_CONSTRUCTION: "Under Construction",
  COMPLETED: "Completed",
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: "Residential Construction",
  COMMERCIAL: "Commercial Construction",
  RENOVATION: "Renovation",
  INTERIOR: "Interior Work",
  MIXED_USE: "Mixed Use",
};

export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  PROPERTY: "Property",
  CONSTRUCTION: "Construction",
  PAYMENT_PLAN: "Payment Plan",
  PROPERTY_VISIT: "Property Visit",
  GENERAL: "General",
};

export function whatsappLink(message?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923318987584";
  const text = encodeURIComponent(
    message || "Hello Hassan Estates with Sandhu Builders, I would like more information."
  );
  return `https://wa.me/${number}?text=${text}`;
}

export function telLink() {
  return `tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER || "+923318987584"}`;
}

export interface CustomSocialLink {
  label: string;
  url: string;
}

/**
 * The site_settings table only stores plain strings, so admin-added social
 * links (unlimited, arbitrary platforms) are kept as a JSON-encoded array
 * under the "custom_social_links" key. This parses that safely — malformed
 * or missing JSON just yields no extra links rather than a crash.
 */
export function parseCustomSocialLinks(raw?: string): CustomSocialLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is CustomSocialLink => !!item && typeof item.label === "string" && typeof item.url === "string")
      .filter((item) => item.label.trim() && item.url.trim());
  } catch {
    return [];
  }
}
