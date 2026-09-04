"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SingleImageField } from "./single-image-field";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  generateGoldScale,
  generateNavyScale,
  THEME_PRESETS,
} from "@/lib/theme";
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, baseFontPx, fontStack } from "@/lib/typography";

const STAT_PAIRS: { numberKey: string; labelKey: string; defaultLabel: string }[] = [
  { numberKey: "stat_properties_listed", labelKey: "stat_properties_listed_label", defaultLabel: "Properties Listed" },
  { numberKey: "stat_projects_completed", labelKey: "stat_projects_completed_label", defaultLabel: "Projects Completed" },
  { numberKey: "stat_satisfied_clients", labelKey: "stat_satisfied_clients_label", defaultLabel: "Satisfied Clients" },
  { numberKey: "stat_years_experience", labelKey: "stat_years_experience_label", defaultLabel: "Years of Experience" },
];

const OTHER_FIELDS: { key: string; label: string }[] = [
  { key: "office_hours", label: "Office Hours" },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "youtube_url", label: "YouTube URL" },
];

interface CustomSocialLink {
  label: string;
  url: string;
}

function parseInitialSocialLinks(raw?: string): CustomSocialLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l === "object") : [];
  } catch {
    return [];
  }
}

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = React.useState<Record<string, string>>(initial);
  const [socialLinks, setSocialLinks] = React.useState<CustomSocialLink[]>(() => parseInitialSocialLinks(initial.custom_social_links));
  const [saving, setSaving] = React.useState(false);

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addSocialLink() {
    setSocialLinks((links) => [...links, { label: "", url: "" }]);
  }

  function updateSocialLink(index: number, field: "label" | "url", value: string) {
    setSocialLinks((links) => links.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function removeSocialLink(index: number) {
    setSocialLinks((links) => links.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    try {
      const source = { ...values, custom_social_links: JSON.stringify(socialLinks.filter((l) => l.label.trim() || l.url.trim())) };
      const entries = Object.entries(source).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    save();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Branding */}
      <Section title="Branding" desc="Your logo, shown in the site header and footer.">
        <SingleImageField
          label="Site Logo"
          hint="Transparent PNG recommended. Applies across the public site immediately after saving."
          value={values.site_logo_url || ""}
          onChange={(url) => set("site_logo_url", url)}
        />
      </Section>

      {/* Website appearance / theme */}
      <Section
        title="Appearance"
        desc="The tone and color palette used across the entire website — hero, navigation, buttons, cards, footer, and the admin panel. Pick a preset or choose your own two colors."
      >
        <ThemeFields values={values} set={set} />
      </Section>

      {/* Typography — fonts, text size, text colour for the public site */}
      <Section
        title="Typography"
        desc="Fonts, text size and text colour for the public website. Leave any option on “Default” to keep the built-in styling. For readability, headings on dark photo and navy sections always stay light."
      >
        <TypographyFields values={values} set={set} />
      </Section>

      {/* Homepage Hero */}
      <Section title="Homepage Hero" desc="The large banner at the top of the homepage.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Heading (first line)</Label>
            <Input value={values.hero_title_main || ""} onChange={(e) => set("hero_title_main", e.target.value)} />
          </div>
          <div>
            <Label>Heading (accent line)</Label>
            <Input value={values.hero_title_accent || ""} onChange={(e) => set("hero_title_accent", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Subtitle</Label>
          <Textarea rows={2} value={values.hero_subtitle || ""} onChange={(e) => set("hero_subtitle", e.target.value)} />
        </div>
        <SingleImageField
          label="Background Image"
          value={values.hero_image || ""}
          onChange={(url) => set("hero_image", url)}
        />
        <SingleImageField
          label="Backdrop Image (behind the hero card)"
          hint="A full-width photo behind the whole white hero card — visible above/around it, fading to white toward the rest of the page. The card itself is unaffected."
          value={values.hero_card_image || ""}
          onChange={(url) => set("hero_card_image", url)}
        />
      </Section>

      {/* About page */}
      <Section title="About Page" desc="The 'Who We Are' story section on the About Us page.">
        <div>
          <Label>Story Text</Label>
          <p className="mb-1 text-xs text-gray-400 dark:text-white/40">Separate paragraphs with a blank line. Use **double asterisks** to bold a word or phrase.</p>
          <Textarea rows={6} value={values.about_body || ""} onChange={(e) => set("about_body", e.target.value)} />
        </div>
        <SingleImageField label="Story Image" value={values.about_image || ""} onChange={(url) => set("about_image", url)} />
      </Section>

      {/* Homepage About collage */}
      <Section title="Homepage About Collage" desc="The four-photo collage next to the About Us text on the homepage.">
        <div className="grid gap-4 sm:grid-cols-2">
          <SingleImageField label="Photo 1" value={values.homepage_collage_1 || ""} onChange={(url) => set("homepage_collage_1", url)} />
          <SingleImageField label="Photo 2" value={values.homepage_collage_2 || ""} onChange={(url) => set("homepage_collage_2", url)} />
          <SingleImageField label="Photo 3" value={values.homepage_collage_3 || ""} onChange={(url) => set("homepage_collage_3", url)} />
          <SingleImageField label="Photo 4 (highlighted)" value={values.homepage_collage_4 || ""} onChange={(url) => set("homepage_collage_4", url)} />
        </div>
      </Section>

      {/* Trust section (homepage) */}
      <Section title="Homepage Trust Section" desc="The 'A Name You Can Trust' section near the bottom of the homepage.">
        <div>
          <Label>Title</Label>
          <Input value={values.trust_title || ""} onChange={(e) => set("trust_title", e.target.value)} />
        </div>
        <div>
          <Label>Text</Label>
          <Textarea rows={3} value={values.trust_text || ""} onChange={(e) => set("trust_text", e.target.value)} />
        </div>
        <SingleImageField label="Image" value={values.trust_image || ""} onChange={(url) => set("trust_image", url)} />
      </Section>

      {/* Homepage call-to-action banner */}
      <Section
        title="Homepage Call-to-Action Banner"
        desc="The gold banner near the bottom of the homepage with the “Schedule a Consultation” and “Chat on WhatsApp” buttons."
      >
        <div>
          <Label>Heading</Label>
          <Input value={values.cta_title || ""} onChange={(e) => set("cta_title", e.target.value)} />
        </div>
        <div>
          <Label>Text</Label>
          <Textarea rows={2} value={values.cta_text || ""} onChange={(e) => set("cta_text", e.target.value)} />
        </div>
        <SingleImageField label="Image" value={values.cta_image || ""} onChange={(url) => set("cta_image", url)} />
      </Section>

      {/* Homepage hero trust pill */}
      <Section
        title="Homepage Hero Badge"
        desc="The small white card that floats over the hero photo — the round profile photo and its two lines of text."
      >
        <SingleImageField
          label="Profile Photo"
          hint="A head-and-shoulders photo. A background-removed PNG looks cleanest inside the circle."
          value={values.hero_pill_image || ""}
          onChange={(url) => set("hero_pill_image", url)}
        />
        <div>
          <Label>Top line</Label>
          <Input value={values.hero_pill_title || ""} onChange={(e) => set("hero_pill_title", e.target.value)} />
        </div>
        <div>
          <Label>Bottom line</Label>
          <Input value={values.hero_pill_subtitle || ""} onChange={(e) => set("hero_pill_subtitle", e.target.value)} />
        </div>
      </Section>

      {/* Builders page hero */}
      <Section title="Builders Page Hero" desc="The banner at the top of the Builders & Services page.">
        <div>
          <Label>Heading</Label>
          <Input value={values.builders_hero_title || ""} onChange={(e) => set("builders_hero_title", e.target.value)} />
        </div>
        <div>
          <Label>Subtitle</Label>
          <Textarea rows={2} value={values.builders_hero_subtitle || ""} onChange={(e) => set("builders_hero_subtitle", e.target.value)} />
        </div>
        <SingleImageField
          label="Background Image"
          value={values.builders_hero_image || ""}
          onChange={(url) => set("builders_hero_image", url)}
        />
      </Section>

      {/* Page banner backgrounds */}
      <Section
        title="Page Banner Backgrounds"
        desc="The photo behind the short title band at the top of each of these pages. Each one is labeled with the page it belongs to."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <SingleImageField
            label="Properties page banner"
            value={values.properties_hero_image || ""}
            onChange={(url) => set("properties_hero_image", url)}
          />
          <SingleImageField
            label="Projects page banner"
            value={values.projects_hero_image || ""}
            onChange={(url) => set("projects_hero_image", url)}
          />
          <SingleImageField
            label="Payment Plans page banner"
            value={values.payment_plans_hero_image || ""}
            onChange={(url) => set("payment_plans_hero_image", url)}
          />
          <SingleImageField
            label="Contact Us page banner"
            value={values.contact_hero_image || ""}
            onChange={(url) => set("contact_hero_image", url)}
          />
          <SingleImageField
            label="About page — Mission/Vision section"
            value={values.about_mission_image || ""}
            onChange={(url) => set("about_mission_image", url)}
          />
        </div>
      </Section>

      {/* Statistics */}
      <Section title="Homepage & About Statistics" desc="The animated stat counters shown on the homepage and About page — both the number and its label are editable.">
        <div className="grid gap-4 sm:grid-cols-2">
          {STAT_PAIRS.map((s) => (
            <div key={s.numberKey} className="admin-subcard space-y-3 rounded-xl p-4">
              <div>
                <Label>Number</Label>
                <Input value={values[s.numberKey] || ""} onChange={(e) => set(s.numberKey, e.target.value)} />
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  placeholder={s.defaultLabel}
                  value={values[s.labelKey] || ""}
                  onChange={(e) => set(s.labelKey, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Contact details (Contact page + footer + map) */}
      <Section
        title="Contact Information"
        desc="The address, email, and map shown on the Contact page and in the site footer."
      >
        <div>
          <Label>Office Address</Label>
          <Textarea
            rows={2}
            value={values.contact_address || ""}
            onChange={(e) => set("contact_address", e.target.value)}
            placeholder="1st Floor, Hassan Estates Office, Topcity 1 / B block commercial Market, Islamabad, 44000"
          />
        </div>
        <div>
          <Label>Contact Email</Label>
          <Input
            type="email"
            value={values.contact_email || ""}
            onChange={(e) => set("contact_email", e.target.value)}
            placeholder="info@example.com"
          />
        </div>
        <div>
          <Label>Map Location</Label>
          <p className="mb-1 text-xs text-gray-400 dark:text-white/40">
            An address, or exact <span className="font-mono">latitude,longitude</span> (right-click your pin in Google
            Maps → click the coordinates to copy). You can also paste a full Google Maps embed URL. Leave blank to use
            the office address above.
          </p>
          <Input
            value={values.contact_map_query || ""}
            onChange={(e) => set("contact_map_query", e.target.value)}
            placeholder="33.6392, 72.8397"
          />
        </div>
      </Section>

      {/* Hours & core social links */}
      <Section title="Office Hours & Social Links" desc="Your primary contact hours and the three main social platforms.">
        <div className="grid gap-4 sm:grid-cols-2">
          {OTHER_FIELDS.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input value={values[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Additional / custom social links */}
      <Section
        title="Additional Social Links"
        desc="Add any other platform — X (Twitter), TikTok, LinkedIn, Snapchat, Pinterest, and so on — with a label and URL. These appear in the footer alongside Facebook, Instagram, and YouTube."
      >
        <div className="space-y-3">
          {socialLinks.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-white/40">No additional social links yet.</p>
          )}
          {socialLinks.map((link, i) => (
            <div key={i} className="admin-subcard flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label>Platform Name</Label>
                <Input
                  placeholder="e.g. TikTok, X (Twitter), LinkedIn"
                  value={link.label}
                  onChange={(e) => updateSocialLink(i, "label", e.target.value)}
                />
              </div>
              <div className="flex-[2]">
                <Label>URL</Label>
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSocialLink(i)}
                aria-label="Remove social link"
                title="Remove social link"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSocialLink} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Social Link
          </Button>
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" disabled={saving} className="shadow-xl">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </Button>
      </div>
    </form>
  );
}

function ThemeFields({
  values,
  set,
}: {
  values: Record<string, string>;
  set: (key: string, value: string) => void;
}) {
  const primary = values.theme_primary_color || DEFAULT_PRIMARY_COLOR;
  const accent = values.theme_accent_color || DEFAULT_ACCENT_COLOR;

  const navyScale = React.useMemo(() => generateNavyScale(primary), [primary]);
  const goldScale = React.useMemo(() => generateGoldScale(accent), [accent]);

  const activePreset = THEME_PRESETS.find(
    (p) => p.primary.toLowerCase() === primary.toLowerCase() && p.accent.toLowerCase() === accent.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label>Presets</Label>
        <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const isActive = activePreset?.name === preset.name;
            return (
              <button
                type="button"
                key={preset.name}
                onClick={() => {
                  set("theme_primary_color", preset.primary);
                  set("theme_accent_color", preset.accent);
                }}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-gold-500 ring-1 ring-gold-500"
                    : "border-gray-200 hover:border-gray-300 dark:border-white/[0.06] dark:hover:border-white/25"
                }`}
              >
                <span className="flex shrink-0 -space-x-2">
                  <span className="h-6 w-6 rounded-full border-2 border-white shadow-sm dark:border-navy-900" style={{ backgroundColor: preset.primary }} />
                  <span className="h-6 w-6 rounded-full border-2 border-white shadow-sm dark:border-navy-900" style={{ backgroundColor: preset.accent }} />
                </span>
                <span className="text-xs font-medium text-navy-900 dark:text-white/80">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom pickers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Primary (Dark) Color"
          hint="Used for the header, footer, buttons, and dark section backgrounds."
          value={primary}
          onChange={(hex) => set("theme_primary_color", hex)}
        />
        <ColorField
          label="Accent Color"
          hint="Used for call-to-action buttons, highlights, and links."
          value={accent}
          onChange={(hex) => set("theme_accent_color", hex)}
        />
      </div>

      {/* Live preview */}
      <div className="admin-subcard overflow-hidden rounded-xl">
        <div className="flex items-center justify-between p-5" style={{ backgroundColor: navyScale["navy-950"] }}>
          <div>
            <p className="font-serif text-sm font-semibold" style={{ color: "#ffffff" }}>
              Hassan Estates
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              with Sandhu Builders
            </p>
          </div>
          <span
            className="rounded-full px-4 py-2 text-xs font-semibold"
            style={{ backgroundColor: goldScale["gold-500"], color: navyScale["navy-950"] }}
          >
            Explore Properties
          </span>
        </div>
        <div className="flex divide-x divide-gray-100 dark:divide-white/10">
          {[...Object.entries(navyScale), ...Object.entries(goldScale)].map(([key, hex]) => (
            <div key={key} className="flex-1">
              <div className="h-8" style={{ backgroundColor: hex }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function ColorField({
  label,
  hint,
  value,
  onChange,
  onClear,
  placeholder = "#0a0e1a",
  defaultColor,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
  /** When provided, an unset value is allowed and a "Reset to default" link is shown. */
  onClear?: () => void;
  placeholder?: string;
  /** The colour currently in effect when this field is left unset — shown in the
   *  swatch and the picker so "the present colour" is always visible. */
  defaultColor?: string;
}) {
  const isValid = HEX_RE.test(value);
  const fallback = defaultColor && HEX_RE.test(defaultColor) ? defaultColor : "#000000";
  // What the swatch + native picker display: the override if set, otherwise the
  // colour actually in use right now.
  const swatch = isValid ? value : fallback;
  const showsDefault = !value && defaultColor && HEX_RE.test(defaultColor);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        {onClear && value ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-gold-600 hover:underline dark:text-gold-300"
          >
            Reset to default
          </button>
        ) : null}
      </div>
      {hint && <p className="mb-1 text-xs text-gray-400 dark:text-white/40">{hint}</p>}
      <div className="flex items-center gap-2.5">
        <label
          className="relative h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-white/15"
          style={{ backgroundColor: swatch }}
          title={showsDefault ? `Current colour ${swatch.toUpperCase()} — click to override` : "Click to change colour"}
        >
          <input
            type="color"
            value={swatch}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 p-0"
            aria-label={label}
          />
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={showsDefault ? `${defaultColor!.toUpperCase()} · current` : placeholder}
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>
      {showsDefault ? (
        <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
          Using the theme colour{" "}
          <span className="font-mono uppercase">{defaultColor}</span>. Click the swatch or type a hex to override.
        </p>
      ) : null}
    </div>
  );
}

function TypographyFields({
  values,
  set,
}: {
  values: Record<string, string>;
  set: (key: string, value: string) => void;
}) {
  const headingStack = fontStack(values.type_heading_font) ?? "var(--font-jakarta)";
  const bodyStack = fontStack(values.type_body_font) ?? "var(--font-inter)";
  const px = baseFontPx(values.type_base_size);

  // The colours actually in effect right now (driven by the Appearance theme),
  // so each picker's swatch shows the present colour when left unset.
  const navy = generateNavyScale(values.theme_primary_color || DEFAULT_PRIMARY_COLOR);
  const gold = generateGoldScale(values.theme_accent_color || DEFAULT_ACCENT_COLOR);
  const currentColor = {
    bodyLight: "#14161a",
    bodyDark: "#f0f1f3",
    headingLight: navy["navy-950"],
    headingDark: "#ffffff",
    accentLight: gold["gold-500"],
    accentDark: gold["gold-500"],
  };

  return (
    <div className="space-y-6">
      {/* Font families */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Heading Font</Label>
          <p className="mb-1 text-xs text-gray-400 dark:text-white/40">Used for every heading and display figure.</p>
          <Select
            value={values.type_heading_font || ""}
            onChange={(e) => set("type_heading_font", e.target.value)}
          >
            <option value="">Default (Plus Jakarta Sans)</option>
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
                {f.type === "serif" ? " — serif" : ""}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Body Font</Label>
          <p className="mb-1 text-xs text-gray-400 dark:text-white/40">Used for paragraphs, labels, buttons and UI text.</p>
          <Select
            value={values.type_body_font || ""}
            onChange={(e) => set("type_body_font", e.target.value)}
          >
            <option value="">Default (Inter)</option>
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
                {f.type === "serif" ? " — serif" : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Base text size */}
      <div className="sm:max-w-[280px]">
        <Label>Base Text Size</Label>
        <p className="mb-1 text-xs text-gray-400 dark:text-white/40">Scales all text on the site proportionally.</p>
        <Select
          value={values.type_base_size || "base"}
          onChange={(e) => set("type_base_size", e.target.value)}
        >
          {FONT_SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({o.px}px){o.px === 16 ? " — default" : ""}
            </option>
          ))}
        </Select>
      </div>

      {/* Text colours */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Body Text — Light Mode"
          value={values.type_body_color_light || ""}
          defaultColor={currentColor.bodyLight}
          onChange={(hex) => set("type_body_color_light", hex)}
          onClear={() => set("type_body_color_light", "")}
        />
        <ColorField
          label="Body Text — Dark Mode"
          value={values.type_body_color_dark || ""}
          defaultColor={currentColor.bodyDark}
          onChange={(hex) => set("type_body_color_dark", hex)}
          onClear={() => set("type_body_color_dark", "")}
        />
        <ColorField
          label="Headings — Light Mode"
          value={values.type_heading_color_light || ""}
          defaultColor={currentColor.headingLight}
          onChange={(hex) => set("type_heading_color_light", hex)}
          onClear={() => set("type_heading_color_light", "")}
        />
        <ColorField
          label="Headings — Dark Mode"
          value={values.type_heading_color_dark || ""}
          defaultColor={currentColor.headingDark}
          onChange={(hex) => set("type_heading_color_dark", hex)}
          onClear={() => set("type_heading_color_dark", "")}
        />
        <ColorField
          label="Accent / Highlight Words — Light Mode"
          hint="The gold highlighted words in headings, the small uppercase section labels, and the large stat figures."
          value={values.type_accent_color_light || ""}
          defaultColor={currentColor.accentLight}
          onChange={(hex) => set("type_accent_color_light", hex)}
          onClear={() => set("type_accent_color_light", "")}
        />
        <ColorField
          label="Accent / Highlight Words — Dark Mode"
          value={values.type_accent_color_dark || ""}
          defaultColor={currentColor.accentDark}
          onChange={(hex) => set("type_accent_color_dark", hex)}
          onClear={() => set("type_accent_color_dark", "")}
        />
      </div>

      {/* Live preview */}
      <div>
        <Label>Preview</Label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <TypePreview
            mode="light"
            headingFont={headingStack}
            bodyFont={bodyStack}
            px={px}
            headingColor={values.type_heading_color_light || currentColor.headingLight}
            bodyColor={values.type_body_color_light || "#3f4650"}
            accentColor={values.type_accent_color_light || currentColor.accentLight}
          />
          <TypePreview
            mode="dark"
            headingFont={headingStack}
            bodyFont={bodyStack}
            px={px}
            headingColor={values.type_heading_color_dark || currentColor.headingDark}
            bodyColor={values.type_body_color_dark || "rgba(255,255,255,0.6)"}
            accentColor={values.type_accent_color_dark || currentColor.accentDark}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400 dark:text-white/40">
          Approximate — heading sizes vary from section to section on the live site.
        </p>
      </div>
    </div>
  );
}

function TypePreview({
  mode,
  headingFont,
  bodyFont,
  px,
  headingColor,
  bodyColor,
  accentColor,
}: {
  mode: "light" | "dark";
  headingFont: string;
  bodyFont: string;
  px: number;
  headingColor: string;
  bodyColor: string;
  accentColor: string;
}) {
  const dark = mode === "dark";
  return (
    <div
      className="overflow-hidden rounded-xl border p-5"
      style={{
        backgroundColor: dark ? "#16181c" : "#ffffff",
        borderColor: dark ? "rgba(255,255,255,0.1)" : "#eef0f3",
      }}
    >
      <p
        style={{
          fontFamily: bodyFont,
          fontSize: px * 0.7,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: accentColor,
        }}
      >
        Why Search With Us
      </p>
      <h3
        style={{
          fontFamily: headingFont,
          fontSize: px * 1.75,
          fontWeight: 800,
          lineHeight: 1.15,
          marginTop: 8,
          color: headingColor,
        }}
      >
        Everything You Need, <span style={{ color: accentColor }}>Verified</span>
      </h3>
      <p style={{ fontFamily: bodyFont, fontSize: px * 0.95, marginTop: 8, color: bodyColor }}>
        Clear listings, honest pricing, and construction capability — no guesswork across Top City-1.
      </p>
      <span
        style={{
          display: "inline-block",
          marginTop: 14,
          borderRadius: 999,
          backgroundColor: "#f5a524",
          color: "#14161a",
          fontFamily: bodyFont,
          fontSize: px * 0.8,
          fontWeight: 600,
          padding: "6px 14px",
        }}
      >
        Explore Properties
      </span>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="admin-card space-y-4 rounded-2xl p-6">
      <div>
        <h2 className="font-serif-brand text-base font-medium text-navy-950 dark:text-white">{title}</h2>
        {desc && <p className="mt-0.5 text-sm text-gray-500 dark:text-white/50">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
