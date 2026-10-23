import { livePosts } from "@/lib/blog";
import { db } from "@/lib/db";
import { getPlans } from "@/lib/plans";
import { fillCompany, getSettings, getSite } from "@/lib/settings";

export const dynamic = "force-dynamic";

const line = (s: string) => s.replace(/\s+/g, " ").trim();

// /llms.txt: a plain summary of the site for AI assistants (ChatGPT, Claude, Perplexity…),
// following the llmstxt.org format. Built from live content, so it's always up to date.
export async function GET() {
  const [{ ai, content }, biz, plans] = await Promise.all([getSettings(), getSite(), getPlans()]);
  if (!ai.llmsTxt) return new Response("Not found", { status: 404 });
  const u = (path: string) => `${biz.url}${path}`;

  const [posts, pages] = await Promise.all([
    db.post.findMany({ where: livePosts(), orderBy: { publishedAt: "desc" }, take: 50, select: { title: true, slug: true, excerpt: true } }),
    db.page.findMany({ where: { status: "published", noindex: false }, orderBy: { title: "asc" }, select: { title: true, slug: true, intro: true } }),
  ]);

  const out: string[] = [
    `# ${biz.name}`,
    "",
    `> ${line(biz.description)}`,
    "",
    line(
      `${biz.name} sells vehicle service contracts, often called extended auto warranties, to US drivers. Plans: ${plans.map((p) => p.name).join(", ")}. ` +
        `Benefits: 24/7 live claims line, free roadside assistance, repairs at any ASE-certified facility, a 30-day money-back guarantee and preferred pricing for AAA, AARP, PenFed, USAA, TriCare and VA members. ` +
        `A vehicle service contract is not insurance. Sales phone: ${biz.phone}. Customer support phone (existing contracts and claims): ${biz.supportPhone}. Email: ${biz.email}. Address: ${biz.addressLine}. Hours: ${biz.hours}.`,
    ),
    "",
    "## Main pages",
    `- [Get a free quote](${u("/quote")}): a short form; our team then contacts you with plan options and prices for your car.`,
    `- [Protected plans](${u("/plans")}): compare Platinum, Gold and Powertrain protection and the Prepaid Maintenance add-on.`,
    ...plans.map((p) => `- [${p.name}](${u(`/plans/${p.slug}`)}): ${line(fillCompany(p.summary))}`),
    `- [Why Alyson](${u("/why-alyson")}): ${line(fillCompany(content.whyIntro))}`,
    `- [Benefits](${u("/benefits")}): roadside assistance, any ASE-certified shop, money-back guarantee, affordable tiers, member pricing.`,
    `- [Claims](${u("/claims")}): how to file a mechanical breakdown or maintenance claim, hours and reimbursement.`,
    `- [Car repair costs](${u("/repair-costs")}): typical out-of-pocket costs of common car repairs.`,
    `- [FAQ](${u("/faq")}): what a vehicle service contract includes, what it costs and how it works.`,
    `- [About ${biz.name}](${u("/about")}): who we are, how claims work, how we research our guides and how we are paid.`,
    `- [Contact](${u("/contact")}): phone, email, address and a contact form.`,
    `- [Blog](${u("/blog")}): guides on extended auto warranties, vehicle service contracts and repair costs.`,
  ];

  if (posts.length) {
    out.push("", "## Blog posts");
    for (const p of posts) out.push(`- [${line(p.title)}](${u(`/blog/${p.slug}`)})${p.excerpt ? `: ${line(p.excerpt)}` : ""}`);
  }
  if (pages.length) {
    out.push("", "## More pages");
    for (const p of pages) out.push(`- [${line(p.title)}](${u(`/${p.slug}`)})${p.intro ? `: ${line(p.intro)}` : ""}`);
  }
  out.push("", "## Optional", `- [Privacy Policy](${u("/privacy")})`, `- [Terms and Conditions](${u("/terms")})`, `- [Do Not Sell or Share My Personal Information](${u("/do-not-sell")})`, "");

  return new Response(out.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
