import type { Metadata } from "next";
import { getSiteSettingsMap } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hassan Estates with Sandhu Builders collects, uses and protects your personal information.",
};

export const revalidate = 3600;

export default async function PrivacyPage() {
  const settings = await getSiteSettingsMap();
  const email = settings.contact_email || "info@hassanestates.pk";
  const address = settings.contact_address || "Top City-1, B Block Commercial, Islamabad, Pakistan";
  const updated = "September 2026";

  return (
    <div className="pt-28 pb-24">
      <div className="section-container max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-1 font-serif-brand text-3xl font-medium text-navy-950 dark:text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-400 dark:text-white/40">Last updated: {updated}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-white/65">
          <p>
            This policy explains what personal information Hassan Estates with Sandhu Builders (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;) collects through this website, why we collect it, and the choices you have. By using the
            site or contacting us through it, you agree to this policy.
          </p>

          <Section title="Information we collect">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-navy-900 dark:text-white/85">Details you submit in a form</strong> — your name,
                phone number, email address and any message when you send an inquiry, book a property visit, or use the
                contact form.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">Google account information</strong> — if you choose
                &ldquo;Sign in with Google&rdquo; to book a property visit, we receive your name, email address and
                profile picture from Google. We do not receive your Google password or any other data from your account.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">Visit and inquiry records</strong> — the property,
                date, time slot and notes associated with a request you make.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">A sign-in cookie</strong> — a single secure cookie
                that keeps you logged in after you sign in with Google. The site does not use advertising or analytics
                tracking cookies.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">Aggregate page-view counts</strong> — we record which
                pages are viewed so we can see what content is popular. This uses no cookies. To count unique daily
                visitors, we store a one-way code derived from your IP address and browser for that day only; it cannot
                be traced back to you and is not linked across days.
              </li>
            </ul>
          </Section>

          <Section title="How we use it">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>To respond to your inquiries and arrange property visits.</li>
              <li>To email you when the status of a visit you booked changes (confirmed, cancelled or completed).</li>
              <li>To keep a record of our communication with you and to improve our service.</li>
            </ul>
            <p>We do not sell or rent your personal information to anyone.</p>
          </Section>

          <Section title="Who we share it with">
            <p>
              We use trusted service providers to run the website. They process data only on our instructions:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-navy-900 dark:text-white/85">Vercel</strong> — website hosting.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">Neon</strong> — database where form submissions are
                stored.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">Cloudinary</strong> — image hosting.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">Resend</strong> — sends the visit status emails.
              </li>
              <li>
                <strong className="text-navy-900 dark:text-white/85">Google</strong> — provides the optional
                &ldquo;Sign in with Google&rdquo; feature.
              </li>
            </ul>
            <p>
              Some of these providers store data on servers outside Pakistan. We may also disclose information if
              required by law.
            </p>
          </Section>

          <Section title="How long we keep it">
            <p>
              We keep inquiry and visit records for as long as needed to serve you and for our normal business records,
              after which they are deleted. You can ask us to delete your information at any time (see below).
            </p>
          </Section>

          <Section title="Your choices">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>You can ask us for a copy of the information we hold about you, or ask us to correct or delete it.</li>
              <li>You can stop the visit status emails by asking us, or by not booking further visits.</li>
              <li>
                You can disconnect this site from your Google account at any time in your Google Account &rarr; Security
                &rarr; Third-party access.
              </li>
            </ul>
          </Section>

          <Section title="Contact us">
            <p>
              For any privacy request or question, contact us at{" "}
              <a href={`mailto:${email}`} className="font-medium text-gold-600 hover:underline dark:text-gold-400">
                {email}
              </a>{" "}
              or visit our office at {address}.
            </p>
          </Section>

          <p className="text-xs text-gray-400 dark:text-white/40">
            We may update this policy from time to time. Material changes will be reflected by the &ldquo;last
            updated&rdquo; date above.
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
