import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("out");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://selectyoursauna.com").replace(/\/$/, "");
const usRoot = path.join(outputRoot, "us");

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(fullPath));
    else if (entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function routeForFile(file) {
  return `/${path.relative(outputRoot, file).replace(/index\.html$/, "").replace(/\.html$/, "/").split(path.sep).join("/")}`;
}

function routeForHref(href) {
  const url = new URL(href, `${siteUrl}/`);
  if (url.origin !== siteUrl || !url.pathname.startsWith("/us/")) return null;
  return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
}

const usStats = await stat(usRoot).catch(() => null);
if (!usStats?.isDirectory()) throw new Error("US SEO crawl needs the generated out/us directory before the publication output gate");

const allHtmlFiles = await collectHtmlFiles(outputRoot);
const allRoutes = new Set(allHtmlFiles.map(routeForFile));
const usFiles = allHtmlFiles.filter((file) => file.startsWith(`${usRoot}${path.sep}`) || file === path.join(usRoot, "index.html"));
const sitemap = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
const llms = await readFile(path.join(outputRoot, "llms.txt"), "utf8");
const issues = [];
const titles = new Map();
const hreflangByRoute = new Map();

for (const file of usFiles) {
  const route = routeForFile(file);
  const html = await readFile(file, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
  const expectedCanonical = `${siteUrl}${route}`;
  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map((match) => ({ locale: match[1], href: match[2] }));

  if (!html.includes('<html lang="en-US">')) issues.push(`${route}: html lang must be en-US`);
  if (!title) issues.push(`${route}: missing title`);
  if (!description) issues.push(`${route}: missing description`);
  if (canonical !== expectedCanonical) issues.push(`${route}: canonical is ${canonical || "missing"}, expected ${expectedCanonical}`);
  if (canonical.includes("/de/")) issues.push(`${route}: US page canonicalizes to the DE section`);

  const isNoindex = robots.includes("noindex");
  if (isNoindex && !robots.includes("follow")) issues.push(`${route}: noindex route must remain follow`);
  if (isNoindex && sitemapUrls.has(expectedCanonical)) issues.push(`${route}: noindex route is present in sitemap`);
  if (!isNoindex && !sitemapUrls.has(expectedCanonical)) issues.push(`${route}: indexable route is missing from sitemap`);

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const linkedRoute = routeForHref(match[1]);
    if (linkedRoute && !allRoutes.has(linkedRoute)) issues.push(`${route}: broken internal US link to ${linkedRoute}`);
  }

  for (const [index, match] of [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].entries()) {
    try {
      const schema = JSON.parse(match[1].replaceAll("&quot;", '"'));
      const serialized = JSON.stringify(schema);
      for (const forbidden of ["aggregateRating", "review", "gtin", "MerchantReturnPolicy", "OfferShippingDetails"]) {
        if (serialized.includes(`"${forbidden}"`)) issues.push(`${route}: JSON-LD block ${index + 1} contains unverified ${forbidden}`);
      }
    } catch (error) {
      issues.push(`${route}: invalid JSON-LD block ${index + 1}: ${error.message}`);
    }
  }

  const duplicateRoutes = titles.get(title) ?? [];
  duplicateRoutes.push(route);
  titles.set(title, duplicateRoutes);
  hreflangByRoute.set(route, alternates);
}

for (const [title, routes] of titles) {
  if (title && routes.length > 1) issues.push(`Duplicate US title "${title}": ${routes.join(", ")}`);
}

for (const [route, alternates] of hreflangByRoute) {
  for (const alternate of alternates) {
    const target = routeForHref(alternate.href);
    if (!target) continue;
    const reciprocal = hreflangByRoute.get(target)?.some((entry) => routeForHref(entry.href) === route);
    if (!reciprocal) issues.push(`${route}: hreflang ${alternate.locale} is not reciprocal with ${target}`);
  }
}

const usSitemapUrls = [...sitemapUrls].filter((url) => url.startsWith(`${siteUrl}/us/`));
if (usSitemapUrls.length === 0 && llms.includes("## United States section")) {
  issues.push("llms.txt exposes a US discovery section while the US sitemap set is empty");
}
for (const url of usSitemapUrls) {
  if (!llms.includes(url)) issues.push(`llms.txt is missing published US URL ${url}`);
}

if (issues.length > 0) throw new Error(`US SEO crawl failed:\n${issues.join("\n")}`);

console.log(`US SEO crawl passed: ${usFiles.length} generated US pages checked for en-US language, self canonicals, robots, sitemap membership, structured-data safety, reciprocal hreflang and internal links; ${usSitemapUrls.length} routes are currently discoverable.`);
