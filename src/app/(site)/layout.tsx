import { Analytics } from "@/components/Analytics";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollTop } from "@/components/ScrollTop";
import { SiteHeader } from "@/components/SiteHeader";
import { TrackingCapture } from "@/components/TrackingCapture";
import { visitorOptedOut } from "@/lib/legal";
import { jsonLd } from "@/lib/security";
import { getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

// Public website chrome. The admin area has its own layout.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [biz, { tracking, legal }] = await Promise.all([getSite(), getSettings()]);
  const phone = biz.phoneHref.replace("tel:", "");
  const support = biz.supportPhoneHref.replace("tel:", "");

  // Tells search engines who runs the site and how to reach them.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // Vehicle service contracts are not insurance, so a plain Organization (not InsuranceAgency).
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        alternateName: ["Alyson Auto", "AlysonAutoWarranty"],
        legalName: biz.agencyLegalName,
        url: `${site.url}/`,
        logo: { "@type": "ImageObject", url: `${site.url}/brand/logo-512.png`, width: 512, height: 512 },
        image: `${site.url}/opengraph-image`,
        description: site.description,
        telephone: support,
        email: biz.email,
        address: { "@type": "PostalAddress", streetAddress: biz.address.street, addressLocality: biz.address.city, addressRegion: biz.address.state, postalCode: biz.address.zip, addressCountry: "US" },
        areaServed: { "@type": "Country", name: "United States" },
        contactPoint: [
          { "@type": "ContactPoint", telephone: support, contactType: "customer service", email: biz.email, areaServed: "US", availableLanguage: "English" },
          { "@type": "ContactPoint", telephone: support, contactType: "claims", email: biz.claimsEmail, areaServed: "US", availableLanguage: "English" },
          { "@type": "ContactPoint", telephone: phone, contactType: "sales", areaServed: "US", availableLanguage: "English" },
        ],
        ...(biz.sameAs.length ? { sameAs: biz.sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        alternateName: ["Alyson Auto Warranty US", "alysonautowarrantyus.com"],
        description: site.description,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: "en-US",
      },
    ],
  };

  const optedOut = await visitorOptedOut(legal.honorGpc);
  return (
    <>
      <Analytics {...tracking} optedOut={optedOut} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
      <TrackingCapture />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:font-bold focus:text-asphalt">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
