import type { Metadata } from "next";
import Link from "next/link";
import { Icon, IconBadge } from "@/components/Icons";
import { PageHero, QuoteBanner, SectionHeading } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { jsonLd } from "@/lib/security";
import { fillCompany, getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = "File a Claim";
const description = "How to file a mechanical breakdown or maintenance claim with Alyson Auto Warranty: who to call, claims department hours, what to have ready and how reimbursement works.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/claims" },
  ...ogMetadata({ eyebrow: "Claims", title: "Need a repair? Start your claim.", subtitle: "Call us and we take it from there." }, { url: "/claims", title: `${title} | ${site.name}`, description }),
};

const READY = ["Your contract number and the name on the contract", "Your vehicle's year, make, model and current mileage", "The repair shop's name and phone number", "A short description of the problem and when it started"];

export default async function ClaimsPage() {
  const [{ content }, biz] = await Promise.all([getSettings(), getSite()]);
  const c = content.claims;
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to file a claim with ${site.name}`,
    description,
    step: [
      { "@type": "HowToStep", name: "Stop driving and get the car to a shop", text: "If a covered part fails, stop driving to prevent further damage and take the vehicle to any ASE-certified repair facility." },
      { "@type": "HowToStep", name: "Call the claims department before repairs begin", text: `Call ${biz.supportPhone} (${c.hours}) so the shop's diagnosis can be reviewed and the repair authorized.` },
      { "@type": "HowToStep", name: "Authorized repairs are paid", text: "Once authorized, covered repairs are paid to the shop per your contract; you pay only your deductible and any non-covered items." },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <PageHero
        eyebrow="Claims"
        title={<>Need a repair? <span className="mark mark-dark">Start your claim.</span></>}
        intro={fillCompany(c.intro)}
        crumbs={[{ name: "Claims", href: "/claims" }]}
        media={
          <aside className="rounded-3xl bg-white p-7 text-asphalt shadow-lift">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-road">Claims line</p>
            <a href={biz.supportPhoneHref} className="mt-2 block text-3xl font-extrabold hover:text-brand-deep sm:text-4xl">{biz.supportPhone}</a>
            <p className="mt-2 flex items-center gap-2 text-sm text-road"><Icon name="clock" size={16} /> {c.hours}</p>
            <p className="mt-4 text-sm leading-relaxed text-road">For mechanical breakdowns, call <strong className="text-asphalt">before</strong> the shop starts work so the repair can be authorized.</p>
            <a href={biz.supportPhoneHref} className="btn-primary mt-5 w-full"><Icon name="phone" size={18} /> Call to start a claim</a>
          </aside>
        }
      />

      <section className="bg-white">
        <div className="container-x py-16 md:py-20">
          <SectionHeading eyebrow="Mechanical breakdown" title="Three steps to a covered repair" />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["Get the car to a shop", "If a covered part fails, stop driving to prevent further damage and take the vehicle to any ASE-certified repair facility, including your trusted local mechanic."],
              ["Call us before work begins", `Call ${biz.supportPhone} during claims hours. We review the shop's diagnosis and authorize the covered repair under your contract.`],
              ["Pay only your deductible", "Authorized repairs are paid to the shop per your contract. You pay your deductible and any items that aren't covered, then drive away."],
            ].map(([t, b], i) => (
              <li key={t} className="relative rounded-3xl border border-rail p-7">
                <span aria-hidden className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-xl font-extrabold text-asphalt">{i + 1}</span>
                <h3 className="mt-5 text-xl font-extrabold text-asphalt">{t}</h3>
                <p className="mt-2 leading-relaxed text-road">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-x grid gap-8 py-16 md:grid-cols-2 md:py-20">
          <article className="rounded-3xl bg-white p-8 shadow-card">
            <IconBadge name="wrench" tone="soft" />
            <h2 className="mt-5 text-2xl font-extrabold text-asphalt">Maintenance claims</h2>
            <p className="mt-3 leading-relaxed text-road">{fillCompany(c.maintenanceIntro)}</p>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li className="flex items-start gap-3"><Icon name="phone" size={18} className="mt-0.5 shrink-0 text-brand-deep" /><span>Call <a href={biz.supportPhoneHref} className="font-bold text-asphalt hover:text-brand-deep">{biz.supportPhone}</a></span></li>
              <li className="flex items-start gap-3"><Icon name="mail" size={18} className="mt-0.5 shrink-0 text-brand-deep" /><span>Email your invoice to <a href={`mailto:${biz.claimsEmail}`} className="font-bold text-asphalt hover:text-brand-deep">{biz.claimsEmail}</a></span></li>
              <li className="flex items-start gap-3"><Icon name="clock" size={18} className="mt-0.5 shrink-0 text-brand-deep" /><span>{c.maintenanceHours}</span></li>
            </ul>
            <p className="mt-5 rounded-2xl bg-brand-soft p-4 text-sm leading-relaxed text-asphalt">{fillCompany(c.note)}</p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-card">
            <IconBadge name="file" tone="soft" />
            <h2 className="mt-5 text-2xl font-extrabold text-asphalt">What to have ready</h2>
            <p className="mt-3 leading-relaxed text-road">Having these details at hand makes the call quicker and gets the repair authorized sooner.</p>
            <ul className="mt-5 space-y-3">
              {READY.map((r) => (
                <li key={r} className="flex items-start gap-3 text-[15px] text-asphalt">
                  <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-asphalt"><Icon name="check" size={11} strokeWidth={3} /></span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-road">Questions about a claim? <Link href="/contact" className="font-bold text-asphalt hover:text-brand-deep">Send us a message</Link> or read the <Link href="/faq" className="font-bold text-asphalt hover:text-brand-deep">FAQ</Link>.</p>
          </article>
        </div>
      </section>

      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
