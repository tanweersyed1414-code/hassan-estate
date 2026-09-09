import type { Metadata } from "next";
import { getSiteSettingsMap } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you use the Hassan Estates with Sandhu Builders website.",
};

export const revalidate = 3600;

export default async function TermsPage() {
  const settings = await getSiteSettingsMap();
  const email = settings.contact_email || "info@hassanestates.pk";
  const updated = "September 2026";

  return (
    <div className="pt-28 pb-24">
      <div className="section-container max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-1 font-serif-brand text-3xl font-medium text-navy-950 dark:text-white sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-gray-400 dark:text-white/40">Last updated: {updated}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-white/65">
          <p>
            These terms apply to your use of the Hassan Estates with Sandhu Builders website. By using the site you
            accept them.
          </p>

          <Section title="Property information">
            <p>
              Listings, prices, payment plans, areas, images and project details are provided for general information
              and can change without notice. They are not an offer or a contract. Always confirm the current details
              and availability with our team before making any decision or payment.
            </p>
          </Section>

          <Section title="Inquiries and visit bookings">
            <p>
              Submitting an inquiry or a visit request does not create a confirmed appointment. A visit is only
              confirmed when our team marks it as confirmed and you receive that confirmation. We may reschedule or
              cancel a visit and will let you know if we do.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>
              Do not use the site to submit false information, to attempt to disrupt or gain unauthorised access to it,
              or for any unlawful purpose. We may remove content or restrict access if these terms are misused.
            </p>
          </Section>

          <Section title="Third-party links and services">
            <p>
              The site may link to third-party services (such as Google Maps or WhatsApp). We are not responsible for
              the content or practices of those services.
            </p>
          </Section>

          <Section title="Liability">
            <p>
              The site is provided &ldquo;as is&rdquo;. To the extent permitted by law, we are not liable for any loss
              arising from reliance on information on the site or from its temporary unavailability.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms:{" "}
              <a href={`mailto:${email}`} className="font-medium text-gold-600 hover:underline dark:text-gold-400">
                {email}
              </a>
              .
            </p>
          </Section>

          <p className="text-xs text-gray-400 dark:text-white/40">
            We may update these terms from time to time; the &ldquo;last updated&rdquo; date above shows the latest
            version.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}
