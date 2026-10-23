import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, IconBadge, type IconName } from "@/components/Icons";
import { PlanCard } from "@/components/PlanCard";
import { RepairCostDiagram } from "@/components/RepairCostDiagram";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";
import { TrustBadges } from "@/components/TrustBadges";
import { VehicleShowcase, type ShowcaseVehicle } from "@/components/VehicleShowcase";
import type { PlanView } from "@/lib/plans";
import { VSC_DISCLOSURE } from "@/lib/products";
import { jsonLd } from "@/lib/security";
import { fillCompany, type ContentSettings } from "@/lib/settings";
import { site } from "@/lib/site";

// Page sections shared by the home page and the inner pages. Words come from /admin/content;
// "{company}" in any text becomes the business name.

type Crumb = { name: string; href: string };

export function Breadcrumbs({ crumbs, light = false }: { crumbs: Crumb[]; light?: boolean }) {
  const trail = [{ name: "Home", href: "/" }, ...crumbs];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${site.url}${c.href === "/" ? "" : c.href}` })),
  };
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${light ? "text-white/60" : "text-road"}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {i < trail.length - 1 ? (
              <Link href={c.href} className={light ? "hover:text-line" : "hover:text-asphalt"}>{c.name}</Link>
            ) : (
              <span aria-current="page" className={light ? "text-white" : "text-asphalt"}>{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Top of an inner page: dark band with breadcrumbs, H1 and intro. */
export function PageHero({ eyebrow, title, intro, crumbs = [], children, media }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; crumbs?: Crumb[]; children?: ReactNode; media?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_10%,rgba(255,187,0,0.22),transparent_60%),radial-gradient(40%_60%_at_10%_90%,rgba(255,187,0,0.08),transparent_60%)]" />
      <div className={`container-x pb-14 pt-10 md:pb-16 md:pt-12 ${media ? "grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14" : ""}`}>
        <div>
          <Breadcrumbs crumbs={crumbs} light />
          {eyebrow && <p className="eyebrow-light mt-7">{eyebrow}</p>}
          <h1 className={`${eyebrow ? "mt-3" : "mt-7"} max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-[3.4rem]`}>{title}</h1>
          {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{intro}</p>}
          {children}
        </div>
        {media}
      </div>
      <div aria-hidden className="lane lane-move h-2 w-full" />
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = "center", light = false, as: Tag = "h2" }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "center" | "left"; light?: boolean; as?: "h1" | "h2" }) {
  return (
    <div className={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}`}>
      {eyebrow && <p className={`${light ? "eyebrow-light" : "eyebrow"} ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</p>}
      <Tag className={`mt-3 text-3xl font-extrabold leading-tight sm:text-4xl ${light ? "text-white" : "text-asphalt"}`}>{title}</Tag>
      {intro && <p className={`mt-4 text-lg leading-relaxed ${light ? "text-white/75" : "text-road"}`}>{intro}</p>}
    </div>
  );
}

/** Yellow band of headline numbers under the hero. */
export function StatsBand({ stats }: { stats: ContentSettings["stats"] }) {
  if (!stats.length) return null;
  return (
    <section className="bg-brand text-asphalt">
      <dl className="container-x grid grid-cols-2 divide-asphalt/10 py-6 md:grid-cols-4 md:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-3 text-center md:py-2">
            <dt className="order-2 text-[13px] font-semibold leading-snug text-asphalt/80">{fillCompany(s.label)}</dt>
            <dd className="text-3xl font-extrabold tracking-tight sm:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const SERVICE_ICONS: IconName[] = ["shield", "dollar", "users", "headset", "tow", "wrench"];

export function ServicesSection({ services, eyebrow = "Our services", title = "Benefit from day one and get on the road faster.", intro }: { services: ContentSettings["services"]; eyebrow?: string; title?: ReactNode; intro?: string }) {
  return (
    <section className="bg-white">
      <div className="container-x py-16 md:py-20">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <article className="group h-full rounded-3xl border border-rail bg-white p-7 transition hover:-translate-y-1 hover:border-brand hover:shadow-lift">
                <IconBadge name={SERVICE_ICONS[i % SERVICE_ICONS.length]} tone="soft" />
                <h3 className="mt-5 text-xl font-extrabold text-asphalt">{fillCompany(s.title)}</h3>
                <p className="mt-2 leading-relaxed text-road">{fillCompany(s.body)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection({ about, phone, phoneHref }: { about: ContentSettings["about"]; phone: string; phoneHref: string }) {
  return (
    <section className="bg-mist">
      <div className="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24">
        <Reveal from="left" className="relative">
          <div className="relative overflow-hidden rounded-[2rem] shadow-lift">
            <img src="/images/about/team-car.webp" alt={`${site.name} customer with a representative beside a car`} width={750} height={610} loading="lazy" decoding="async" className="h-auto w-full object-cover" />
          </div>
          <div className="float-slow absolute -bottom-6 -right-3 hidden rounded-2xl bg-asphalt p-5 text-white shadow-lift sm:block">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-line">Call us 24/7</p>
            <a href={phoneHref} className="mt-1 block text-2xl font-extrabold hover:text-line">{phone}</a>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <SectionHeading eyebrow={fillCompany(about.eyebrow)} title={fillCompany(about.title)} align="left" />
          <p className="mt-5 text-lg leading-relaxed text-road">{fillCompany(about.body)}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {about.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 font-semibold text-asphalt">
                <span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-asphalt"><Icon name="check" size={13} strokeWidth={3} /></span>
                {fillCompany(p)}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/why-alyson" className="btn-dark">Why choose Alyson <Icon name="arrow" size={18} /></Link>
            <Link href="/quote" className="btn-secondary">Get a free quote</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ProcessSection({ steps, eyebrow = "How it works", title = "Protected in three simple steps" }: { steps: ContentSettings["process"]; eyebrow?: string; title?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_70%_at_15%_20%,rgba(255,187,0,0.18),transparent_60%)]" />
      <div className="container-x py-16 md:py-24">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} light />
        </Reveal>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-9 hidden border-t-2 border-dashed border-white/15 md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <li className="relative text-center">
                <span className="relative z-10 mx-auto grid h-[72px] w-[72px] place-items-center rounded-full bg-brand text-2xl font-extrabold text-asphalt shadow-[0_0_0_10px_rgba(255,187,0,0.12)]">{i + 1}</span>
                <h3 className="mt-6 text-xl font-extrabold">{fillCompany(s.title)}</h3>
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-white/70">{fillCompany(s.body)}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <Link href="/quote" className="btn-primary">Start my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
        </div>
      </div>
    </section>
  );
}

export function PlansSection({ plans, eyebrow = "Protected plans", title = "Coverage that fits your car and your budget", intro, bare = false }: { plans: PlanView[]; eyebrow?: string; title?: ReactNode; intro?: ReactNode; bare?: boolean }) {
  const coverage = plans.filter((p) => p.kind === "coverage");
  const addons = plans.filter((p) => p.kind !== "coverage");
  return (
    <section className="bg-white">
      <div className={`container-x ${bare ? "py-12" : "py-16 md:py-20"}`}>
        {!bare && (
          <Reveal>
            <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
          </Reveal>
        )}
        <div className={`${bare ? "" : "mt-12"} grid gap-6 md:grid-cols-3`}>
          {coverage.map((p, i) => (
            <Reveal key={p.id} delay={i * 100} className="group">
              <TiltCard>
                <PlanCard plan={p} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
        {addons.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {addons.map((p) => (
              <Reveal key={p.id} className="group">
                <article className="relative flex h-full items-start gap-5 rounded-3xl border border-rail bg-mist p-6 transition hover:border-brand">
                  <IconBadge name="wrench" tone="brand" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep">{p.badge || "Add-on"}</p>
                    <h3 className="mt-1 text-xl font-extrabold text-asphalt"><Link href={`/plans/${p.slug}`} className="after:absolute after:inset-0">{p.name}</Link></h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-road">{fillCompany(p.summary)}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-road/80">{VSC_DISCLOSURE} Coverage details, deductibles and exclusions are listed in each contract.</p>
      </div>
    </section>
  );
}

const REASON_ICONS: IconName[] = ["headset", "tow", "wrench", "refund", "dollar", "badge", "shield", "users"];

export function WhySection({ intro, reasons, bare = false, title = `Why Choose ${site.name}` }: { intro: string; reasons: { title: string; body: string }[]; bare?: boolean; title?: ReactNode }) {
  return (
    <section id="why-choose" className="scroll-mt-6 bg-mist">
      <div className={`container-x ${bare ? "py-12" : "py-16 md:py-20"}`}>
        {!bare && (
          <Reveal>
            <SectionHeading eyebrow="Why Alyson" title={title} intro={fillCompany(intro)} />
          </Reveal>
        )}
        <div className={`${bare ? "" : "mt-12"} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 90}>
              <article className="h-full rounded-3xl bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center gap-4">
                  <IconBadge name={REASON_ICONS[i % REASON_ICONS.length]} size={44} />
                  <h3 className="text-lg font-extrabold leading-snug text-asphalt">{fillCompany(r.title)}</h3>
                </div>
                <p className="mt-4 leading-relaxed text-road">{fillCompany(r.body)}</p>
              </article>
            </Reveal>
          ))}
        </div>
        {!bare && (
          <Reveal className="mt-10">
            <TrustBadges />
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function RepairCostsSection({ costs, bare = false }: { costs: ContentSettings["repairCosts"]; bare?: boolean }) {
  return (
    <section id="repair-costs" className="scroll-mt-6 bg-white text-asphalt">
      <div className="container-x py-14 text-center md:py-20">
        {!bare && (
          <Reveal>
            <SectionHeading eyebrow="Repair costs" title="What would your next repair cost?" intro="Select any part of the car below to see what a typical repair costs out of pocket, without a service contract." />
          </Reveal>
        )}
        <RepairCostDiagram costs={costs} />
        <p className="mx-auto mt-6 max-w-4xl text-xs leading-relaxed text-road/80 sm:text-sm">
          Estimated auto repair costs based on ConsumerAffairs data (
          <a href="https://www.consumeraffairs.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-asphalt">
            www.consumeraffairs.com
          </a>
          ). Costs shown are estimates only and may vary by vehicle, location and repair facility. {VSC_DISCLOSURE}
        </p>
      </div>
    </section>
  );
}

export type Faq = { q: string; a: string; call?: boolean };

/** FAQ list. `withSchema` adds FAQ data for Google; use it on one page only (/faq). */
export function FaqSection({ faqs, phone, phoneHref, bare = false, withSchema = false, title = "Frequently asked questions", more }: { faqs: Faq[]; phone: string; phoneHref: string; bare?: boolean; withSchema?: boolean; title?: string; more?: boolean }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const list = (
    <div className="divide-y divide-rail rounded-3xl border border-rail bg-white px-6 sm:px-8">
      {faqs.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold text-asphalt">
            {f.q}
            <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-asphalt transition group-open:rotate-45 group-open:bg-brand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </span>
          </summary>
          <p className="mt-3 max-w-prose leading-relaxed text-road">
            {f.a}
            {f.call && (
              <>
                {" "}
                Call <a href={phoneHref} className="font-semibold text-brand-deep underline-offset-2 hover:underline">{phone}</a> for more details.
              </>
            )}
          </p>
        </details>
      ))}
    </div>
  );
  return (
    <section id="faq" className="scroll-mt-6 bg-mist">
      {withSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />}
      <div className={`container-x grid gap-10 ${bare ? "py-12 lg:grid-cols-[1.6fr_1fr]" : "py-16 md:py-20 lg:grid-cols-[1fr_1.5fr]"}`}>
        {bare ? (
          <>
            {list}
            <aside className="h-fit rounded-3xl bg-asphalt p-7 text-white lg:sticky lg:top-28">
              <p className="text-xl font-extrabold">Still have a question?</p>
              <p className="mt-2 leading-relaxed text-white/75">
                Call <a href={phoneHref} className="font-semibold text-line hover:underline">{phone}</a> and our team will help, or send us a message.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link href="/quote" className="btn-primary">Get my free quote</Link>
                <Link href="/contact" className="btn-ghost-light">Contact us</Link>
              </div>
            </aside>
          </>
        ) : (
          <>
            <div>
              <SectionHeading eyebrow="FAQ" title={title} align="left" />
              <p className="mt-4 max-w-sm leading-relaxed text-road">
                Still unsure? Call <a href={phoneHref} className="font-semibold text-brand-deep underline-offset-2 hover:underline">{phone}</a> and our team will help.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/quote" className="btn-primary">Get my free quote</Link>
                {more && <Link href="/faq" className="btn-secondary">All questions</Link>}
              </div>
            </div>
            {list}
          </>
        )}
      </div>
    </section>
  );
}

