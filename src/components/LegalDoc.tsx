import Link from "next/link";
import { PageHero } from "@/components/sections";
import { withHeadingIds } from "@/lib/blog";
import { legalDate } from "@/lib/legal";
import { jsonLd } from "@/lib/security";
import { site } from "@/lib/site";

/** Privacy Policy / Terms layout: header, sticky table of contents, the document. */
export function LegalDoc({ title, path, html, updated, description }: { title: string; path: string; html: string; updated: string; description: string }) {
  const { html: body, toc } = withHeadingIds(html);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: `${site.url}${path}`,
    description,
    dateModified: updated,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    publisher: { "@id": `${site.url}/#organization` },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <PageHero eyebrow="Legal" title={title} crumbs={[{ name: title, href: path }]}>
        <p className="mt-5 text-sm text-white/60">
          Last updated <time dateTime={updated} className="font-semibold text-white">{legalDate(updated)}</time>
        </p>
      </PageHero>
      <div className="container-x py-12 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
        <aside className="mb-10 lg:mb-0">
          <nav aria-label="On this page" className="rounded-3xl bg-mist p-5 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-road">On this page</p>
            <ol className="mt-3 space-y-2 text-sm">
              {toc.filter((t) => t.level === 2).map((t) => (
                <li key={t.id}><a href={`#${t.id}`} className="block leading-snug text-road transition hover:text-asphalt">{t.text}</a></li>
              ))}
            </ol>
            <div className="mt-5 border-t border-rail pt-4 text-sm">
              <Link href="/do-not-sell" className="font-bold text-asphalt hover:text-brand-deep">Your privacy choices →</Link>
            </div>
          </nav>
        </aside>
        <div className="post-content max-w-3xl" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    </>
  );
}
