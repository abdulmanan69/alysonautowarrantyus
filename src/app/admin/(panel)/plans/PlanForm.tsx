"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { RichEditor } from "../blog/RichEditor";
import { deletePlan, savePlan, type PlanInput } from "./actions";

export type EditorPlan = Omit<PlanInput, "id"> & { id?: string };

const input = "block h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.05)] placeholder:text-road/45 focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15";
const area = `${input} h-auto py-2`;
const slugOf = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

function Panel({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#E4E7EC] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-road">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
const Counter = ({ n, good, max }: { n: number; good: [number, number]; max: number }) => (
  <span className={`text-xs tabular-nums ${n === 0 ? "text-road" : n >= good[0] && n <= good[1] ? "text-emerald-600" : n > max ? "text-red-600" : "text-amber-600"}`}>{n}/{good[1]}</span>
);

export function PlanForm({ plan, siteUrl }: { plan: EditorPlan; siteUrl: string }) {
  const router = useRouter();
  const [p, setP] = useState(plan);
  const [slugTouched, setSlugTouched] = useState(!!plan.id);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof EditorPlan>(k: K, v: EditorPlan[K]) => {
    setP((x) => ({ ...x, [k]: v }));
    setDirty(true);
  };
  const host = siteUrl.replace(/^https?:\/\//, "");

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(active?: boolean) {
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const r = await savePlan({ ...p, active: active ?? p.active });
      if (!r.ok) return setNotice({ ok: false, text: r.error });
      setP((x) => ({ ...x, id: r.id, slug: r.slug, active: active ?? x.active }));
      setSlugTouched(true);
      setDirty(false);
      setNotice({ ok: true, text: r.message });
      if (!p.id) router.replace(`/admin/plans/${r.id}`);
      else router.refresh();
    } catch {
      setNotice({ ok: false, text: "Couldn't save. Check your connection and try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-[#E4E7EC] bg-[#F6F7F9]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <Link href="/admin/plans" className="text-sm font-semibold text-road hover:text-asphalt">← All plans</Link>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-[#F2F4F7] text-road"}`}>{p.active ? "Live" : "Hidden"}</span>
        <span className="text-xs text-road">{saving ? "Saving…" : dirty ? "Unsaved changes" : ""}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {p.id && p.active && <a href={`/plans/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#F9FAFB]">View page ↗</a>}
          {p.active ? (
            <button type="button" onClick={() => void save(false)} disabled={saving} className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#F9FAFB] disabled:opacity-60">Hide from site</button>
          ) : (
            <button type="button" onClick={() => void save(false)} disabled={saving} className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-semibold hover:bg-[#F9FAFB] disabled:opacity-60">Save hidden</button>
          )}
          <button type="button" onClick={() => void save(true)} disabled={saving} className="rounded-lg bg-asphalt px-4 py-2 text-sm font-semibold text-white hover:bg-coal disabled:opacity-60">{p.active ? "Update" : "Publish"}</button>
        </div>
      </div>

      {notice && (
        <div role={notice.ok ? "status" : "alert"} className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{notice.text}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-[#E4E7EC] bg-white px-6 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:px-8">
            <input
              value={p.name}
              maxLength={80}
              placeholder="Plan name, e.g. Gold Protection"
              aria-label="Plan name"
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) setP((x) => ({ ...x, slug: slugOf(e.target.value) }));
              }}
              className="block w-full border-0 bg-transparent p-0 text-3xl font-extrabold leading-tight tracking-tight text-asphalt placeholder:text-road/35 focus:outline-none focus:ring-0"
            />
            <label className="mt-3 flex flex-wrap items-center gap-1 text-sm text-road">
              <span className="shrink-0">{host}/plans/</span>
              <input value={p.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugOf(e.target.value) + (e.target.value.endsWith("-") ? "-" : "")); }} aria-label="Web address" placeholder="plan-address" className="min-w-[200px] flex-1 rounded-md border border-transparent bg-[#F6F7F9] px-2 py-1 font-medium text-asphalt hover:border-[#D0D5DD] focus:border-sky focus:bg-white focus:outline-none" />
            </label>
            <input value={p.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={90} placeholder="Tagline, e.g. Comprehensive vehicle coverage for every driver" aria-label="Tagline" className="mt-4 block w-full rounded-lg border border-transparent bg-[#F6F7F9] px-3 py-2 text-[15px] text-road hover:border-[#D0D5DD] focus:border-sky focus:bg-white focus:outline-none" />
            <textarea value={p.summary} onChange={(e) => set("summary", e.target.value)} maxLength={300} rows={3} placeholder="One-paragraph summary shown on cards and the plans overview" aria-label="Summary" className="mt-3 block w-full resize-none rounded-lg border border-transparent bg-[#F6F7F9] px-3 py-2 text-[15px] text-road hover:border-[#D0D5DD] focus:border-sky focus:bg-white focus:outline-none" />
          </div>
          <p className="text-xs text-road">Full description shown on the plan page. Type {"{company}"} to insert the business name.</p>
          <RichEditor initialHtml={plan.description} onChange={(html) => set("description", html)} />
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="What's included" hint="One item per line. Shown as a checklist on the plan page and (first five) on cards.">
              <textarea value={p.features} onChange={(e) => set("features", e.target.value)} rows={8} className={area} placeholder={"Engine, transmission and drive axle\nAir conditioning and cooling system"} />
            </Panel>
            <Panel title="What's not included" hint="One item per line.">
              <textarea value={p.exclusions} onChange={(e) => set("exclusions", e.target.value)} rows={8} className={area} placeholder={"Routine maintenance items\nPre-existing conditions"} />
            </Panel>
          </div>
        </div>

        <aside className="space-y-4">
          <Panel title="Display">
            <label className="block text-sm font-medium">Type
              <select value={p.kind} onChange={(e) => set("kind", e.target.value as "coverage" | "maintenance")} className={`${input} mt-1.5`}>
                <option value="coverage">Coverage plan (shown in comparison and quote form)</option>
                <option value="maintenance">Maintenance add-on</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Icon
              <select value={p.icon} onChange={(e) => set("icon", e.target.value)} className={`${input} mt-1.5`}>
                {[["shield", "Shield"], ["star", "Star"], ["engine", "Engine"], ["wrench", "Wrench"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Badge<input value={p.badge} onChange={(e) => set("badge", e.target.value)} maxLength={24} placeholder="Most popular" className={`${input} mt-1.5`} /></label>
              <label className="block text-sm font-medium">Order<input type="number" value={p.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className={`${input} mt-1.5`} /></label>
            </div>
            <label className="block text-sm font-medium">Max mileage (optional)<input type="number" value={p.maxMileage} onChange={(e) => set("maxMileage", e.target.value)} placeholder="150000" className={`${input} mt-1.5`} /></label>
            <label className="block text-sm font-medium">Best for<textarea value={p.bestFor} onChange={(e) => set("bestFor", e.target.value)} maxLength={200} rows={2} className={`${area} mt-1.5`} /></label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-sky" />
              Highlight on the home page
            </label>
          </Panel>

          <Panel title="Search engines (SEO)">
            <div className="rounded-lg border border-[#EEF0F3] bg-[#FCFCFD] p-3">
              <p className="truncate text-xs text-[#202124]">{host}/plans/{p.slug || "plan-address"}</p>
              <p className="mt-0.5 line-clamp-1 text-[17px] leading-snug text-[#1A0DAB]">{p.seoTitle || p.name || "Plan name"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#4D5156]">{p.seoDescription || p.summary || "Add a description so Google shows a good summary."}</p>
            </div>
            <label className="block text-sm font-medium">
              <span className="flex justify-between">SEO title <Counter n={p.seoTitle.length} good={[30, 60]} max={70} /></span>
              <input value={p.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} maxLength={70} placeholder={p.name || "Defaults to the plan name"} className={`${input} mt-1.5`} />
            </label>
            <label className="block text-sm font-medium">
              <span className="flex justify-between">Meta description <Counter n={p.seoDescription.length} good={[120, 160]} max={200} /></span>
              <textarea value={p.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} maxLength={200} rows={3} placeholder="Defaults to the summary" className={`${area} mt-1.5`} />
            </label>
          </Panel>

          {p.id && (
            <Panel title="More">
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("Delete this plan for good? Links to it will stop working.")) return;
                  await deletePlan(p.id!);
                  setDirty(false);
                  router.push("/admin/plans?saved=Plan+deleted.");
                }}
                className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Delete plan
              </button>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}
