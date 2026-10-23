import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-keys";
import { json } from "@/lib/api";
import { livePosts } from "@/lib/blog";
import { db } from "@/lib/db";
import { getPlans } from "@/lib/plans";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

// Everything needed to plan internal links: main pages, plans, custom pages, categories, tags and
// every post (with its status), plus what this key is allowed to do. Any valid key may call it.
export async function GET(req: Request) {
  const caller = await authenticateApiKey(req);
  if (caller instanceof NextResponse) return caller;

  const [posts, categories, tags, pages, plans] = await Promise.all([
    db.post.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true, slug: true, status: true, publishedAt: true, excerpt: true, category: { select: { name: true } }, tags: { select: { name: true } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true, description: true } }),
    db.tag.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true, _count: { select: { posts: true } } } }),
    db.page.findMany({ where: { status: "published" }, select: { title: true, slug: true } }),
    getPlans(),
  ]);
  const live = new Set((await db.post.findMany({ where: livePosts(), select: { id: true } })).map((p) => p.id));
  const u = (p: string) => `${site.url}${p}`;

  return json({
    site: { name: site.name, url: site.url },
    key: { name: caller.keyName, scopes: caller.scopes, canPublish: caller.canPublish, canCreateCategories: caller.editor },
    rules: {
      content: "HTML. Start at <h2> (the page shows the title as H1). Allowed: p h2 h3 h4 strong em a ul ol li blockquote table img iframe(YouTube).",
      images: "Upload with POST /api/v1/media (multipart: file, alt), then use <img src=\"/media/<id>\" alt=\"...\"> or coverImageId.",
      limits: { seoTitle: 70, seoDescription: 200, excerpt: 300, tags: 12, coverAlt: 200 },
    },
    pages: [
      { title: "Home", url: u("/") },
      { title: "Get a free quote", url: u("/quote") },
      { title: "Protected plans (overview and comparison)", url: u("/plans") },
      ...plans.map((p) => ({ title: p.name, url: u(`/plans/${p.slug}`) })),
      { title: "Why Alyson", url: u("/why-alyson") },
      { title: "Benefits", url: u("/benefits") },
      { title: "Claims", url: u("/claims") },
      { title: "Car repair costs", url: u("/repair-costs") },
      { title: "FAQ", url: u("/faq") },
      { title: "About us", url: u("/about") },
      { title: "Contact", url: u("/contact") },
      { title: "Blog", url: u("/blog") },
      ...pages.map((p) => ({ title: p.title, url: u(`/${p.slug}`) })),
    ],
    plans: plans.map((p) => ({ slug: p.slug, name: p.name, kind: p.kind, url: u(`/plans/${p.slug}`) })),
    categories,
    tags: tags.map((t) => ({ name: t.name, slug: t.slug, posts: t._count.posts })),
    posts: posts.map((p) => ({
      id: p.id, title: p.title, slug: p.slug, status: p.status, live: live.has(p.id), publishedAt: p.publishedAt, url: u(`/blog/${p.slug}`),
      category: p.category?.name ?? null, tags: p.tags.map((t) => t.name), excerpt: p.excerpt,
    })),
  });
}
