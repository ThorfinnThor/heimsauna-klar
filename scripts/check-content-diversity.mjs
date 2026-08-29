import { readFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("out");
const collections = JSON.parse(await readFile(new URL("../content/de/collections.json", import.meta.url), "utf8"));
const guides = JSON.parse(await readFile(new URL("../content/de/planning-guides.json", import.meta.url), "utf8"));
const presentations = JSON.parse(await readFile(new URL("../content/de/page-presentations.json", import.meta.url), "utf8"));
const voltageGuide = JSON.parse(await readFile(new URL("../content/de/guides/230-v-sauna.json", import.meta.url), "utf8"));
const issues = [];
const renderedProfiles = new Map();
const editorialFragments = new Map();
const forbiddenStylePatterns = [
  [/Im nächsten Schritt/i, "Im nächsten Schritt"],
  [/Zuerst solltest du dir überlegen/i, "Zuerst solltest du dir überlegen"],
  [/Doch bevor wir dazu kommen/i, "Doch bevor wir dazu kommen"],
  [/Es ist wichtig zu beachten/i, "Es ist wichtig zu beachten"],
  [/In der heutigen Zeit/i, "In der heutigen Zeit"],
  [/Letztendlich kommt es darauf an/i, "Letztendlich kommt es darauf an"],
  [/Zusammenfassend lässt sich sagen/i, "Zusammenfassend lässt sich sagen"],
  [/Erst verstehen, was du brauchst\.\s*Dann Produkte vergleichen/i, "Erst verstehen, dann vergleichen"],
  [/Klarheit vor Kaufdruck/i, "Klarheit vor Kaufdruck"],
  [/Produkte, ohne erfundene Rangliste/i, "Produkte ohne erfundene Rangliste"],
  [/Nicht irgendeine Sauna/i, "Nicht irgendeine Sauna"],
  [/Harte Treffer/i, "Harte Treffer"],
];

function collectStrings(value, location, output = []) {
  if (typeof value === "string") output.push({ value, location });
  else if (Array.isArray(value)) value.forEach((item, index) => collectStrings(item, `${location}[${index}]`, output));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => collectStrings(item, `${location}.${key}`, output));
  return output;
}

for (const entry of [
  ...collectStrings(collections, "collections"),
  ...collectStrings(guides, "planning-guides"),
  ...collectStrings(presentations, "page-presentations"),
  ...collectStrings(voltageGuide, "230-v-guide"),
]) {
  for (const [pattern, label] of forbiddenStylePatterns) {
    if (pattern.test(entry.value)) issues.push(`${entry.location}: forbidden editorial phrase "${label}"`);
  }
}

function decodeText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&times;", "×")
    .replace(/\s+/g, " ")
    .trim();
}

function recordEditorialCopy(html, route, minimumFragments) {
  const fragments = [...html.matchAll(/<p[^>]*data-editorial-copy="true"[^>]*>(.*?)<\/p>/gs)]
    .map((match) => decodeText(match[1]))
    .filter(Boolean);
  if (fragments.length < minimumFragments) issues.push(`${route}: expected at least ${minimumFragments} substantial editorial fragments, found ${fragments.length}`);
  for (const fragment of fragments) {
    if (fragment.length < 110) issues.push(`${route}: editorial fragment is too short (${fragment.length} characters)`);
    const previousRoute = editorialFragments.get(fragment);
    if (previousRoute && previousRoute !== route) issues.push(`${route}: repeats editorial copy from ${previousRoute}`);
    editorialFragments.set(fragment, route);
  }
}

async function checkPage({ route, expectedProfile, expectedFlow, minimumFragments, kind }) {
  const file = path.join(outputRoot, route.replace(/^\//, ""), "index.html");
  const html = await readFile(file, "utf8").catch(() => null);
  if (!html) {
    issues.push(`${route}: static HTML is missing`);
    return;
  }
  const renderedKind = html.match(/data-page-kind="([^"]+)"/)?.[1];
  const renderedProfile = html.match(/data-page-profile="([^"]+)"/)?.[1];
  const moduleFlow = [...html.matchAll(/data-page-module="([^"]+)"/g)].map((match) => match[1]);
  if (renderedKind !== kind) issues.push(`${route}: rendered page kind is ${renderedKind ?? "missing"}`);
  if (renderedProfile !== expectedProfile) issues.push(`${route}: rendered profile does not match JSON presentation`);
  if (moduleFlow.join("|") !== [...expectedFlow, "related"].join("|")) {
    issues.push(`${route}: rendered module order is ${moduleFlow.join(" -> ")}`);
  }
  const previousRoute = renderedProfiles.get(renderedProfile);
  if (previousRoute) issues.push(`${route}: rendered profile duplicates ${previousRoute}`);
  renderedProfiles.set(renderedProfile, route);
  recordEditorialCopy(html, route, minimumFragments);
}

for (const collection of collections) {
  const presentation = presentations.collections[collection.id];
  const expectedProfile = [presentation.hero, presentation.results, presentation.method, presentation.flow.join("-")].join("|");
  await checkPage({
    route: `/de/${collection.section}/${collection.slug}`,
    expectedProfile,
    expectedFlow: presentation.flow,
    minimumFragments: 4,
    kind: "collection",
  });
}

for (const guide of guides) {
  const presentation = presentations.planning_guides[guide.slug];
  const expectedProfile = [presentation.hero, presentation.sections, presentation.insight_style, presentation.flow.join("-")].join("|");
  await checkPage({
    route: `/de/planung/${guide.slug}`,
    expectedProfile,
    expectedFlow: presentation.flow,
    minimumFragments: 5,
    kind: "planning-guide",
  });
}

if (issues.length > 0) throw new Error(`Content diversity check failed:\n${issues.join("\n")}`);

console.log(`Content diversity check passed: ${collections.length} collection pages and ${guides.length} planning guides have unique presentation profiles, intentional module order, and substantial non-duplicated editorial copy.`);
