"use server";

import { after } from "next/server";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizePostHtml, slugify } from "@/lib/blog";
import { db } from "@/lib/db";
import { submitToIndexNow } from "@/lib/indexnow";
import { PLAN_ICONS, revalidatePlans } from "@/lib/plans";

export type PlanInput = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  summary: string;
  description: string;
  features: string; // one per line
  exclusions: string; // one per line
  bestFor: string;
  maxMileage: string;
  badge: string;
  icon: string;
  kind: "coverage" | "maintenance";
  sortOrder: string;
  active: boolean;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
};
export type PlanSaveResult = { ok: true; id: string; slug: string; message: string } | { ok: false; error: string };

const clean = (s: unknown, max: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const lines = (s: unknown, max: number) => String(s ?? "").split(/\r?\n/).map((l) => l.trim().slice(0, 160)).filter(Boolean).slice(0, max);

export async function savePlan(input: PlanInput): Promise<PlanSaveResult> {
  const me = await requireAdmin("admin");
  const existing = input.id ? await db.plan.findUnique({ where: { id: input.id }, select: { id: true, active: true, slug: true } }) : null;
  if (input.id && !existing) return { ok: false, error: "This plan no longer exists." };

  const name = clean(input.name, 80);
  if (!name) return { ok: false, error: "Give the plan a name." };
  const slug = slugify(clean(input.slug, 60) || name).slice(0, 60);
  if (!slug) return { ok: false, error: "The web address needs at least one letter or number." };
  const clash = await db.plan.findFirst({ where: { slug, ...(existing ? { NOT: { id: existing.id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, error: `Another plan already uses /plans/${slug}.` };
  if (String(input.description ?? "").length > 200_000) return { ok: false, error: "The description is too long to save." };
  const summary = clean(input.summary, 300);
  if (input.active && !summary) return { ok: false, error: "Add a summary before publishing the plan." };
  const maxMileage = input.maxMileage ? Math.round(Number(input.maxMileage)) : null;
  if (maxMileage !== null && (!Number.isFinite(maxMileage) || maxMileage < 1000 || maxMileage > 500000)) return { ok: false, error: "Max mileage should be between 1,000 and 500,000." };

  const data = {
    name,
    slug,
    tagline: clean(input.tagline, 90),
    summary,
    description: sanitizePostHtml(String(input.description ?? "")),
    features: JSON.stringify(lines(input.features, 20)),
    exclusions: JSON.stringify(lines(input.exclusions, 20)),
    bestFor: clean(input.bestFor, 200),
    maxMileage,
    badge: clean(input.badge, 24),
    icon: (PLAN_ICONS as readonly string[]).includes(input.icon) ? input.icon : "shield",
    kind: input.kind === "maintenance" ? "maintenance" : "coverage",
    sortOrder: Math.round(Number(input.sortOrder)) || 0,
    active: !!input.active,
    featured: !!input.featured,
    seoTitle: clean(input.seoTitle, 70),
    seoDescription: clean(input.seoDescription, 200),
  };
  const plan = existing ? await db.plan.update({ where: { id: existing.id }, data, select: { id: true, slug: true } }) : await db.plan.create({ data, select: { id: true, slug: true } });
  revalidatePlans();
  await audit(me.email, existing ? "plan_updated" : "plan_created", "plan", plan.id, { name, active: data.active });
  if (data.active || existing?.active) after(() => submitToIndexNow([`/plans/${plan.slug}`, "/plans"], me.email));
  return { ok: true, id: plan.id, slug: plan.slug, message: data.active ? "Saved. The plan is live on the website." : "Saved. The plan is hidden from visitors." };
}

export async function deletePlan(id: string): Promise<{ ok: boolean }> {
  const me = await requireAdmin("admin");
  const p = await db.plan.findUnique({ where: { id }, select: { name: true } });
  if (p) {
    await db.plan.delete({ where: { id } });
    revalidatePlans();
    await audit(me.email, "plan_deleted", "plan", id, { name: p.name });
  }
  return { ok: true };
}
