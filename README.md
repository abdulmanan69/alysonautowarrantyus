# Alyson Auto Warranty — website and admin panel

The public website for alysonautowarrantyus.com (extended auto warranty / vehicle service contracts), its quote funnel, blog and the admin panel the team works in. One Docker Compose stack, built for Coolify.

Built with Next.js 15, TypeScript, Tailwind CSS, Prisma and PostgreSQL.

## What's included

**Public website** (yellow/black brand, Funnel Display type, mobile first)
- Home: photo hero with the short quote form, headline numbers, services, about, plans, how it works, interactive repair-cost diagram, interactive "vehicles we protect" showcase, reasons, reviews, latest posts, FAQ, call to action.
- Protected plans overview with comparison table, and a page per plan (Platinum, Gold, Powertrain, Prepaid Maintenance), all editable in the admin.
- Why Alyson, Benefits, Claims, Repair costs, FAQ, About, Contact (form + map).
- Four-step quote form with vehicle lookup (NHTSA), saved progress, TCPA consent record, duplicate protection, anti-bot checks and rate limits.
- Blog with categories, tags, featured post, RSS, author profiles and share buttons; custom pages built in the admin.
- Privacy Policy, Terms and "Do Not Sell or Share" request form (Global Privacy Control honored).
- SEO: per-page titles/descriptions, canonical URLs, Open Graph share images generated from a template, JSON-LD (Organization, WebSite, Service, FAQ, HowTo, Breadcrumbs, BlogPosting), sitemap, robots, llms.txt, IndexNow, redirects from the old .php addresses.
- Security headers (CSP, HSTS…), analytics only when configured, ad tracking switched off for opted-out visitors.

**Admin panel** (`/admin`)
- Roles: owner, admin, agent (quote requests and messages), writer (blog). Password + optional two-factor (TOTP), lockouts, session list, audit log of everything.
- Dashboard with KPIs, daily chart, status breakdown, follow-ups and new messages.
- Quote requests: search, filters, assignment, notes, follow-up tasks, status pipeline (new → contacted → quoted → sold / lost / unqualified), consent proof, attribution, CSV export.
- Messages inbox for the contact form.
- Plans editor, homepage & page content editor, pages (rich editor), menus, legal documents, privacy requests and do-not-contact list.
- Settings: business details, alerts (email / SMS / Slack-Teams webhook), analytics IDs, search engine verification, IndexNow, AI crawler rules, share-image preview.
- API keys with scopes (blog, content, leads) for integrations; command-line client in `scripts/api-client.mjs`.
- System health page that lists what still needs attention.

## Run it locally

Requires Node.js 20+ and Docker (for the local PostgreSQL database).

```bash
npm install
cp .env.example .env        # then edit ADMIN_PASSWORD and OG_SECRET
npm run db:up               # starts PostgreSQL on localhost:5432
npm run db:deploy           # creates the tables
npm run dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin (login from ADMIN_USER / ADMIN_PASSWORD; the first sign-in creates the owner account).

**Production:** see [DEPLOY.md](DEPLOY.md) (Docker Compose on Coolify: app + PostgreSQL + backups, one `SITE_URL` variable to set).

## Where things are

```
prisma/schema.prisma                 Database tables
src/lib/site.ts                      Built-in business defaults (overridden in Admin → Settings)
src/lib/settings.ts                  Every editable setting and its default text
src/lib/plans.ts                     Default protection plans (seeded on first run)
src/lib/validation.ts                Quote, homepage and contact form rules (shared client + server)
src/lib/auth.ts, admin-guard.ts      Roles, passwords, two-factor, sessions
src/lib/api-keys.ts, api.ts          API keys, scopes and helpers for /api/v1
src/components/QuoteForm.tsx         The four-step quote form
src/components/HeroQuoteForm.tsx     The short homepage form
src/components/sections.tsx          Page sections (hero, plans, reasons, FAQ, call to action…)
src/components/VehicleShowcase.tsx   Mouse-interactive "vehicles we protect" section
src/app/(site)/                      Public pages
src/app/admin/                       Admin panel
src/app/api/                         Public form endpoints, admin endpoints and /api/v1
scripts/process-images.mjs           Rebuilds optimized images from assets-src/ (npm run images)
scripts/api-client.mjs               Command-line client for the API (npm run api -- --help)
```

## Images

Originals live in `assets-src/` (logo, hero photos, vehicle cut-outs, part icons). `npm run images` converts them to sized WebP files in `public/` and regenerates the favicon and app icons. Drop a new photo into the matching folder and run it again.

## Must be done by the client (not code)

- **Consent text** (Settings → Business details) approved by a lawyer (TCPA). The version number changes automatically whenever the text changes.
- **Privacy Policy and Terms** reviewed by an attorney (Admin → Legal & privacy), then tick "Reviewed by our attorney".
- **Plan wording** checked against the actual contracts; the contract always controls.
- **Reviews**: replace the example reviews with real ones.
- **Data security** program appropriate for the business.

## Credits

Designed and developed by [Abdul Manan](https://github.com/abdulmanan69).
