import Link from "next/link";
import { Icon } from "@/components/Icons";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSite } from "@/lib/settings";

// Overrides the site-wide "index, follow" so every robots tag on a 404 says noindex.
export const metadata = { title: "Page not found", description: "This page doesn't exist or has moved.", robots: { index: false, follow: true } };

const links = [
  { href: "/plans", label: "Protected plans", text: "Platinum, Gold and Powertrain coverage." },
  { href: "/claims", label: "File a claim", text: "Who to call and what to have ready." },
  { href: "/faq", label: "Questions", text: "Answers to common questions." },
];

// Shown for any unknown URL. It sits outside the (site) layout, so it adds the header and footer itself.
export default async function NotFound() {
  const biz = await getSite();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-white">
          <div className="container-x grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
            <div>
              <p className="eyebrow">Error 404</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Looks like this road is closed.</h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-road">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/" className="btn-primary">Back to home</Link>
                <Link href="/quote" className="btn-secondary">Get a free quote</Link>
              </div>
              <p className="mt-6 text-sm text-road">
                Need help now? Call our team at <a href={biz.phoneHref} className="font-bold text-asphalt hover:text-brand-deep">{biz.phone}</a>.
              </p>
            </div>
            <div aria-hidden className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 pb-10 pt-12 shadow-lift">
                <p className="text-center text-[7rem] font-black leading-none tracking-tight text-white sm:text-[8.5rem]">
                  4<span className="text-line">0</span>4
                </p>
                <div className="mx-auto mt-6 flex w-4/5 items-center justify-center gap-2">
                  {Array.from({ length: 6 }, (_, i) => <span key={i} className={`h-4 flex-1 rounded-sm ${i % 2 ? "bg-white" : "bg-brand"}`} />)}
                </div>
                <div className="lane absolute inset-x-0 bottom-0 h-2" />
              </div>
            </div>
          </div>
        </section>
        <section className="container-x pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-road/70">Popular pages</p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group block rounded-2xl border border-rail p-5 transition hover:border-brand hover:shadow-lift">
                  <span className="flex items-center justify-between font-bold">
                    {l.label}
                    <Icon name="arrow" size={18} className="text-road transition group-hover:translate-x-0.5 group-hover:text-brand-deep" />
                  </span>
                  <span className="mt-1 block text-sm text-road">{l.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
