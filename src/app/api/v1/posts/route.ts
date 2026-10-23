import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-keys";
import { apiError, json, pagination, postSelect, postView, readJson, resolveCategory, toPostInput } from "@/lib/api";
import { db } from "@/lib/db";
import { savePostAs } from "@/lib/post-save";

export const dynamic = "force-dynamic";

/** Lists posts (blog scope). ?status=draft|review|published ?page= ?limit=. Writers see only their own. */
export async function GET(req: Request) {
  const caller = await authenticateApiKey(req, "blog");
  if (caller instanceof NextResponse) return caller;
  const { skip, limit, page, params } = pagination(req, 50, 100);
  const status = params.get("status") ?? undefined;
  const where = { ...(caller.editor ? {} : { authorId: caller.saver.id }), ...(status && ["draft", "review", "published"].includes(status) ? { status } : {}) };
  const [rows, total] = await Promise.all([
    db.post.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take: limit, select: { ...postSelect, content: false } }),
    db.post.count({ where }),
  ]);
  return json({ page, limit, total, posts: rows.map(postView) });
}

/** Creates a post. Body: { title, content, slug?, excerpt?, category?, tags?, coverImageId?, coverAlt?, seoTitle?, seoDescription?, status?, publishAt? } */
export async function POST(req: Request) {
  const caller = await authenticateApiKey(req, "blog");
  if (caller instanceof NextResponse) return caller;
  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const cat = await resolveCategory(caller, body.category);
  if ("error" in cat) return apiError(400, cat.error);
  const input = toPostInput(body, cat.id);
  if ("error" in input) return apiError(400, input.error);

  const result = await savePostAs(caller.saver, input);
  if (!result.ok) return apiError(400, result.error);
  const post = await db.post.findUniqueOrThrow({ where: { id: result.id }, select: postSelect });
  return json({ message: result.message, post: postView(post) }, 201);
}
