import Link from "next/link";
import { Icon } from "@/components/Icons";
import { absoluteUrl, formatDate, mediaUrl, withHeadingIds, type PostCardData } from "@/lib/blog";
import type { BlogSettings } from "@/lib/settings";
import { AuthorAvatar, PostCard } from "./PostCard";
import { ShareButtons } from "./ShareButtons";

export type ArticleData = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: Date | null;
  updatedAt: Date;
  readingMinutes: number;
  coverImageId: string | null;
  coverAlt: string;
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  author: { name: string; bio: string; avatarId: string | null };
};

export function PostArticle({ post, related, blog }: { post: ArticleData; related: PostCardData[]; blog: BlogSettings }) {
  const { html, toc } = withHeadingIds(post.content);
  const cover = mediaUrl(post.coverImageId);
  const updated = post.publishedAt && post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000 ? post.updatedAt : null;
  const url = absoluteUrl(`/blog/${post.slug}`);
  const showToc = toc.filter((t) => t.level === 2).length >= 3;

  return (
    <article className="bg-white">
      <header className="mx-auto max-w-3xl px-5 pt-10 text-center md:pt-14">
        <nav aria-label="Breadcrumb" className="text-sm text-road">
          <ol className="flex flex-wrap items-center justify-center gap-1.5">
            <li><Link href="/" className="hover:text-asphalt">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/blog" className="hover:text-asphalt">Blog</Link></li>
            {post.category && (
              <>
                <li aria-hidden>/</li>
                <li><Link href={`/blog/category/${post.category.slug}`} className="hover:text-asphalt">{post.category.name}</Link></li>
              </>
            )}
          </ol>
        </nav>
        {post.category && <p className="eyebrow mt-6 justify-center">{post.category.name}</p>}
        <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-asphalt sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-road sm:text-xl">{post.excerpt}</p>}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-road">
          <span className="flex items-center gap-2.5">
            <AuthorAvatar name={post.author.name} avatarId={post.author.avatarId} size={36} />
            <span className="font-semibold text-asphalt">{post.author.name}</span>
          </span>
          <span aria-hidden>·</span>
          {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>}
          {updated && (
            <>
              <span aria-hidden>·</span>
              <span>Updated <time dateTime={updated.toISOString()}>{formatDate(updated)}</time></span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </header>

      {cover && (
        <figure className="mx-auto mt-10 max-w-5xl px-5">
          <img src={cover} alt={post.coverAlt} width={1280} height={720} fetchPriority="high" decoding="async" className="aspect-[16/9] w-full rounded-3xl object-cover shadow-lift" />
        </figure>
      )}

      <div className={`mx-auto mt-12 px-5 pb-16 ${showToc ? "max-w-6xl lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14" : "max-w-3xl"}`}>
        {showToc && (
          <aside className="mb-10 lg:mb-0">
            <nav aria-label="On this page" className="rounded-3xl border border-rail p-5 lg:sticky lg:top-28 lg:border-0 lg:p-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-road">On this page</p>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((t) => (
                  <li key={t.id} className={t.level === 3 ? "pl-4" : ""}>
                    <a href={`#${t.id}`} className="block leading-snug text-road transition hover:text-asphalt">{t.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}

        <div className="min-w-0 max-w-3xl">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />

          {blog.showQuoteCta && (
            <aside className="relative mt-14 overflow-hidden rounded-3xl bg-ink p-7 text-white sm:p-9">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_80%_at_90%_10%,rgba(255,187,0,0.3),transparent_60%)]" />
              <p className="relative text-2xl font-extrabold leading-tight sm:text-[1.7rem]">{blog.ctaTitle}</p>
              {blog.ctaText && <p className="relative mt-3 max-w-xl leading-relaxed text-white/75">{blog.ctaText}</p>}
              <Link href="/quote" className="btn-primary relative mt-6">
                Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} />
              </Link>
            </aside>
          )}

          <div className="mt-12 flex flex-col gap-6 border-t border-rail pt-8 sm:flex-row sm:items-center sm:justify-between">
            {post.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/blog/tag/${t.slug}`} className="rounded-full bg-mist px-3 py-1.5 text-sm font-medium text-asphalt hover:bg-brand-soft">#{t.name}</Link>
                  </li>
                ))}
              </ul>
            ) : <span />}
            <ShareButtons url={url} title={post.title} />
          </div>

          <section aria-label="About the author" className="mt-10 flex gap-5 rounded-3xl border border-rail bg-mist p-6">
            <AuthorAvatar name={post.author.name} avatarId={post.author.avatarId} size={64} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-road">Written by</p>
              <p className="mt-1 text-lg font-bold text-asphalt">{post.author.name}</p>
              {post.author.bio && <p className="mt-2 leading-relaxed text-road">{post.author.bio}</p>}
            </div>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-rail bg-mist">
          <div className="container-x py-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold text-asphalt sm:text-3xl">Keep reading</h2>
              <Link href="/blog" className="font-bold text-asphalt hover:text-brand-deep">All articles →</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
