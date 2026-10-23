import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icons";
import { PageHero } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { jsonLd } from "@/lib/security";
import { getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = "Contact Us";
const description = `Call, email or message ${site.name}. Quotes, plan questions, claims and billing: our team is here to help.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  ...ogMetadata({ eyebrow: "Contact", title: "Contact us today", subtitle: "Real people, quick answers." }, { url: "/contact", title: `${title} | ${site.name}`, description }),
};

export default async function ContactPage() {
  const biz = await getSite();
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${site.url}/contact#webpage`,
    url: `${site.url}/contact`,
    name: title,
    description,
    about: { "@id": `${site.url}/#organization` },
  };
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(biz.addressLine)}&output=embed`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <PageHero eyebrow="Contact" title={<>Contact us <span className="mark mark-dark">today</span></>} intro="Questions about a plan, a quote, a claim or your contract? Call us, send an email or use the form and we'll get right back to you." crumbs={[{ name: "Contact", href: "/contact" }]} />

      <section className="container-x grid gap-10 py-16 lg:grid-cols-[1.3fr_1fr] lg:gap-14 md:py-20">
        <div className="rounded-3xl border border-rail bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold text-asphalt">Send us a message</h2>
          <p className="mt-1 text-road">We reply during business hours, usually the same day.</p>
          <div className="mt-6"><ContactForm phone={biz.supportPhone} /></div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl bg-ink p-7 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-line">Already have a contract? Customer support</p>
            <a href={biz.supportPhoneHref} className="mt-2 block text-3xl font-extrabold hover:text-line">{biz.supportPhone}</a>
            <p className="mt-2 text-sm leading-relaxed text-white/70">Claims, coverage questions, cancellations and account changes. Claims line open 24/7 for mechanical breakdowns; for maintenance claims, email your invoice within 45 days of service.</p>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-line">New customers &amp; free quotes</p>
              <a href={biz.phoneHref} className="mt-2 block text-2xl font-extrabold hover:text-line">{biz.phone}</a>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/70"><Icon name="clock" size={16} /> {biz.hours}</p>
            </div>
          </div>
          <ul className="space-y-4 rounded-3xl border border-rail p-7 text-[15px]">
            <li className="flex items-start gap-3">
              <Icon name="mail" size={20} className="mt-0.5 shrink-0 text-brand-deep" />
              <span><span className="block text-xs font-bold uppercase tracking-wide text-road">Support</span><a href={`mailto:${biz.email}`} className="font-bold text-asphalt hover:text-brand-deep">{biz.email}</a></span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="wrench" size={20} className="mt-0.5 shrink-0 text-brand-deep" />
              <span><span className="block text-xs font-bold uppercase tracking-wide text-road">Claims & maintenance invoices</span><a href={`mailto:${biz.claimsEmail}`} className="font-bold text-asphalt hover:text-brand-deep">{biz.claimsEmail}</a></span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="pin" size={20} className="mt-0.5 shrink-0 text-brand-deep" />
              <span><span className="block text-xs font-bold uppercase tracking-wide text-road">Mailing address</span><span className="font-bold text-asphalt">{biz.addressLine}</span></span>
            </li>
          </ul>
          <div className="overflow-hidden rounded-3xl border border-rail">
            <iframe title={`Map showing ${biz.addressLine}`} src={mapSrc} width="600" height="260" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full" />
          </div>
          <p className="text-sm text-road">Looking for a price? <Link href="/quote" className="font-bold text-asphalt hover:text-brand-deep">Get a free quote</Link> in about a minute.</p>
        </aside>
      </section>
    </>
  );
}
