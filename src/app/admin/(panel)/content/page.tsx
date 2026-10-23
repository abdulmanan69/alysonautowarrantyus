import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { getSettings } from "@/lib/settings";
import { FormField, Notice, SectionFooter, inputCls } from "@/components/admin/forms";
import { Card, PageHeader, btnPrimary } from "@/components/admin/ui";
import { saveAbout, saveBenefits, saveClaims, saveFaqs, saveHero, saveProcess, saveRepairCosts, saveReviews, saveServices, saveStats, saveWhy } from "./actions";

export const dynamic = "force-dynamic";

const area = `${inputCls} h-auto py-2.5`;
const EXTRA_ROWS = 2;

function Section({ id, title, view, hint, children }: { id: string; title: string; view: string; hint?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-6">
      <Card title={title} action={<Link href={view} target="_blank" className="text-sm font-semibold text-sky hover:underline">View on site ↗</Link>}>
        {hint && <p className="mb-4 text-sm text-road">{hint}</p>}
        {children}
      </Card>
    </div>
  );
}

const pad = <T,>(rows: T[], blank: T, n = EXTRA_ROWS) => [...rows, ...Array(n).fill(blank)] as T[];

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin("admin");
  const [{ saved, error }, { content: c }] = await Promise.all([searchParams, getSettings()]);
  const theme = c.reviews.theme ?? "plain";
  const reasonRows = pad(c.reasons, { title: "", body: "" });
  const faqRows = pad(c.faqs, { q: "", a: "" });
  const reviewRows = pad(c.reviews.items, { name: "", location: "", date: "", rating: 5, text: "" });
  const statRows = pad(c.stats, { value: "", label: "" }, 1);
  const serviceRows = pad(c.services, { title: "", body: "" }, 1);
  const processRows = pad(c.process, { title: "", body: "" }, 1);

  return (
    <>
      <PageHeader
        title="Homepage & content"
        subtitle={<>Edit the words on your website. Type <code className="font-semibold text-asphalt">{"{company}"}</code> anywhere to insert your business name. Plans are edited under <Link href="/admin/plans" className="font-semibold text-sky hover:underline">Plans</Link>.</>}
      />
      <Notice saved={saved} error={error} />
      <nav className="mb-6 flex flex-wrap gap-2 text-sm">
        {[["hero", "Hero"], ["stats", "Numbers"], ["services", "Services"], ["about", "About"], ["process", "How it works"], ["why", "Why Alyson"], ["benefits", "Benefits"], ["claims", "Claims"], ["faqs", "FAQs"], ["repair", "Repair prices"], ["reviews", "Reviews"]].map(([id, l]) => (
          <a key={id} href={`#${id}`} className="rounded-lg border border-[#E4E7EC] bg-white px-3 py-1.5 font-medium hover:border-sky hover:text-sky">{l}</a>
        ))}
      </nav>

      <div className="space-y-6">
        <Section id="hero" title="Homepage hero" view="/">
          <form action={saveHero} className="space-y-4">
            <FormField label="Small label above the headline" htmlFor="eyebrow"><input id="eyebrow" name="eyebrow" defaultValue={c.hero.eyebrow} maxLength={60} className={inputCls} /></FormField>
            <FormField label="Headline" htmlFor="title" hint="Up to 90 characters. The last three words get the yellow marker stroke."><input id="title" name="title" defaultValue={c.hero.title} maxLength={90} required className={inputCls} /></FormField>
            <FormField label="Supporting text" htmlFor="subtitle"><textarea id="subtitle" name="subtitle" defaultValue={c.hero.subtitle} maxLength={240} rows={2} className={area} /></FormField>
            <FormField label="Bullet points" htmlFor="bullets" hint="One per line, up to four."><textarea id="bullets" name="bullets" defaultValue={c.hero.bullets.join("\n")} rows={4} className={area} /></FormField>
            <SectionFooter><button className={btnPrimary}>Save hero</button></SectionFooter>
          </form>
        </Section>

        <Section id="stats" title="Headline numbers (yellow band)" view="/" hint="Short figures under the hero, e.g. “24/7”, “30-day”. Clear a value to remove it.">
          <form action={saveStats} className="space-y-3">
            {statRows.map((s, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <input name={`stat_value_${i}`} defaultValue={s.value} maxLength={12} placeholder="24/7" aria-label={`Number ${i + 1}`} className={inputCls} />
                <input name={`stat_label_${i}`} defaultValue={s.label} maxLength={60} placeholder="Claims line, even on holidays" aria-label={`Label ${i + 1}`} className={inputCls} />
              </div>
            ))}
            <SectionFooter><button className={btnPrimary}>Save numbers</button></SectionFooter>
          </form>
        </Section>

        <Section id="services" title="Services (three cards)" view="/">
          <form action={saveServices} className="space-y-3">
            {serviceRows.map((s, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-[#EEF0F3] p-3 sm:grid-cols-[220px_1fr]">
                <input name={`service_title_${i}`} defaultValue={s.title} maxLength={60} placeholder={`Card ${i + 1} title`} aria-label={`Card ${i + 1} title`} className={inputCls} />
                <textarea name={`service_body_${i}`} defaultValue={s.body} maxLength={300} rows={2} placeholder="Card text" aria-label={`Card ${i + 1} text`} className={area} />
              </div>
            ))}
            <SectionFooter><button className={btnPrimary}>Save services</button></SectionFooter>
          </form>
        </Section>

        <Section id="about" title="About section" view="/about">
          <form action={saveAbout} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
              <FormField label="Small label" htmlFor="about_eyebrow"><input id="about_eyebrow" name="eyebrow" defaultValue={c.about.eyebrow} maxLength={40} className={inputCls} /></FormField>
              <FormField label="Title" htmlFor="about_title"><input id="about_title" name="title" defaultValue={c.about.title} maxLength={90} required className={inputCls} /></FormField>
            </div>
            <FormField label="Paragraph" htmlFor="about_body"><textarea id="about_body" name="body" defaultValue={c.about.body} maxLength={900} rows={4} className={area} /></FormField>
            <FormField label="Check-marked points" htmlFor="about_points" hint="One per line, up to six."><textarea id="about_points" name="points" defaultValue={c.about.points.join("\n")} rows={4} className={area} /></FormField>
            <SectionFooter><button className={btnPrimary}>Save about</button></SectionFooter>
          </form>
        </Section>

        <Section id="process" title="How it works (three steps)" view="/">
          <form action={saveProcess} className="space-y-3">
            {processRows.map((s, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-[#EEF0F3] p-3 sm:grid-cols-[220px_1fr]">
                <input name={`step_title_${i}`} defaultValue={s.title} maxLength={60} placeholder={`Step ${i + 1} title`} aria-label={`Step ${i + 1} title`} className={inputCls} />
                <textarea name={`step_body_${i}`} defaultValue={s.body} maxLength={240} rows={2} placeholder="Step text" aria-label={`Step ${i + 1} text`} className={area} />
              </div>
            ))}
            <SectionFooter><button className={btnPrimary}>Save steps</button></SectionFooter>
          </form>
        </Section>

        <Section id="why" title="Why Alyson (reasons)" view="/why-alyson" hint="Shown on the home page and the Why Alyson page. The Benefits page shows the same reasons (minus the first) with its own intro.">
          <form action={saveWhy} className="space-y-4">
            <FormField label="Intro paragraph" htmlFor="whyIntro"><textarea id="whyIntro" name="whyIntro" defaultValue={c.whyIntro} maxLength={800} rows={3} className={area} /></FormField>
            <p className="text-sm font-medium">Reasons <span className="font-normal text-road">· clear a title to remove one; fill an empty row to add one</span></p>
            {reasonRows.map((r, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-[#EEF0F3] p-3 sm:grid-cols-[220px_1fr]">
                <input name={`reason_title_${i}`} defaultValue={r.title} maxLength={60} placeholder={`Reason ${i + 1} title`} aria-label={`Reason ${i + 1} title`} className={inputCls} />
                <textarea name={`reason_body_${i}`} defaultValue={r.body} maxLength={500} rows={2} placeholder="Reason text" aria-label={`Reason ${i + 1} text`} className={area} />
              </div>
            ))}
            <SectionFooter><button className={btnPrimary}>Save reasons</button></SectionFooter>
          </form>
        </Section>

        <Section id="benefits" title="Benefits page intro" view="/benefits">
          <form action={saveBenefits} className="space-y-4">
            <FormField label="Intro paragraph" htmlFor="benefitsIntro"><textarea id="benefitsIntro" name="benefitsIntro" defaultValue={c.benefitsIntro} maxLength={800} rows={3} className={area} /></FormField>
            <SectionFooter><button className={btnPrimary}>Save intro</button></SectionFooter>
          </form>
        </Section>

        <Section id="claims" title="Claims page" view="/claims">
          <form action={saveClaims} className="space-y-4">
            <FormField label="How to start a mechanical breakdown claim" htmlFor="claims_intro"><textarea id="claims_intro" name="intro" defaultValue={c.claims.intro} maxLength={800} rows={3} className={area} /></FormField>
            <FormField label="Claims department hours" htmlFor="claims_hours"><input id="claims_hours" name="hours" defaultValue={c.claims.hours} maxLength={120} className={inputCls} /></FormField>
            <FormField label="How to file a maintenance claim" htmlFor="claims_m_intro"><textarea id="claims_m_intro" name="maintenanceIntro" defaultValue={c.claims.maintenanceIntro} maxLength={600} rows={2} className={area} /></FormField>
            <FormField label="Maintenance claims hours" htmlFor="claims_m_hours"><input id="claims_m_hours" name="maintenanceHours" defaultValue={c.claims.maintenanceHours} maxLength={120} className={inputCls} /></FormField>
            <FormField label="Reimbursement note" htmlFor="claims_note"><textarea id="claims_note" name="note" defaultValue={c.claims.note} maxLength={600} rows={3} className={area} /></FormField>
            <SectionFooter><button className={btnPrimary}>Save claims text</button></SectionFooter>
          </form>
        </Section>

        <Section id="faqs" title="Frequently asked questions" view="/faq">
          <form action={saveFaqs} className="space-y-3">
            <p className="text-sm text-road">The first six show on the home page; all of them on the FAQ page. The first answer also shows your phone number. Clear a question to remove it; fill an empty row to add one.</p>
            {faqRows.map((f, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-[#EEF0F3] p-3">
                <input name={`faq_q_${i}`} defaultValue={f.q} maxLength={160} placeholder={`Question ${i + 1}`} aria-label={`Question ${i + 1}`} className={`${inputCls} font-medium`} />
                <textarea name={`faq_a_${i}`} defaultValue={f.a} maxLength={1200} rows={2} placeholder="Answer" aria-label={`Answer ${i + 1}`} className={area} />
              </div>
            ))}
            <SectionFooter><button className={btnPrimary}>Save FAQs</button></SectionFooter>
          </form>
        </Section>

        <Section id="repair" title="Repair prices in the car diagram" view="/repair-costs">
          <form action={saveRepairCosts}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(c.repairCosts).map(([part, cost]) => (
                <FormField key={part} label={part} htmlFor={`cost_${part}`}>
                  <input id={`cost_${part}`} name={`cost_${part}`} defaultValue={cost} maxLength={24} required className={inputCls} />
                </FormField>
              ))}
            </div>
            <p className="mt-3 text-xs text-road">Use prices you can back up. The footnote on the website credits ConsumerAffairs data.</p>
            <SectionFooter><button className={btnPrimary}>Save prices</button></SectionFooter>
          </form>
        </Section>

        <Section id="reviews" title="Customer reviews" view="/">
          <form action={saveReviews} className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              Only show real reviews of your business, copied word for word. The built-in examples came from the previous website; replace them with reviews from Google, Trustpilot or your own customers.
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Style</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {([
                  ["plain", "Alyson", "Yellow stars, no platform logo", "#FFBB00"],
                  ["trustpilot", "Trustpilot", "Green star boxes and score word", "#00B67A"],
                  ["google", "Google", "Google “G”, yellow stars, round initials", "#FBBC04"],
                ] as const).map(([value, label, hint, color]) => (
                  <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D0D5DD] p-4 has-[:checked]:border-sky has-[:checked]:ring-4 has-[:checked]:ring-sky/15">
                    <input type="radio" name="theme" value={value} defaultChecked={theme === value} className="mt-1 h-4 w-4 accent-sky" />
                    <span>
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="flex gap-0.5" aria-hidden>{Array.from({ length: 5 }, (_, i) => <span key={i} className={value === "trustpilot" ? "h-3.5 w-3.5" : "h-3.5 w-3.5 rounded-full"} style={{ background: color }} />)}</span>
                        {label}
                      </span>
                      <span className="mt-1 block text-xs text-road">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <FormField label="Seconds between slides" htmlFor="autoplaySeconds" hint="0 = don't move.">
              <input id="autoplaySeconds" name="autoplaySeconds" type="number" min={0} max={30} defaultValue={c.reviews.autoplaySeconds ?? 5} className={`${inputCls} max-w-[120px]`} />
            </FormField>
            <p className="text-sm font-medium">Overall rating <span className="font-normal text-road">· optional</span></p>
            <div className="grid gap-3 sm:grid-cols-[1fr_100px_120px_1.4fr]">
              <input name="platform" defaultValue={c.reviews.summary?.platform ?? ""} maxLength={60} placeholder="Platform, e.g. Google" aria-label="Review platform" className={inputCls} />
              <input name="summaryRating" type="number" step="0.1" min={1} max={5} defaultValue={c.reviews.summary?.rating ?? ""} placeholder="4.8" aria-label="Average rating" className={inputCls} />
              <input name="summaryCount" type="number" min={1} defaultValue={c.reviews.summary?.count ?? ""} placeholder="No. of ratings" aria-label="Number of ratings" className={inputCls} />
              <input name="summaryUrl" defaultValue={c.reviews.summary?.url ?? ""} placeholder="https:// link to your reviews" aria-label="Reviews link" className={inputCls} />
            </div>
            <p className="text-sm font-medium">Reviews</p>
            {reviewRows.map((r, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-[#EEF0F3] p-3 sm:grid-cols-[1fr_1fr_1fr_90px]">
                <input name={`rev_name_${i}`} defaultValue={r.name} maxLength={60} placeholder="Name" aria-label={`Review ${i + 1} name`} className={inputCls} />
                <input name={`rev_location_${i}`} defaultValue={r.location} maxLength={60} placeholder="City, ST" aria-label={`Review ${i + 1} location`} className={inputCls} />
                <input name={`rev_date_${i}`} defaultValue={r.date} maxLength={30} placeholder="May 9, 2026" aria-label={`Review ${i + 1} date`} className={inputCls} />
                <select name={`rev_rating_${i}`} defaultValue={String(r.rating)} aria-label={`Review ${i + 1} stars`} className={inputCls}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                </select>
                <input name={`rev_title_${i}`} defaultValue={r.title ?? ""} maxLength={100} placeholder="Review title (optional)" aria-label={`Review ${i + 1} title`} className={`${inputCls} sm:col-span-4`} />
                <textarea name={`rev_text_${i}`} defaultValue={r.text} maxLength={600} rows={2} placeholder="Review text" aria-label={`Review ${i + 1} text`} className={`${area} sm:col-span-4`} />
              </div>
            ))}
            <p className="text-sm font-medium">Award <span className="font-normal text-road">· optional, only one actually given to your business</span></p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="awardText" defaultValue={c.reviews.award?.text ?? ""} maxLength={120} placeholder="Awarded “Best Value” by Example.com" aria-label="Award text" className={inputCls} />
              <input name="awardUrl" defaultValue={c.reviews.award?.url ?? ""} placeholder="https:// link to the award" aria-label="Award link" className={inputCls} />
            </div>
            <SectionFooter><button className={btnPrimary}>Save reviews</button></SectionFooter>
          </form>
        </Section>
      </div>
    </>
  );
}
