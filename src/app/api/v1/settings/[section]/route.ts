import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-keys";
import { audit } from "@/lib/audit";
import { sanitizePostHtml } from "@/lib/blog";
import { apiError, json, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { DEFAULT_PRIVACY_HTML, DEFAULT_TERMS_HTML } from "@/lib/legal-templates";
import { cleanNavigation } from "@/lib/menus";
import { getSettings, saveSetting, type ContentSettings, type LegalSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Site settings that the admin edits in Menus, Legal & privacy, Content and Settings, readable with
// a "content" key and changeable with one that may publish. Every change is checked the same way
// the admin forms check it and is written to the activity log.
//   GET  /api/v1/settings/navigation   header + footer menus
//   PUT  /api/v1/settings/navigation   the whole menu object (same shape as GET)
//   GET  /api/v1/settings/legal        privacy policy and terms (HTML) + dates
//   PATCH /api/v1/settings/legal       { privacyHtml?, termsHtml?, reset?: "privacy" | "terms" | "both" }
//   GET  /api/v1/settings/content      homepage and page copy
//   PATCH /api/v1/settings/content     any of { hero, stats, about, services, process, whyIntro, reasons, benefitsIntro, claims, faqs }
//   GET  /api/v1/settings/business     phone, email, address, hours (read only; change in the admin)

type Ctx = { params: Promise<{ section: string }> };
const SECTIONS = ["navigation", "legal", "content", "business"] as const;
type Section = (typeof SECTIONS)[number];

const text = (v: unknown, max: number) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
const strList = (v: unknown, max: number, each: number) => (Array.isArray(v) ? v.map((s) => text(s, each)).filter(Boolean).slice(0, max) : null);
const today = () => new Date().toISOString().slice(0, 10);

async function caller(req: Request, write: boolean) {
  const c = await authenticateApiKey(req, "content");
  if (c instanceof NextResponse) return c;
  if (write && !c.canPublish) return apiError(403, "Only a key that may publish can change site settings");
  return c;
}

async function section(ctx: Ctx): Promise<Section | null> {
  const s = (await ctx.params).section;
  return (SECTIONS as readonly string[]).includes(s) ? (s as Section) : null;
}

// Whether the setting was ever saved in the admin; if not, the site uses the built-in defaults.
const saved = async (key: Section) => !!(await db.setting.findUnique({ where: { key }, select: { key: true } }));

export async function GET(req: Request, ctx: Ctx) {
  const c = await caller(req, false);
  if (c instanceof NextResponse) return c;
  const s = await section(ctx);
  if (!s) return apiError(404, `Unknown section. Use one of: ${SECTIONS.join(", ")}`);
  const settings = await getSettings();
  if (s === "navigation") return json({ saved: await saved(s), navigation: settings.navigation });
  if (s === "legal") {
    const l = settings.legal;
    return json({ saved: await saved(s), legal: { ...l, privacyIsDefault: l.privacyHtml === DEFAULT_PRIVACY_HTML, termsIsDefault: l.termsHtml === DEFAULT_TERMS_HTML } });
  }
  if (s === "business") {
    const { consentText: _c, consentVersion: _v, ...b } = settings.business;
    return json({ saved: await saved(s), business: b });
  }
  const { reviews: _r, repairCosts: _rc, ...content } = settings.content;
  return json({ saved: await saved(s), content });
}

export async function PUT(req: Request, ctx: Ctx) {
  const c = await caller(req, true);
  if (c instanceof NextResponse) return c;
  if ((await section(ctx)) !== "navigation") return apiError(405, "PUT is only for navigation; use PATCH for legal and content");
  const body = await readJson(req, 100_000);
  if (body instanceof NextResponse) return body;
  const r = cleanNavigation(body.navigation ?? body);
  if (!r.ok) return apiError(400, r.error);
  await saveSetting("navigation", r.nav);
  await audit(c.saver.actor ?? c.saver.email, "menus_updated", "setting", "navigation", { via: "api" });
  return json({ message: "Menus saved. They're live on the website.", navigation: r.nav });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const c = await caller(req, true);
  if (c instanceof NextResponse) return c;
  const s = await section(ctx);
  if (s !== "legal" && s !== "content") return apiError(405, "PATCH is for legal and content; use PUT for navigation");
  const body = await readJson(req, 400_000);
  if (body instanceof NextResponse) return body;
  const actor = c.saver.actor ?? c.saver.email;
  const settings = await getSettings();

  if (s === "legal") {
    const old = settings.legal;
    const reset = String(body.reset ?? "");
    let privacyHtml = reset === "privacy" || reset === "both" ? DEFAULT_PRIVACY_HTML : body.privacyHtml !== undefined ? sanitizePostHtml(String(body.privacyHtml)) : old.privacyHtml;
    let termsHtml = reset === "terms" || reset === "both" ? DEFAULT_TERMS_HTML : body.termsHtml !== undefined ? sanitizePostHtml(String(body.termsHtml)) : old.termsHtml;
    if (!privacyHtml.replace(/<[^>]+>/g, "").trim() || !termsHtml.replace(/<[^>]+>/g, "").trim()) return apiError(400, "The Privacy Policy and Terms can't be empty");
    privacyHtml = privacyHtml.slice(0, 300_000);
    termsHtml = termsHtml.slice(0, 300_000);
    const changed = privacyHtml !== old.privacyHtml || termsHtml !== old.termsHtml;
    const next: LegalSettings = {
      ...old,
      privacyHtml,
      termsHtml,
      privacyUpdated: privacyHtml !== old.privacyHtml ? today() : old.privacyUpdated,
      termsUpdated: termsHtml !== old.termsHtml ? today() : old.termsUpdated,
      reviewed: changed ? false : old.reviewed, // new wording needs a fresh attorney review
    };
    await saveSetting("legal", next);
    await audit(actor, "legal_updated", "setting", "legal", { via: "api", privacyChanged: next.privacyUpdated !== old.privacyUpdated, termsChanged: next.termsUpdated !== old.termsUpdated });
    return json({ message: changed ? "Legal pages saved. They're live on the website." : "No change.", legal: { privacyUpdated: next.privacyUpdated, termsUpdated: next.termsUpdated, reviewed: next.reviewed } });
  }

  // content
  const patch: Partial<ContentSettings> = {};
  const pairs = (v: unknown, max: number, a: string, b: string, la: number, lb: number) =>
    Array.isArray(v) ? v.slice(0, max).map((r: Record<string, unknown>) => ({ [a]: text(r?.[a], la), [b]: text(r?.[b], lb) })).filter((r) => r[a] && r[b]) : null;
  if (body.hero !== undefined) {
    const h = body.hero as Record<string, unknown>;
    const hero = { eyebrow: text(h?.eyebrow, 60), title: text(h?.title, 90), subtitle: text(h?.subtitle, 240), bullets: strList(h?.bullets, 4, 80) ?? settings.content.hero.bullets };
    if (!hero.title) return apiError(400, "hero.title can't be empty");
    patch.hero = hero;
  }
  if (body.stats !== undefined) {
    const stats = pairs(body.stats, 6, "value", "label", 12, 60) as ContentSettings["stats"] | null;
    if (!stats) return apiError(400, "stats must be a list of { value, label }");
    patch.stats = stats;
  }
  if (body.about !== undefined) {
    const a = body.about as Record<string, unknown>;
    const about = { eyebrow: text(a?.eyebrow, 40), title: text(a?.title, 90), body: text(a?.body, 900), points: strList(a?.points, 6, 80) ?? settings.content.about.points };
    if (!about.title) return apiError(400, "about.title can't be empty");
    patch.about = about;
  }
  if (body.services !== undefined) {
    const services = pairs(body.services, 6, "title", "body", 60, 300) as ContentSettings["services"] | null;
    if (!services?.length) return apiError(400, "services must be a non-empty list of { title, body }");
    patch.services = services;
  }
  if (body.process !== undefined) {
    const process = pairs(body.process, 5, "title", "body", 60, 240) as ContentSettings["process"] | null;
    if (!process || process.length < 2) return apiError(400, "process must be a list of at least two { title, body }");
    patch.process = process;
  }
  if (body.whyIntro !== undefined) patch.whyIntro = text(body.whyIntro, 800);
  if (body.benefitsIntro !== undefined) patch.benefitsIntro = text(body.benefitsIntro, 800);
  if (body.reasons !== undefined) {
    const reasons = pairs(body.reasons, 12, "title", "body", 60, 500) as ContentSettings["reasons"] | null;
    if (!reasons?.length) return apiError(400, "reasons must be a non-empty list of { title, body }");
    patch.reasons = reasons;
  }
  if (body.claims !== undefined) {
    const cl = body.claims as Record<string, unknown>;
    const old = settings.content.claims;
    patch.claims = { intro: text(cl?.intro, 800) || old.intro, hours: text(cl?.hours, 120) || old.hours, maintenanceIntro: text(cl?.maintenanceIntro, 600) || old.maintenanceIntro, maintenanceHours: text(cl?.maintenanceHours, 120) || old.maintenanceHours, note: text(cl?.note, 600) || old.note };
  }
  if (body.faqs !== undefined) {
    const faqs = pairs(body.faqs, 30, "q", "a", 160, 1200) as ContentSettings["faqs"] | null;
    if (!faqs?.length) return apiError(400, "faqs must be a non-empty list of { q, a }");
    patch.faqs = faqs;
  }
  if (!Object.keys(patch).length) return apiError(400, "Nothing to change. Send hero, stats, about, services, process, whyIntro, reasons, benefitsIntro, claims or faqs");
  await saveSetting("content", { ...settings.content, ...patch });
  await audit(actor, "content_updated", "setting", "content", { via: "api", fields: Object.keys(patch) });
  return json({ message: "Content saved. It's live on the website.", fields: Object.keys(patch) });
}
