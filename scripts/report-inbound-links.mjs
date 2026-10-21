// Counts inbound internal links per sitemap URL in the static export.
// A source page only counts when it is itself indexable (no robots noindex).
// "contextual" excludes the shared site header and footer navigation.
// Usage: node scripts/report-inbound-links.mjs [--json] [--summary] [--min-contextual=N]
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const outputRoot = path.resolve("out");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const summaryOnly = args.includes("--summary");
const minContextualArg = args.find((arg) => arg.startsWith("--min-contextual="));
const minContextual = minContextualArg ? Number(minContextualArg.split("=")[1]) : null;
// Home and trust pages are reached through the shared header and footer by design.
const chromeOnly = new Set(["/de/", "/de/ueber-uns/", "/de/rechtliches/", "/de/transparenz/affiliate/"]);

if (!existsSync(path.join(outputRoot, "sitemap.xml"))) {
  throw new Error("out/sitemap.xml is missing; run a production build with indexing enabled first");
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(fullPath));
    else if (entry.name === "index.html") files.push(fullPath);
  }
  return files;
}

function pagePath(file) {
  const relative = path.relative(outputRoot, path.dirname(file)).split(path.sep).join("/");
  return relative ? `/${relative}/` : "/";
}

function normalizeHref(href, siteOrigin) {
  let value = href.replaceAll("&amp;", "&");
  if (siteOrigin && value.startsWith(siteOrigin)) value = value.slice(siteOrigin.length);
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  value = value.split("#")[0].split("?")[0];
  if (!value) return null;
  if (!value.endsWith("/") && !path.posix.extname(value)) value = `${value}/`;
  return value;
}

function stripSharedChrome(html) {
  return html
    .replace(/<header class="site-header"[\s\S]*?<\/header>/g, "")
    .replace(/<footer[\s\S]*?<\/footer>/g, "");
}

function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*?\shref="([^"]+)"/g)].map((match) => match[1]);
}

const sitemap = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const siteOrigin = sitemapUrls[0] ? new URL(sitemapUrls[0]).origin : null;
const sitemapPaths = sitemapUrls.map((url) => new URL(url).pathname);
if (sitemapPaths.length === 0) {
  console.log("Inbound link report skipped: the sitemap is empty because indexing is disabled for this build.");
  process.exit(0);
}

const pages = new Map();
for (const file of await collectHtmlFiles(outputRoot)) {
  const html = await readFile(file, "utf8");
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
  pages.set(pagePath(file), { html, indexable: !/noindex/i.test(robots) });
}

const inbound = new Map(sitemapPaths.map((url) => [url, { all: new Set(), contextual: new Set() }]));
let linksToNoindexProducts = 0;
let linksToIndexableTargets = 0;

for (const [source, page] of pages) {
  if (!page.indexable) continue;
  const all = new Set(hrefs(page.html).map((href) => normalizeHref(href, siteOrigin)).filter(Boolean));
  const contextualHrefs = hrefs(stripSharedChrome(page.html)).map((href) => normalizeHref(href, siteOrigin)).filter(Boolean);
  const contextual = new Set(contextualHrefs);
  for (const target of contextualHrefs) {
    if (target === source) continue;
    if (/^\/de\/produkte\/[^/]+\/$/.test(target) && pages.get(target)?.indexable === false) linksToNoindexProducts += 1;
    else if (inbound.has(target)) linksToIndexableTargets += 1;
  }
  for (const target of all) {
    if (target === source || !inbound.has(target)) continue;
    inbound.get(target).all.add(source);
    if (contextual.has(target)) inbound.get(target).contextual.add(source);
  }
}

function stats(values) {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return { min: sorted[0], median, max: sorted.at(-1) };
}

const rows = [...inbound].map(([url, sets]) => ({ url, all: sets.all.size, contextual: sets.contextual.size }));
const groups = {
  de: rows.filter((row) => row.url.startsWith("/de/")),
  us: rows.filter((row) => row.url.startsWith("/us/")),
};
const summary = Object.fromEntries(Object.entries(groups).filter(([, list]) => list.length > 0).map(([key, list]) => [key, {
  urls: list.length,
  all: stats(list.map((row) => row.all)),
  contextual: stats(list.map((row) => row.contextual)),
  orphans: list.filter((row) => row.all === 0).map((row) => row.url),
  contextualOrphans: list.filter((row) => row.contextual === 0).map((row) => row.url),
}]));
summary.contextualLinkInstances = { toIndexableSitemapUrls: linksToIndexableTargets, toNoindexProducts: linksToNoindexProducts };

if (asJson) {
  console.log(JSON.stringify({ summary, rows }, null, 2));
} else {
  if (!summaryOnly) for (const row of rows.toSorted((a, b) => a.contextual - b.contextual || a.url.localeCompare(b.url))) {
    console.log(`${String(row.contextual).padStart(4)} ctx ${String(row.all).padStart(4)} all  ${row.url}`);
  }
  if (summaryOnly) {
    const de = summary.de;
    const content = stats(groups.de.filter((row) => !chromeOnly.has(row.url)).map((row) => row.contextual));
    console.log(`Inbound link report: ${de.urls} German sitemap URLs, ${de.orphans.length} orphans; contextual inbound links from indexable pages min ${content.min} / median ${content.median} (excluding home and trust pages).`);
  } else {
    console.log(JSON.stringify(summary, null, 2));
  }
}

if (minContextual !== null) {
  const weak = groups.de.filter((row) => !chromeOnly.has(row.url) && row.contextual < minContextual);
  if (weak.length > 0) {
    throw new Error(`Sitemap URLs with fewer than ${minContextual} contextual inbound links: ${weak.map((row) => `${row.url} (${row.contextual})`).join(", ")}`);
  }
}