/** Dark call-to-action band at the bottom of most pages. */
export function QuoteBanner({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  return (
    <section className="container-x pt-4">
      <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-6 pb-14 pt-10 text-white sm:px-12 md:pb-16 md:pt-14">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_80%_at_85%_20%,rgba(255,187,0,0.28),transparent_60%)]" />
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div>
            <p className="eyebrow-light">Free quote · No obligation · 30-day money-back guarantee</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">See what a plan for your car costs.</h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/75">
              Answer a few quick questions about your car and our team will contact you with plan options and prices. Real people, no pressure.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link href="/quote" className="btn-primary flex-1">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
            <a href={phoneHref} className="btn-ghost-light flex-1"><Icon name="phone" size={18} /> {phone}</a>
          </div>
        </div>
        <div aria-hidden className="lane absolute inset-x-0 bottom-0 h-2" />
      </Reveal>
    </section>
  );
}

// Vehicle types shown in the interactive showcase. Pictures are transparent cut-outs in /public/images/vehicles.
const VEHICLES: ShowcaseVehicle[] = [
  {
    key: "sedans",
    label: "Sedans",
    title: "Everyday sedans and hatchbacks",
    image: "/images/vehicles/toyota-camry.webp",
    blurb: "The cars that do the school run, the commute and the weekend trips. Keeping one on the road past 100,000 miles is where a plan pays for itself.",
    points: ["Engine, transmission and drivetrain covered on every tier", "Air conditioning, electrical and brakes on Gold and above", "Repairs at any ASE-certified shop, including your own mechanic"],
    bestPlan: { name: "Gold Protection", slug: "gold" },
    specs: [["Typical age", "3–12 years"], ["Mileage", "Up to 150k"], ["Popular plan", "Gold"], ["Roadside", "24/7 included"]],
  },
  {
    key: "suvs",
    label: "SUVs & crossovers",
    title: "SUVs, crossovers and family haulers",
    image: "/images/vehicles/merced.webp",
    blurb: "Bigger vehicles carry bigger repair bills: all-wheel-drive systems, air suspension and climate control for three rows. Platinum keeps the surprises off your card.",
    points: ["Transfer case and all-wheel-drive components", "Suspension, steering and multi-zone climate systems", "Rental car and trip interruption on Platinum"],
    bestPlan: { name: "Platinum Protection", slug: "platinum" },
    specs: [["Typical age", "2–10 years"], ["Mileage", "Up to 125k"], ["Popular plan", "Platinum"], ["Roadside", "24/7 included"]],
  },
  {
    key: "premium",
    label: "Premium sedans",
    title: "Premium and European sedans",
    image: "/images/vehicles/audi.webp",
    blurb: "German and luxury-brand parts cost more, and so does the labor to fit them. Hi-tech electronics coverage matters most on these cars.",
    points: ["Hi-tech electronics, sensors and infotainment", "Turbochargers, fuel systems and seals", "Optional commercial-use add-on on Gold"],
    bestPlan: { name: "Platinum Protection", slug: "platinum" },
    specs: [["Typical age", "2–8 years"], ["Mileage", "Up to 125k"], ["Popular plan", "Platinum"], ["Roadside", "24/7 included"]],
  },
  {
    key: "sports",
    label: "Sports & convertibles",
    title: "Sports cars and convertibles",
    image: "/images/vehicles/convertible.webp",
    blurb: "Fun to drive, expensive to fix. Performance engines, transmissions and power roofs are exactly the parts a service contract is built for.",
    points: ["Engine and transmission, including performance variants", "Power-top and electrical systems on Platinum", "Flexible payment options to fit the budget"],
    bestPlan: { name: "Platinum Protection", slug: "platinum" },
    specs: [["Typical age", "2–10 years"], ["Mileage", "Up to 125k"], ["Popular plan", "Platinum"], ["Roadside", "24/7 included"]],
  },
  {
    key: "luxury",
    label: "Luxury",
    title: "Luxury and executive vehicles",
    image: "/images/vehicles/limousine.webp",
    blurb: "Bumper-to-bumper style protection equivalent to the factory warranty, so a single failed module never turns into a five-figure invoice.",
    points: ["Nearly every part, component and system", "Seals, gaskets and power accessories", "Preferred pricing for AAA, AARP, USAA and VA members"],
    bestPlan: { name: "Platinum Protection", slug: "platinum" },
    specs: [["Typical age", "1–8 years"], ["Mileage", "Up to 125k"], ["Popular plan", "Platinum"], ["Roadside", "24/7 included"]],
  },
];

/** "Vehicles we protect": tabs plus a cut-out picture that leans toward the mouse. */
export function VehiclesSection() {
  return (
    <section className="bg-white">
      <div className="container-x py-16 md:py-20">
        <Reveal>
          <SectionHeading eyebrow="Vehicles we protect" title="Coverage for the car you actually drive" intro="Most makes and models qualify, from daily commuters to luxury SUVs, and most vehicles up to 200,000 miles. Pick your type to see what matters." />
        </Reveal>
        <div className="mt-10">
          <VehicleShowcase vehicles={VEHICLES} />
        </div>
      </div>
    </section>
  );
}

/** Simple two-column checklist used on plan and benefit pages. */
export function CheckList({ items, tone = "brand" }: { items: string[]; tone?: "brand" | "muted" }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5 text-[15px] text-asphalt">
          <span aria-hidden className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${tone === "brand" ? "bg-brand text-asphalt" : "bg-rail text-road"}`}>
            <Icon name={tone === "brand" ? "check" : "close"} size={11} strokeWidth={3} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}
