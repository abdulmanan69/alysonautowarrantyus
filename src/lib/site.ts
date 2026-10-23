// Built-in business defaults. Everything here can be overridden in Admin → Settings; the
// values below are used until they are saved there, and as the fallback for new fields.
export const site = {
  name: "Alyson Auto Warranty",
  shortName: "Alyson",
  // Public address of the live site, used for canonical links, the sitemap and share previews.
  // Set SITE_URL (e.g. https://alysonautowarrantyus.com) in the hosting environment.
  url: (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  description:
    "Alyson Auto Warranty offers extended auto warranty plans (vehicle service contracts) with 24/7 claims support, free roadside assistance, repairs at any ASE-certified shop and a 30-day money-back guarantee. Get a free quote today.",
  // Official profile pages on other sites (Facebook, Instagram, LinkedIn, BBB…). Shown in the
  // footer and added to the Organization data as sameAs.
  social: { facebook: "", instagram: "", linkedin: "", x: "", youtube: "" },
  phone: "(346) 229-3922",
  phoneHref: "tel:+13462293922",
  email: "support@alysonautowarranty.com",
  claimsEmail: "info@alysonautowarranty.com",
  address: { street: "8907 Creeks Gate Ct", city: "Richmond", state: "TX", zip: "77407" },
  hours: "Mon–Fri 8:00 AM–7:00 PM CT · Sat 8:00 AM–12:00 PM CT",
  agencyLegalName: "Alyson Auto Warranty",
  // Shown in the footer on every page: what the business is.
  licenseNote:
    "Alyson Auto Warranty offers vehicle service contracts, often called extended auto warranties. A vehicle service contract is not insurance and is backed and administered by the provider named in each contract.",
  // ─────────────────────────────────────────────────────────────
  // CONSENT TEXT: the client's lawyer must approve the final TCPA wording. Change the version
  // whenever the text changes so each lead records exactly what the user saw.
  // ─────────────────────────────────────────────────────────────
  consentVersion: "2026-10-23-v1",
  consentText:
    "By clicking “Get my free quote”, I agree that Alyson Auto Warranty and the vehicle service contract providers it works with may contact me about vehicle service contracts and related vehicle protection products at the phone number and email I provided, including by calls and texts that may use automated technology or prerecorded messages. Consent is not required to buy. Message and data rates may apply. I also agree to the Privacy Policy and Terms of Use.",
};

export type SocialLinks = typeof site.social;

/** "8907 Creeks Gate Ct, Richmond, TX 77407" */
export const formatAddress = (a: { street: string; city: string; state: string; zip: string }) =>
  [a.street, [a.city, [a.state, a.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")].filter(Boolean).join(", ");

/** tel: link from a US phone number in any format. */
export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;
