import type { Metadata } from "next";
import { FaqSection, PageHero, QuoteBanner } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { fillCompany, getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = "Extended Auto Warranty FAQ";
const description = "Answers to common questions about vehicle service contracts: what they cover, how claims are paid, cancellation and refunds, transferring your contract, repair shops and more.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  ...ogMetadata({ eyebrow: "FAQ", title: "Your questions, answered", subtitle: description }, { url: "/faq", title: `${title} | ${site.name}`, description }),
};

export default async function FaqPage() {
  const [{ content }, biz] = await Promise.all([getSettings(), getSite()]);
  const faqs = content.faqs.map((f, i) => ({ q: fillCompany(f.q), a: fillCompany(f.a), call: i === 0 }));
  return (
    <>
      <PageHero eyebrow="Frequently asked questions" title={<>Our <span className="mark mark-dark">FAQs</span></>} intro="Quick answers about extended auto warranties, also called vehicle service contracts: what they include, what they cost and how they work." crumbs={[{ name: "FAQ", href: "/faq" }]} />
      <FaqSection faqs={faqs} phone={biz.phone} phoneHref={biz.phoneHref} bare withSchema />
      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
