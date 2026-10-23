import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { PageHero, QuoteBanner, RepairCostsSection, SectionHeading } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = "Car Repair Costs";
const description = "What common car repairs cost out of pocket: transmission, engine cylinder head, A/C compressor, alternator, suspension struts and more, and how an extended auto warranty helps.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/repair-costs" },
  ...ogMetadata({ eyebrow: "Repair costs", title: "Could you afford a $3,000 repair bill today?", subtitle: "Typical out-of-pocket costs of common repairs.", price: "$3,000", priceNote: "average transmission repair", image: "/images/parts/transmission.webp" }, { url: "/repair-costs", title: `${title} | ${site.name}`, description }),
};

export default async function RepairCostsPage() {
  const [{ content }, biz] = await Promise.all([getSettings(), getSite()]);
  const costs = Object.entries(content.repairCosts);
  return (
    <>
      <PageHero
        eyebrow="Repair costs"
        title={<>Could you afford a <span className="mark mark-dark">$3,000 repair bill</span> today?</>}
        intro="Select any part of the car below to see what a typical repair costs out of pocket. A vehicle service contract helps pay for repairs to the parts it lists, so a breakdown doesn't become a financial emergency."
        crumbs={[{ name: "Repair costs", href: "/repair-costs" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote" className="btn-primary">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
          <Link href="/plans" className="btn-ghost-light">See what plans cover</Link>
        </div>
      </PageHero>

      <RepairCostsSection costs={content.repairCosts} bare />

      <section className="bg-mist">
        <div className="container-x py-16 md:py-20">
          <SectionHeading eyebrow="At a glance" title="Typical out-of-pocket repair costs" intro="Average costs without a service contract. Your price depends on your vehicle, where you live and the repair facility." />
          <div className="mt-10 overflow-hidden rounded-3xl border border-rail bg-white shadow-card">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-mist text-xs font-semibold uppercase tracking-wide text-road">
                <tr><th scope="col" className="px-5 py-3">Repair</th><th scope="col" className="px-5 py-3 text-right">Average cost</th></tr>
              </thead>
              <tbody className="divide-y divide-rail">
                {costs.map(([part, cost]) => (
                  <tr key={part}>
                    <th scope="row" className="px-5 py-3.5 font-medium text-asphalt">{part}</th>
                    <td className="px-5 py-3.5 text-right font-extrabold tabular-nums text-asphalt">{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Repairs arrive at the worst time", "Most breakdowns happen without warning. A plan turns a surprise bill into a predictable monthly amount."],
              ["Labor rates keep rising", "Parts and labor for modern cars, especially electronics and hi-tech systems, cost more every year."],
              ["Any ASE-certified shop", "Keep using the mechanic you trust. Covered repairs are paid to the shop; you pay your deductible."],
            ].map(([t, b]) => (
              <article key={t} className="rounded-3xl bg-white p-6 shadow-card">
                <h3 className="text-lg font-extrabold text-asphalt">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-road">{b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
