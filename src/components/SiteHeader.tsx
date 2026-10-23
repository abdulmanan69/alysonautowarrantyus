import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { Icon } from "@/components/Icons";
import { getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

// Everything here is set in /admin/menus and /admin/settings: links and dropdowns, phone,
// button, sticky header, the yellow top bar and the announcement bar.
export async function SiteHeader() {
  const [s, { navigation: nav }] = await Promise.all([getSite(), getSettings()]);
  const a = nav.announcement;
  const external = /^https?:\/\//.test(a.href);
  return (
    <>
      {nav.topBar && (
        <div className="bg-brand text-asphalt">
          <div className="container-x flex items-center justify-between gap-4 py-1.5 text-[13px] font-semibold">
            <p className="flex min-w-0 items-center gap-1.5">
              <Icon name="pin" size={15} />
              <span className="truncate">{s.addressLine}</span>
            </p>
            <div className="flex shrink-0 items-center gap-5">
              <span className="hidden items-center gap-1.5 xl:inline-flex">
                <Icon name="clock" size={15} />
                {s.hours}
              </span>
              <a href={s.supportPhoneHref} title="Customer support for existing contracts and claims" className="inline-flex items-center gap-1.5 hover:underline">
                <Icon name="headset" size={15} />
                <span className="hidden text-asphalt/70 lg:inline">Support</span>
                {s.supportPhone}
              </a>
              <a href={s.phoneHref} title="Sales and free quotes" className="hidden items-center gap-1.5 hover:underline sm:inline-flex">
                <Icon name="phone" size={15} />
                <span className="hidden text-asphalt/70 lg:inline">Sales</span>
                {s.phone}
              </a>
            </div>
          </div>
        </div>
      )}
      {a.enabled && a.text && (
        <div className="bg-coal px-5 py-2 text-center text-sm text-white">
          <span>{a.text}</span>
          {a.href && a.linkLabel && (
            <Link href={a.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="ml-2 font-semibold text-line underline underline-offset-4 hover:no-underline">
              {a.linkLabel} →
            </Link>
          )}
        </div>
      )}
      <header className={`${nav.sticky ? "sticky top-0" : "relative"} z-30 bg-ink text-white shadow-[0_1px_0_rgba(255,255,255,0.06)]`}>
        <div className="container-x flex items-center justify-between gap-6 py-3">
          <Link href="/" aria-label={`${site.name} home`} className="shrink-0">
            <img src="/brand/logo.webp" alt={site.name} width={400} height={321} className="h-14 w-auto sm:h-16" fetchPriority="high" />
          </Link>
          <HeaderNav links={nav.links} phone={nav.showPhone ? s.supportPhone : null} phoneHref={s.supportPhoneHref} salesPhone={s.phone} salesPhoneHref={s.phoneHref} ctaLabel={nav.ctaLabel} ctaHref={nav.ctaHref} siteName={site.name} />
        </div>
      </header>
    </>
  );
}
