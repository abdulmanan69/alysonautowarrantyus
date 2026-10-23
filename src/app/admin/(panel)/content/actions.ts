"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin-guard";
import { getSettings, saveSetting, type ContentSettings } from "@/lib/settings";

const back = (section: string, q: Record<string, string>) => redirect(`/admin/content?${new URLSearchParams(q)}#${section}`);
const text = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
const lines = (f: FormData, k: string, max: number, each = 120) => text(f, k, 4000).split("\n").map((l) => l.trim().slice(0, each)).filter(Boolean).slice(0, max);

async function save(section: string, label: string, email: string, patch: Partial<ContentSettings>) {
  const { content } = await getSettings();
  await saveSetting("content", { ...content, ...patch });
  await audit(email, "content_updated", "setting", "content", { section });
  back(section, { saved: `${label} saved. It's live on the website.` });
}

/** Reads numbered rows (e.g. faq_q_0, faq_a_0 …) and drops empty ones. */
function rows<T>(f: FormData, prefix: string, max: number, read: (i: number) => T | null): T[] {
  const out: T[] = [];
  for (let i = 0; i < max; i++) {
    if (!f.has(`${prefix}_${i}`)) continue;
    const row = read(i);
    if (row) out.push(row);
  }
  return out;
}

export async function saveHero(f: FormData) {
  const me = await requireAdmin("admin");
  const hero = { eyebrow: text(f, "eyebrow", 60), title: text(f, "title", 90), subtitle: text(f, "subtitle", 240), bullets: lines(f, "bullets", 4, 80) };
  if (!hero.title) back("hero", { error: "The headline can't be empty." });
  await save("hero", "Homepage hero", me.email, { hero });
}

export async function saveStats(f: FormData) {
  const me = await requireAdmin("admin");
  const stats = rows(f, "stat_value", 6, (i) => {
    const value = text(f, `stat_value_${i}`, 12);
    const label = text(f, `stat_label_${i}`, 60);
    return value && label ? { value, label } : null;
  });
  await save("stats", "Headline numbers", me.email, { stats });
}

export async function saveServices(f: FormData) {
  const me = await requireAdmin("admin");
  const services = rows(f, "service_title", 6, (i) => {
    const title = text(f, `service_title_${i}`, 60);
    const body = text(f, `service_body_${i}`, 300);
    return title && body ? { title, body } : null;
  });
  if (services.length < 1) back("services", { error: "Keep at least one service card." });
  await save("services", "Services", me.email, { services });
}

export async function saveAbout(f: FormData) {
  const me = await requireAdmin("admin");
  const about = { eyebrow: text(f, "eyebrow", 40), title: text(f, "title", 90), body: text(f, "body", 900), points: lines(f, "points", 6, 80) };
  if (!about.title) back("about", { error: "The about title can't be empty." });
  await save("about", "About section", me.email, { about });
}

export async function saveProcess(f: FormData) {
  const me = await requireAdmin("admin");
  const process = rows(f, "step_title", 5, (i) => {
    const title = text(f, `step_title_${i}`, 60);
    const body = text(f, `step_body_${i}`, 240);
    return title && body ? { title, body } : null;
  });
  if (process.length < 2) back("process", { error: "Keep at least two steps." });
  await save("process", "How it works", me.email, { process });
}

export async function saveWhy(f: FormData) {
  const me = await requireAdmin("admin");
  const reasons = rows(f, "reason_title", 12, (i) => {
    const title = text(f, `reason_title_${i}`, 60);
    const body = text(f, `reason_body_${i}`, 500);
    return title && body ? { title, body } : null;
  });
  if (reasons.length < 1) back("why", { error: "Keep at least one reason (a title and text)." });
  await save("why", "Why Alyson", me.email, { whyIntro: text(f, "whyIntro", 800), reasons });
}

export async function saveBenefits(f: FormData) {
  const me = await requireAdmin("admin");
  await save("benefits", "Benefits intro", me.email, { benefitsIntro: text(f, "benefitsIntro", 800) });
}

export async function saveClaims(f: FormData) {
  const me = await requireAdmin("admin");
  const claims = {
    intro: text(f, "intro", 800),
    hours: text(f, "hours", 120),
    maintenanceIntro: text(f, "maintenanceIntro", 600),
    maintenanceHours: text(f, "maintenanceHours", 120),
    note: text(f, "note", 600),
  };
  if (!claims.intro) back("claims", { error: "Explain how to start a claim." });
  await save("claims", "Claims text", me.email, { claims });
}

export async function saveFaqs(f: FormData) {
  const me = await requireAdmin("admin");
  const faqs = rows(f, "faq_q", 30, (i) => {
    const q = text(f, `faq_q_${i}`, 160);
    const a = text(f, `faq_a_${i}`, 1200);
    return q && a ? { q, a } : null;
  });
  if (faqs.length < 1) back("faqs", { error: "Keep at least one question and answer." });
  await save("faqs", "FAQs", me.email, { faqs });
}

export async function saveRepairCosts(f: FormData) {
  const me = await requireAdmin("admin");
  const { content } = await getSettings();
  const repairCosts: Record<string, string> = {};
  for (const part of Object.keys(content.repairCosts)) {
    const v = text(f, `cost_${part}`, 24);
    if (!v) back("repair", { error: `Enter a price for ${part}.` });
    repairCosts[part] = v;
  }
  await save("repair", "Repair prices", me.email, { repairCosts });
}

export async function saveReviews(f: FormData) {
  const me = await requireAdmin("admin");
  const url = (v: string) => (v === "" || /^https:\/\/\S+$/.test(v) ? v : null);
  const items = rows(f, "rev_name", 12, (i) => {
    const name = text(f, `rev_name_${i}`, 60);
    const body = text(f, `rev_text_${i}`, 600);
    if (!name || !body) return null;
    const rating = Math.min(5, Math.max(1, Number(f.get(`rev_rating_${i}`)) || 5));
    const title = text(f, `rev_title_${i}`, 100);
    return { name, location: text(f, `rev_location_${i}`, 60), date: text(f, `rev_date_${i}`, 30), rating, text: body, ...(title ? { title } : {}) };
  });
  const raw = String(f.get("theme") ?? "plain");
  const theme = raw === "google" || raw === "trustpilot" ? raw : ("plain" as const);
  const autoplaySeconds = Math.min(30, Math.max(0, Math.round(Number(f.get("autoplaySeconds")) || 0)));
  const platform = text(f, "platform", 60);
  const summaryUrl = url(text(f, "summaryUrl", 300));
  const awardUrl = url(text(f, "awardUrl", 300));
  if (summaryUrl === null || awardUrl === null) back("reviews", { error: "Links must start with https://" });
  const rating = Number(f.get("summaryRating"));
  const count = Number(f.get("summaryCount"));
  const summary = platform && rating >= 1 && rating <= 5 && count > 0 ? { platform, rating, count: Math.round(count), url: summaryUrl! } : null;
  const awardText = text(f, "awardText", 120);
  const award = awardText && awardUrl ? { text: awardText, url: awardUrl } : null;
  await save("reviews", "Reviews", me.email, { reviews: { theme, autoplaySeconds, summary, items, award } });
}
