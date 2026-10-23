#!/usr/bin/env node
// Command-line client for the Alyson Auto Warranty API (/api/v1).
//
// Setup: create a key in Admin → API keys, then put this in .env.api (git-ignored):
//   API_URL=https://alysonautowarrantyus.com
//   API_KEY=aaw_...
//
// Usage:
//   node scripts/api-client.mjs site [--out site.json]            pages, plans, categories, tags, posts (for internal links)
//   node scripts/api-client.mjs posts [--status draft|review|published]
//   node scripts/api-client.mjs get <id-or-slug> [--out post.json]
//   node scripts/api-client.mjs create <post.json>                  create a post
//   node scripts/api-client.mjs update <id-or-slug> <post.json>     change only the fields in the file
//   node scripts/api-client.mjs upload <image> --alt "Alt text"     returns the image id
//   node scripts/api-client.mjs category "Name" [--description "..."]
//   node scripts/api-client.mjs plans                                 all protection plans
//   node scripts/api-client.mjs leads [--status new] [--since 2026-10-01] [--out leads.json]
//   node scripts/api-client.mjs lead <id>
//   node scripts/api-client.mjs messages [--status new]
//   node scripts/api-client.mjs settings <navigation|legal|content|business> [--out file]
//   node scripts/api-client.mjs settings-update <section> <file.json>
//     navigation: the whole menu object (as returned by "settings navigation")
//     legal: { "privacyHtml", "termsHtml" } or { "reset": "privacy" | "terms" | "both" }
//     content: any of { hero, stats, about, services, process, whyIntro, reasons, benefitsIntro, claims, faqs }
//
// post.json: { "title", "contentFile": "post.html" (or "content"), "slug", "excerpt", "category",
//   "tags": [..], "coverImageId", "coverAlt", "seoTitle", "seoDescription", "status": "draft"|"review"|"publish", "publishAt" }
// The key is never printed.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

async function loadEnv() {
  const file = path.resolve(process.cwd(), ".env.api");
  let text = "";
  try {
    text = await readFile(file, "utf8");
  } catch {
    fail(`Missing ${file}. Create it with API_URL and API_KEY.`);
  }
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  if (!env.API_URL || !/^https?:\/\//.test(env.API_URL)) fail("API_URL is missing or not a URL in .env.api");
  if (!env.API_KEY?.startsWith("aaw_")) fail("API_KEY is missing in .env.api (it starts with aaw_)");
  return { base: env.API_URL.replace(/\/$/, "") + "/api/v1", key: env.API_KEY };
}

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function flag(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
}

async function call(env, method, route, body, isForm = false) {
  const headers = { Authorization: `Bearer ${env.key}` };
  if (body && !isForm) headers["Content-Type"] = "application/json";
  const res = await fetch(env.base + route, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text.slice(0, 300) };
  }
  if (!res.ok) fail(`${res.status} ${data.error ?? res.statusText}`);
  return data;
}

async function readPost(file) {
  const dir = path.dirname(path.resolve(file));
  const post = JSON.parse(await readFile(file, "utf8"));
  if (post.contentFile) {
    post.content = await readFile(path.resolve(dir, post.contentFile), "utf8");
    delete post.contentFile;
  }
  return post;
}

async function out(args, data) {
  const file = flag(args, "--out");
  const text = JSON.stringify(data, null, 2);
  if (file) {
    await writeFile(file, text);
    console.log(`Saved to ${file}`);
  } else console.log(text);
}

const query = (pairs) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(pairs)) if (v) p.set(k, v);
  return p.size ? `?${p}` : "";
};

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || cmd === "--help" || cmd === "-h") {
    console.log((await readFile(new URL(import.meta.url), "utf8")).split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
    return;
  }
  const env = await loadEnv();
  switch (cmd) {
    case "site":
      return out(args, await call(env, "GET", "/site"));
    case "posts":
      return out(args, await call(env, "GET", `/posts${query({ status: flag(args, "--status") })}`));
    case "get": {
      const id = args.shift();
      if (!id) fail("get needs an id or slug");
      return out(args, await call(env, "GET", `/posts/${encodeURIComponent(id)}`));
    }
    case "create": {
      const file = args.shift();
      if (!file) fail("create needs a post.json file");
      const r = await call(env, "POST", "/posts", await readPost(file));
      console.log(`${r.message}\n${r.post.url}\nid: ${r.post.id}`);
      return;
    }
    case "update": {
      const id = args.shift();
      const file = args.shift();
      if (!id || !file) fail("update needs an id/slug and a post.json file");
      const r = await call(env, "PATCH", `/posts/${encodeURIComponent(id)}`, await readPost(file));
      console.log(`${r.message}\n${r.post.url}`);
      return;
    }
    case "upload": {
      const file = args.shift();
      const alt = flag(args, "--alt");
      if (!file || !alt) fail('upload needs an image file and --alt "description"');
      const form = new FormData();
      form.set("file", new Blob([await readFile(file)]), path.basename(file));
      form.set("alt", alt);
      const r = await call(env, "POST", "/media", form, true);
      console.log(`Uploaded: id ${r.id}\n${r.url}`);
      return;
    }
    case "category": {
      const name = args.shift();
      if (!name) fail("category needs a name");
      const r = await call(env, "POST", "/categories", { name, description: flag(args, "--description") });
      console.log(`Category: ${r.category.name} (/blog/category/${r.category.slug})`);
      return;
    }
    case "plans":
      return out(args, await call(env, "GET", "/plans"));
    case "leads":
      return out(args, await call(env, "GET", `/leads${query({ status: flag(args, "--status"), since: flag(args, "--since"), page: flag(args, "--page"), limit: flag(args, "--limit") })}`));
    case "lead": {
      const id = args.shift();
      if (!id) fail("lead needs an id");
      return out(args, await call(env, "GET", `/leads/${encodeURIComponent(id)}`));
    }
    case "messages":
      return out(args, await call(env, "GET", `/messages${query({ status: flag(args, "--status"), since: flag(args, "--since") })}`));
    case "settings": {
      const section = args.shift();
      if (!section) fail("settings needs a section: navigation, legal, content or business");
      return out(args, await call(env, "GET", `/settings/${section}`));
    }
    case "settings-update": {
      const section = args.shift();
      const file = args.shift();
      if (!section || !file) fail("settings-update needs a section and a JSON file");
      const body = JSON.parse(await readFile(file, "utf8"));
      const r = await call(env, section === "navigation" ? "PUT" : "PATCH", `/settings/${section}`, body);
      console.log(r.message);
      return;
    }
    default:
      fail(`Unknown command "${cmd}". Run with --help.`);
  }
}

main().catch((e) => fail(e.message));
