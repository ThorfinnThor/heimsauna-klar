import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("out");
const productionFallbackUrl = "https://heimsauna-klar.shuu9599.workers.dev";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? productionFallbackUrl).replace(/\/$/, "");

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
  if (file === path.join(outputRoot, "index.html")) return "/";
  return `/${path.relative(outputRoot, file).replace(/index\.html$/, "").replace(/\.html$/, "").split(path.sep).join("/")}`;
}

function collectDuplicates(values, label) {
  const routesByValue = new Map();
  for (const { route, value } of values) {
    const routes = routesByValue.get(value) ?? [];
    routes.push(route);
    routesByValue.set(value, routes);
  }
  return [...routesByValue]
    .filter(([, routes]) => routes.length > 1)
    .map(([, routes]) => `Duplicate ${label}: ${routes.join(", ")}`);
}

const outputStats = await stat(outputRoot).catch(() => null);
if (!outputStats?.isDirectory()) throw new Error("Static output directory out/ is missing; run a production build first");

const htmlFiles = await collectHtmlFiles(outputRoot);
const publicPages = htmlFiles
  .map((file) => ({ file, route: routeForFile(file) }))
  .filter(({ route }) => !["/404", "/404/", "/_not-found/"].includes(route));
const issues = [];
const titles = [];
const descriptions = [];
const canonicals = [];
const productCopy = [];

function plainText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&times;", "×")
    .replace(/\s+/g, " ")
    .trim();
}

function containsInternalSentinel(value) {
  if (value === "none") return true;
  if (Array.isArray(value)) return value.some(containsInternalSentinel);
  if (value && typeof value === "object") return Object.values(value).some(containsInternalSentinel);
  return false;
}

for (const { file, route } of publicPages) {
  const html = await readFile(file, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
  const h1Count = (html.match(/<h1(?:\s[^>]*)?>/g) ?? []).length;

  if (!title) issues.push(`${route}: missing title`);
  if (!description) issues.push(`${route}: missing description`);
  if (!canonical) issues.push(`${route}: missing canonical`);
  if (h1Count !== 1) issues.push(`${route}: expected one h1, found ${h1Count}`);

  if (route.startsWith("/de/produkte/") && route !== "/de/produkte/") {
    const fragments = [...html.matchAll(/<p[^>]*data-product-copy="true"[^>]*>(.*?)<\/p>/gs)]
      .map((match) => plainText(match[1]))
      .filter(Boolean);
    if (fragments.length < 4) issues.push(`${route}: expected at least four product-specific text fragments, found ${fragments.length}`);
    if (fragments.some((fragment) => fragment.length < 70)) issues.push(`${route}: product-specific text fragment is too short`);
    if (fragments.some((fragment) => fragment.includes("nicht ausgewiesen und nicht ausgewiesen dokumentiert"))) {
      issues.push(`${route}: malformed missing-value sentence`);
    }
    for (const fragment of fragments) productCopy.push({ route, value: fragment });
  }

  const expectedCanonical = route === "/" ? `${siteUrl}/de/` : `${siteUrl}${route}`;
  if (canonical && canonical !== expectedCanonical) {
    issues.push(`${route}: canonical is ${canonical}, expected ${expectedCanonical}`);
  }

  for (const [index, match] of [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].entries()) {
    try {
      const structuredData = JSON.parse(match[1].replaceAll("&quot;", '"'));
      if (containsInternalSentinel(structuredData)) {
        issues.push(`${route}: JSON-LD block ${index + 1} exposes the internal sentinel "none"`);
      }
    } catch (error) {
      issues.push(`${route}: invalid JSON-LD block ${index + 1}: ${error.message}`);
    }
  }

  titles.push({ route, value: title });
  if (route !== "/") {
    descriptions.push({ route, value: description });
    canonicals.push({ route, value: canonical });
  }
}

issues.push(...collectDuplicates(titles, "title"));
issues.push(...collectDuplicates(descriptions, "description"));
issues.push(...collectDuplicates(canonicals, "canonical"));
issues.push(...collectDuplicates(productCopy, "product-specific copy"));

if (issues.length > 0) throw new Error(`Static SEO check failed:\n${issues.join("\n")}`);

console.log(`Static SEO check passed: ${publicPages.length} pages, unique titles, descriptions, canonicals and product-specific copy, one h1 per page, valid JSON-LD.`);
