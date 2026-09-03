# Hassan Estates with Sandhu Builders

A full-stack real estate & construction business platform for **Hassan Estates with Sandhu Builders** (Top City-1, Islamabad). Public marketing site + property/project catalog + lead capture, backed by a secure admin panel for managing every piece of content — no hardcoded data.

- **Public site:** property listings & search, construction project portfolio, payment plans + installment calculator, inquiry & visit-booking forms, an AI assistant ("Hassan AI Assistant") that only answers from real site data, full SEO.
- **Admin panel** (`/admin`): role-based (Super Admin / Admin / Editor) CRUD for properties, construction projects, payment plans, inquiries, visits, AI knowledge base, users, and site settings.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 + hand-built Radix UI components (shadcn-style) |
| Animation | Framer Motion (respects `prefers-reduced-motion`) |
| Database | PostgreSQL |
| ORM | **Drizzle ORM** (see note below) |
| Auth | NextAuth v5 (Credentials + JWT sessions, bcrypt password hashing) |
| Validation | Zod on every API route |
| AI Assistant | OpenAI API if configured, otherwise a deterministic, database-grounded fallback |
| File uploads | Local disk by default, Cloudinary if configured |
| Deployment target | Vercel (or any Node host) |

### A note on two substitutions made from the original spec

1. **Prisma → Drizzle ORM.** The original spec called for Prisma. Prisma's engine binaries are fetched from `binaries.prisma.sh` at install time; in the sandboxed environment this project was built in, that host was blocked by network policy, which made Prisma impossible to install at all. Drizzle ORM was substituted — it's a first-class TypeScript ORM with no native binary dependency (it talks to Postgres via the pure-JS `postgres` package), and it fulfils every requirement from the spec (typed schema, migrations, relations). If you specifically need Prisma, the schema in `src/db/schema.ts` is a straightforward one-to-one port to a `schema.prisma` file — every table, enum, and relation is already spelled out for you.
2. **Google Fonts → system font stack.** For the same network-policy reason, `fonts.googleapis.com` was unreachable during the build, which made `next/font/google` fail the production build outright. The site now uses curated system font stacks (`ui-sans-serif, -apple-system, "Segoe UI", ...` for body text and a serif stack led by Georgia/Palatino for headings), which look clean, load with **zero** extra network requests, and are a genuine improvement for Core Web Vitals. If you'd like the original Inter/Playfair Display look, see "Re-enabling Google Fonts" below — it's a 5-minute change in an environment with normal internet access.

Neither substitution affects functionality, security, or the data model — they were forced by the build sandbox, not by the app's design.

### Demo images

The seeded demo properties/projects use **locally generated, on-brand placeholder images** (navy/gold gradients with a category icon and caption — see `scripts/generate-placeholders.mjs`), not third-party stock photos. This means the demo looks complete and loads instantly on first run, with no dependency on any external image host. Replace them with real photography any time via the admin panel's image uploader — nothing in the code depends on these specific files.

---

## 2. Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local install, or a hosted instance like Neon/Supabase/RDS)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env — at minimum set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)

# 3. Create the database schema
npm run db:push

# 4. Seed demo data (admin user, sample properties/projects/payment plans/AI knowledge base)
npm run db:seed

# 5. Run the dev server
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` for the admin panel.

**Demo admin login** (from the seed script, change immediately in production):
- Email: `admin@hassanestates.pk`
- Password: `ChangeMe!123`
- Role: Super Admin (full access)

A second demo account (`editor@hassanestates.pk` / `EditorPass123!`) is seeded with the **Editor** role to demonstrate role-based restrictions.

### Environment variables

See `.env.example` for the full list with inline explanations. Required: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`. Everything else (OpenAI key, Cloudinary, Google Maps key) is optional — the app degrades gracefully without them:
- No `OPENAI_API_KEY` → the AI assistant uses its rule-based, database-grounded responder (still fully functional, still never invents information).
- No Cloudinary keys → uploaded images are stored on local disk under `public/uploads` (fine for a single server; see "Deployment notes" for serverless platforms).
- No Google Maps key → property location maps render as a keyless embed.

