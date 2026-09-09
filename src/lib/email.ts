/**
 * Transactional email via Resend's REST API (https://resend.com).
 *
 * Set RESEND_API_KEY to enable. Without it, sends are skipped (logged) so the
 * rest of the app keeps working. VISIT_FROM_EMAIL sets the sender once you've
 * verified your domain in Resend; until then Resend's shared test sender is used.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set — skipped email to ${opts.to}: "${opts.subject}"`);
    return { sent: false as const, reason: "not-configured" };
  }

  const from = process.env.VISIT_FROM_EMAIL || "Hassan Estates <onboarding@resend.dev>";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[email] Resend error ${res.status}: ${text}`);
      return { sent: false as const, reason: `resend-${res.status}` };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { sent: false as const, reason: "exception" };
  }
}

const STATUS_COPY: Record<string, { heading: string; line: string; accent: string }> = {
  CONFIRMED: {
    heading: "Your visit is confirmed",
    line: "Our team has confirmed your property visit. Details below — please arrive on time.",
    accent: "#16a34a",
  },
  CANCELLED: {
    heading: "Your visit was cancelled",
    line: "Unfortunately this visit slot can't go ahead. You're welcome to book another time.",
    accent: "#dc2626",
  },
  COMPLETED: {
    heading: "Thanks for visiting",
    line: "Your property visit is marked complete. We hope it was helpful — reach out any time with questions.",
    accent: "#2563eb",
  },
};

export async function sendVisitStatusEmail(input: {
  to: string;
  visitorName: string;
  propertyTitle: string;
  dateLabel: string;
  timeLabel: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  adminNote?: string;
}) {
  const copy = STATUS_COPY[input.status];
  const myVisits = `${siteUrl()}/my-visits`;
  const name = input.visitorName ? input.visitorName.split(" ")[0] : "there";

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a1a1aa;margin:0 0 4px;">Hassan Estates with Sandhu Builders</p>
      <div style="background:#fff;border:1px solid #e4e4e7;border-radius:14px;padding:28px;">
        <div style="height:4px;width:44px;background:${copy.accent};border-radius:2px;margin-bottom:18px;"></div>
        <h1 style="font-size:20px;margin:0 0 10px;">${copy.heading}</h1>
        <p style="margin:0 0 18px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${escapeHtml(name)}, ${copy.line}</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#71717a;width:110px;">Property</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(input.propertyTitle)}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;">Date</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(input.dateLabel)}</td></tr>
          ${input.timeLabel ? `<tr><td style="padding:6px 0;color:#71717a;">Time</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(input.timeLabel)}</td></tr>` : ""}
        </table>
        ${
          input.adminNote
            ? `<div style="margin-top:16px;padding:12px 14px;background:#faf7ef;border:1px solid #f0e6cf;border-radius:10px;font-size:14px;color:#3f3f46;"><strong style="display:block;margin-bottom:4px;color:#18181b;">Note from our team</strong>${escapeHtml(input.adminNote)}</div>`
            : ""
        }
        <a href="${myVisits}" style="display:inline-block;margin-top:22px;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:999px;">View my visits</a>
      </div>
      <p style="font-size:12px;color:#a1a1aa;margin:18px 0 0;">You're receiving this because you booked a property visit at ${siteUrl().replace(/^https?:\/\//, "")}.</p>
    </div>
  </body>
</html>`;

  return sendEmail({
    to: input.to,
    subject: `${copy.heading} — ${input.propertyTitle}`,
    html,
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
