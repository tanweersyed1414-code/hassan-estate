import { db, schema } from "@/db";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const rows = await db.select().from(schema.siteSettings);
  const initial: Record<string, string> = {};
  for (const row of rows) initial[row.key] = row.value;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Website Content & Settings</h1>
        <p className="text-sm text-gray-500 dark:text-white/50">Edit the logo, homepage/about/builders text and images, statistics, and social links shown on the public site — changes go live immediately after saving.</p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