---

## 3. Project structure

```
src/
  app/
    (site)/            Public pages (home, properties, builders, projects, payment-plans, about, contact)
    admin/              Admin panel (login + role-protected dashboard)
    api/                Route handlers (properties, projects, inquiries, visits, chat, uploads, etc.)
    sitemap.ts, robots.ts, opengraph-image.tsx
  components/
    ui/                 Hand-built Radix + Tailwind primitives (button, card, dialog, etc.)
    site/               Public-facing components (navbar, hero, property/project cards, chat widget, forms)
    admin/              Admin-only components (forms, image uploader, tables)
  db/
    schema.ts           Full Drizzle schema (tables, enums, relations, types)
    seed.ts              Demo data seed script
  lib/
    queries.ts           Public-facing DB reads
    ai.ts                 AI assistant logic (context building + rule-based fallback)
    validations.ts        Zod schemas
    storage.ts             Upload handling + validation
    rate-limit.ts, require-admin.ts, utils.ts
  auth.ts               NextAuth configuration
  proxy.ts              Next.js 16 middleware (auth gate + security headers)
scripts/
  generate-placeholders.mjs   Regenerates the local demo images
  screenshot.mjs               Playwright visual-QA screenshot script
drizzle/                Generated SQL migrations
```

---

## 4. Database & admin

### Schema

Fifteen tables covering users/roles, properties, property images/features, payment plans/installments, construction projects, project images/features, inquiries, property visits, AI knowledge base, site settings, and media files — see `src/db/schema.ts` for the full definitions (columns, enums, foreign keys, indexes).

### Roles

| Role | Access |
|---|---|
| **Super Admin** | Everything, including user management and site settings |
| **Admin** | Properties, projects, inquiries, visits, payment plans, AI knowledge base |
| **Editor** | Add/edit properties & projects, manage content — cannot delete critical records, manage users, or change system settings |

### Useful commands

```bash
npm run db:push      # push schema changes to the database (development)
npm run db:generate  # generate a SQL migration from schema changes
npm run db:migrate   # apply generated migrations (production)
npm run db:seed      # (re-)seed demo data
npm run db:studio    # open Drizzle Studio to browse data
```

---

## 5. The AI Assistant ("Hassan AI Assistant")

Design goal from the spec: **never invent** availability, prices, payment terms, or policies.

- Every user message is classified by intent (property search, payment plans, construction/builder services, contact, general) and turned into keywords.
- The assistant queries the **live database** (properties, projects, payment plans, and an admin-managed knowledge base) for relevant, real matches before saying anything.
- If `OPENAI_API_KEY` is set, that retrieved context is handed to OpenAI with a strict system prompt instructing it to answer only from the provided context.
- If no API key is set (or the call fails), a deterministic rule-based responder answers from the same retrieved context — so the assistant is fully functional out of the box with no external API dependency.
- If nothing relevant is found in the database, it replies with the exact required fallback:
  > "Our team will confirm the latest information for you. Would you like to contact Hassan Estates with Sandhu Builders directly?"

  along with quick-action buttons (Find a Property / Explore Payment Plans / Construction Services / Contact Us).
- Admins manage what the assistant can say via **Admin → AI Knowledge Base** (categories: Company, Properties, Construction, Payment, FAQ, Policies), including activating/deactivating individual entries.

---

## 6. Security

- Passwords hashed with bcrypt (12 rounds); JWT sessions via NextAuth with secure/httpOnly cookies (`__Secure-` prefix in production).
- Role-based access enforced in `src/proxy.ts` (route-level) and `src/lib/require-admin.ts` (API-level).
- Zod validation on every API route; parameterized queries throughout (Drizzle) — no raw SQL string interpolation.
- In-memory rate limiting on login and public write endpoints (`src/lib/rate-limit.ts`) — swap for a Redis-backed limiter (e.g. Upstash) if you deploy multiple instances, since in-memory state doesn't share across processes.
- Upload validation checks actual file bytes via magic-byte signature detection (not just the client-supplied MIME type/extension), enforces a size cap, and rejects anything that isn't an allow-listed image format.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS) and a Content-Security-Policy are set in `next.config.ts` / `src/proxy.ts`.
- All secrets are read from environment variables only — nothing is committed or exposed to the client bundle (`NEXT_PUBLIC_*` vars are, by design, the only ones that reach the browser, and they contain no secrets).

