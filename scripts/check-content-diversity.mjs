import { readFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("out");
const collections = JSON.parse(await readFile(new URL("../content/de/collections.json", import.meta.url), "utf8"));
const guides = JSON.parse(await readFile(new URL("../content/de/planning-guides.json", import.meta.url), "utf8"));
const home = JSON.parse(await readFile(new URL("../content/de/home.json", import.meta.url), "utf8"));
const voltageGuide = JSON.parse(await readFile(new URL("../content/de/guides/230-v-sauna.json", import.meta.url), "utf8"));
const issues = [];
const orders = new Map();
const headings = new Map();
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
  // See docs/writing-style.md: no talk about our own records, no report German.
  [/Datens[aä]tz/i, "Datensatz"],
  [/\bbelegte?[nrs]?\b/i, "belegt"],
  [/dokumentiert/i, "dokumentiert"],
  [/verifiziert/i, "verifiziert"],
  [/nachvollziehbar/i, "nachvollziehbar"],
  [/Einordnung|einzuordnen|\bein(ge)?ordnen\b/i, "Einordnung"],
  [/ausgewiesen/i, "ausgewiesen"],
  [/rechnerisch/i, "rechnerisch"],
  [/Produktfläche|Planungsfläche|Raumlogik/i, "Produktfläche/Planungsfläche"],
  [/belastbar/i, "belastbar"],
  [/Momentaufnahme/i, "Momentaufnahme"],
  [/\bnicht\b[^.!?]{0,100}\bsondern\b/i, "nicht … sondern …"],
  [/↗|→/, "arrow in text"],
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
  ...collectStrings(home, "home"),
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
    if (fragment.length < 60) issues.push(`${route}: editorial fragment is too short (${fragment.length} characters)`);
    const previousRoute = editorialFragments.get(fragment);
    if (previousRoute && previousRoute !== route) issues.push(`${route}: repeats editorial copy from ${previousRoute}`);
    editorialFragments.set(fragment, route);
  }
}

async function checkPage({ route, blocks, tail, minimumFragments, kind }) {
  const file = path.join(outputRoot, route.replace(/^\//, ""), "index.html");
  const html = await readFile(file, "utf8").catch(() => null);
  if (!html) {
    issues.push(`${route}: static HTML is missing`);
    return;
  }
  if (html.match(/data-page-kind="([^"]+)"/)?.[1] !== kind) issues.push(`${route}: page kind is wrong`);
  const order = [...html.matchAll(/data-page-module="([^"]+)"/g)].map((match) => match[1]).join("|");
  const expected = [...blocks.map((block) => block.type), ...tail].join("|");
  if (order !== expected) issues.push(`${route}: rendered order ${order} does not match the JSON (${expected})`);
  orders.set(`${kind}:${expected}`, [...(orders.get(`${kind}:${expected}`) ?? []), route]);
  for (const block of blocks) {
    if (!block.heading) continue;
    const previous = headings.get(block.heading);
    if (previous && block.type === "text") issues.push(`${route}: repeats the heading "${block.heading}" from ${previous}`);
    if (block.type === "text") headings.set(block.heading, route);
  }
  if (/\{[a-z0-9_]+\}/.test(decodeText(html.match(/<article[\s\S]*<\/article>/)?.[0] ?? ""))) issues.push(`${route}: unfilled placeholder in the text`);
  recordEditorialCopy(html, route, minimumFragments);
}

for (const collection of collections) {
  await checkPage({ route: `/de/${collection.section}/${collection.slug}`, blocks: collection.blocks, tail: ["related"], minimumFragments: 2, kind: "collection" });
}
for (const guide of guides) {
  await checkPage({ route: `/de/planung/${guide.slug}`, blocks: guide.blocks, tail: ["sources", "related"], minimumFragments: 4, kind: "planning-guide" });
}

// Pages are written one by one. If one structure takes over, that stopped being true.
for (const [order, routes] of orders) {
  if (routes.length > 12) issues.push(`${order}: used by ${routes.length} pages`);
}

if (issues.length > 0) throw new Error(`Content diversity check failed:\n${issues.join("\n")}`);

console.log(`Content check passed: ${collections.length} comparison pages and ${guides.length} guides use ${orders.size} different structures, with no repeated text, no repeated headings and no banned phrases.`);
