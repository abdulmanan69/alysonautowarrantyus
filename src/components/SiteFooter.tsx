import Link from "next/link";
import { Icon, SOCIAL_LABELS, SocialIcon, type SocialName } from "@/components/Icons";
import { VSC_DISCLOSURE } from "@/lib/products";
import { getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const COLS: Record<number, string> = { 1: "sm:grid-cols-2", 2: "sm:grid-cols-3", 3: "sm:grid-cols-2 lg:grid-cols-4", 4: "sm:grid-cols-3 lg:grid-cols-5" };

// Link columns come from /admin/menus; contact details and social links from /admin/settings.
export async function SiteFooter() {
  const [s, { navigation: nav }] = await Promise.all([getSite(), getSettings()]);
  const socials = (Object.entries(s.social) as [SocialName, string][]).filter(([, url]) => /^https:\/\//.test(url));
  return (
    <footer className="mt-24 overflow-hidden bg-ink text-white/70">
      <div className="h-1.5 w-full bg-brand" aria-hidden />
      <div className={`container-x grid gap-10 pt-14 ${COLS[Math.min(4, nav.footerColumns.length)] ?? "sm:grid-cols-2"}`}>
        <div className="max-w-sm space-y-4 text-[14px] leading-relaxed sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label={`${site.name} home`} className="inline-block">
            <img src="/brand/logo.webp" alt={site.name} width={400} height={321} loading="lazy" decoding="async" className="h-16 w-auto" />
          </Link>
          <p>{s.licenseNote}</p>
          {socials.length > 0 && (
            <ul className="flex gap-2 pt-1">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[name]} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-brand hover:bg-brand hover:text-asphalt">
                    <SocialIcon name={name} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {nav.footerColumns.map((col) => (
          <nav key={col.id} aria-label={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-line">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {col.links.map((l) => {
                const ext = /^https?:\/\//.test(l.href) || !!l.newTab;
                return (
                  <li key={l.id}>
                    <Link href={l.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="break-words transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-line">Contact</p>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li>
              <a href={s.supportPhoneHref} className="flex items-start gap-2.5 transition hover:text-white">
                <Icon name="headset" size={18} className="mt-0.5 shrink-0 text-line" />
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-white/45">Customer support &amp; claims</span>
                  {s.supportPhone}
                </span>
              </a>
            </li>
            <li>
              <a href={s.phoneHref} className="flex items-start gap-2.5 transition hover:text-white">
                <Icon name="phone" size={18} className="mt-0.5 shrink-0 text-line" />
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-white/45">Sales &amp; free quotes</span>
                  {s.phone}
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`} className="flex items-start gap-2.5 break-all transition hover:text-white">
                <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-line" />
                <span>{s.email}</span>
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-line" />
              <span>{s.addressLine}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-line" />
              <span>{s.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-x mt-12 border-t border-white/10 pt-6 text-[13px] leading-relaxed">
        <p>{VSC_DISCLOSURE}</p>
        <div className="mt-4 flex flex-col gap-3 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.agencyLegalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms and Conditions</Link></li>
            <li><Link href="/do-not-sell" className="hover:text-white">Do Not Sell or Share My Personal Information</Link></li>
          </ul>
        </div>
      </div>

      {/* Wordmark drawn as SVG so it scales with the screen. The viewBox matches the natural width of
          "ALYSON AUTO WARRANTY" in Funnel Display 800 at 100px (measured: 1276 wide, 72 cap height), so the
          letters keep their real shape and spacing; textLength only kicks in if the font fails to load. */}
      <div aria-hidden className="mx-auto max-w-[1600px] px-5 pb-6 pt-2 text-white/[0.07]">
        <svg viewBox="0 0 1276 80" className="block h-auto w-full" preserveAspectRatio="xMidYMid meet">
          <text x="0" y="75" fontSize="100" fontWeight="800" textLength="1276" lengthAdjust="spacingAndGlyphs" fill="currentColor" style={{ letterSpacing: "-0.02em" }}>
            {site.name.toUpperCase()}
          </text>
        </svg>
      </div>
    </footer>
  );
}