---

## 7. SEO & performance

- Per-page metadata (title templates, descriptions, Open Graph/Twitter cards), a dynamically generated OG image (`src/app/opengraph-image.tsx`), `sitemap.ts` (includes every property/project slug), and `robots.ts`.
- JSON-LD structured data: `RealEstateAgent` (site-wide) and `RealEstateListing` (per property).
- Metadata and copy target the spec's key search phrases (Real Estate Top City Islamabad, Plots for Sale Top City-1, Property Dealer Top City Islamabad, Sandhu Builders Islamabad, House Construction Islamabad, etc.).
- Images use `next/image` (automatic optimization, lazy loading, responsive `sizes`); fonts are system stacks (zero extra network requests); Turbopack production build with route-level code splitting.

---

## 8. Deployment (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket and import it into Vercel.
2. Set the environment variables from `.env.example` in the Vercel project settings (a managed Postgres — Vercel Postgres, Neon, or Supabase — is the easiest `DATABASE_URL` source).
3. Run `npm run db:push` (or `db:migrate` if you've generated migrations) against the production database once, then `npm run db:seed` if you want the demo content.
4. **Local file uploads and serverless:** by default, uploaded images are written to `public/uploads` on local disk. Vercel's serverless functions have an ephemeral, read-only-at-runtime filesystem outside of `/tmp`, so local-disk uploads **will not persist** in that environment. For a Vercel deployment, set the `CLOUDINARY_*` environment variables — the upload code automatically switches to Cloudinary when they're present, and no other change is needed. (If you deploy instead to a traditional always-on Node server/VM, local disk storage works fine as-is.)
5. Deploy. `next build` runs the production build; `next start` (or Vercel's own runtime) serves it.

### Re-enabling Google Fonts (optional)

If you deploy in an environment with normal access to `fonts.googleapis.com` and want the original Inter/Playfair Display pairing:

```tsx
// src/app/layout.tsx
import { Inter, Playfair_Display } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
// add both variables to the <body> className
```
and in `src/app/globals.css` change `--font-sans` / `--font-serif` back to `var(--font-inter)` / `var(--font-playfair)`.

---

## 9. Regenerating demo images

If you want to change the look of the placeholder demo imagery (colors, icons, captions) before adding your own real photos:

```bash
node scripts/generate-placeholders.mjs
```

This regenerates every file under `public/demo/`. Edit the `IMAGES` array or the `ICONS`/`GRADIENTS` constants at the top of `scripts/generate-placeholders.mjs` to change captions, icons, or the color palette.

---

## 10. Visual QA

`scripts/screenshot.mjs` drives a headless Chromium (Playwright) through the key pages and saves screenshots to `/tmp/screenshots` — useful for a quick visual regression check after changes:

```bash
node scripts/screenshot.mjs
```

Note: pages use Framer Motion scroll-triggered reveal animations; the script scrolls through each page before capturing so that content isn't caught mid-animation in a full-page screenshot.

---

## 11. What's manageable from the admin panel

Per the project's core requirement, **no business content is hardcoded** — everything below is created via the seed script only as a starting example and can be fully added/edited/deleted from `/admin`:

- Properties (all fields, multiple images with reordering/featured selection, video URL, status, payment plan)
- Construction projects (gallery + before/after images, video, status)
- Payment plans & installment terms
- Inquiries and property visit requests (with status workflow and internal notes)
- AI knowledge base entries (with category and active/inactive toggle)
- Site settings (homepage statistics, office hours, social links)
- Admin users and their roles (Super Admin only)
