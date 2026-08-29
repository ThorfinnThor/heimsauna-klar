import { readFile } from "node:fs/promises";

const plan = JSON.parse(await readFile(new URL("../data/editorial-expansion-plan.json", import.meta.url), "utf8"));
const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"))
  .filter((product) => product.status === "verified");
const existingCollections = JSON.parse(await readFile(new URL("../content/de/collections.json", import.meta.url), "utf8"));
const existingGuides = JSON.parse(await readFile(new URL("../content/de/planning-guides.json", import.meta.url), "utf8"));

const supportedFilterKeys = new Set([
  "brands",
  "categories",
  "depth_max",
  "footprint_max",
  "footprint_min",
  "heater_contains",
  "height_max",
  "lying_places_min",
  "people_exact",
  "people_min",
  "price_max",
  "sauna_types",
  "voltages",
  "width_max",
  "wood_contains"
]);

function lowestPrice(product) {
  const prices = product.commercial.offers.map((offer) => offer.price).filter(Number.isFinite);
  return prices.length > 0 ? Math.min(...prices) : null;
}

function footprint(product) {
  return product.dimensions_cm.width * product.dimensions_cm.depth / 10_000;
}

function includesFolded(value, needle) {
  return value.toLocaleLowerCase("de").includes(needle.toLocaleLowerCase("de"));
}

function matches(product, filter) {
  const price = lowestPrice(product);
  const area = footprint(product);
  if (filter.brands && !filter.brands.includes(product.brand)) return false;
  if (filter.categories && !filter.categories.includes(product.category)) return false;
  if (filter.sauna_types && !filter.sauna_types.includes(product.sauna.type)) return false;
  if (filter.voltages && !filter.voltages.includes(product.power.voltage)) return false;
  if (filter.people_exact !== undefined && product.people.max !== filter.people_exact) return false;
  if (filter.people_min !== undefined && product.people.max < filter.people_min) return false;
  if (filter.price_max !== undefined && (price === null || price > filter.price_max)) return false;
  if (filter.footprint_min !== undefined && area < filter.footprint_min) return false;
  if (filter.footprint_max !== undefined && area > filter.footprint_max) return false;
  if (filter.width_max !== undefined && product.dimensions_cm.width > filter.width_max) return false;
  if (filter.depth_max !== undefined && product.dimensions_cm.depth > filter.depth_max) return false;
  if (filter.height_max !== undefined && product.dimensions_cm.height > filter.height_max) return false;
  if (filter.lying_places_min !== undefined && product.people.lying_places < filter.lying_places_min) return false;
  if (filter.heater_contains && !includesFolded(product.sauna.heater_type, filter.heater_contains)) return false;
  if (filter.wood_contains && !includesFolded(product.sauna.wood_type, filter.wood_contains)) return false;
  return true;
}

function assertText(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a non-empty string`);
}

if (plan.schema_version !== 1) throw new Error("Editorial expansion plan has an unsupported schema version");
if (!Array.isArray(plan.collections) || !Array.isArray(plan.guides)) throw new Error("Editorial expansion plan needs collections and guides");
if (plan.target_new_pages !== plan.collections.length + plan.guides.length) {
  throw new Error(`Editorial target says ${plan.target_new_pages}, but the plan contains ${plan.collections.length + plan.guides.length} pages`);
}

const existingRoutes = new Set(existingCollections.map((item) => `${item.section}/${item.slug}`));
const collectionIds = new Set();
const collectionRoutes = new Set();
const filterSignatures = new Map();
const candidateCounts = [];

for (const entry of plan.collections) {
  for (const key of ["id", "section", "slug", "working_title", "search_intent", "narrative_angle", "evidence_basis", "status"]) {
    assertText(entry[key], `Collection ${entry.id ?? "<unknown>"} ${key}`);
  }
  if (collectionIds.has(entry.id)) throw new Error(`Duplicate planned collection id: ${entry.id}`);
  collectionIds.add(entry.id);
  const route = `${entry.section}/${entry.slug}`;
  if (collectionRoutes.has(route)) throw new Error(`Duplicate planned collection route: ${route}`);
  if (existingRoutes.has(route) && entry.status !== "published") throw new Error(`Planned collection route already exists: ${route}`);
  if (entry.status === "published" && !existingRoutes.has(route)) throw new Error(`Published collection route is not in collections.json: ${route}`);
  collectionRoutes.add(route);
  if (!entry.filter || typeof entry.filter !== "object" || Array.isArray(entry.filter)) throw new Error(`${entry.id} needs a filter object`);
  for (const key of Object.keys(entry.filter)) {
    if (!supportedFilterKeys.has(key)) throw new Error(`${entry.id} uses unsupported filter ${key}`);
  }
  const signature = JSON.stringify(entry.filter, Object.keys(entry.filter).sort());
  if (filterSignatures.has(signature)) throw new Error(`${entry.id} repeats the filter of ${filterSignatures.get(signature)}`);
  filterSignatures.set(signature, entry.id);
  const matchesForEntry = products.filter((product) => matches(product, entry.filter));
  if (matchesForEntry.length < 7) throw new Error(`${entry.id} has only ${matchesForEntry.length} matching products`);
  candidateCounts.push({ id: entry.id, count: matchesForEntry.length });
}

const existingGuideSlugs = new Set(existingGuides.map((guide) => guide.slug));
const guideSlugs = new Set();
const guideTitles = new Set();
for (const entry of plan.guides) {
  for (const key of ["slug", "working_title", "cluster", "search_intent", "narrative_angle", "status"]) {
    assertText(entry[key], `Guide ${entry.slug ?? "<unknown>"} ${key}`);
  }
  if (guideSlugs.has(entry.slug) || existingGuideSlugs.has(entry.slug)) throw new Error(`Duplicate planned guide slug: ${entry.slug}`);
  guideSlugs.add(entry.slug);
  if (guideTitles.has(entry.working_title)) throw new Error(`Duplicate planned guide title: ${entry.working_title}`);
  guideTitles.add(entry.working_title);
  if (!Array.isArray(entry.required_sources) || entry.required_sources.length < 2) throw new Error(`${entry.slug} needs at least two source requirements`);
  entry.required_sources.forEach((source, index) => assertText(source, `${entry.slug} source requirement ${index + 1}`));
}

const counts = candidateCounts.map((item) => item.count);
console.log(
  `Editorial expansion plan passed: ${plan.collections.length} comparison pages and ${plan.guides.length} guides, `
  + `${Math.min(...counts)}-${Math.max(...counts)} matching products per comparison.`
);
