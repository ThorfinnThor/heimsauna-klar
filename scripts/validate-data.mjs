import { readFile } from "node:fs/promises";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const archetypes = JSON.parse(await readFile(new URL("../data/sauna-archetypes.json", import.meta.url), "utf8"));
const collections = JSON.parse(await readFile(new URL("../content/de/collections.json", import.meta.url), "utf8"));
const voltageGuide = JSON.parse(await readFile(new URL("../content/de/guides/230-v-sauna.json", import.meta.url), "utf8"));
const legal = JSON.parse(await readFile(new URL("../content/de/legal.json", import.meta.url), "utf8"));
const planningGuides = JSON.parse(await readFile(new URL("../content/de/planning-guides.json", import.meta.url), "utf8"));
const sourceQueue = JSON.parse(await readFile(new URL("../data/source-queue.json", import.meta.url), "utf8"));
const today = new Date().toISOString().slice(0, 10);
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(value, label) {
  if (typeof value !== "string" || !isoDatePattern.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${label} must be a valid ISO date`);
  }
  if (value > today) throw new Error(`${label} cannot be in the future`);
}

function assertHttpsUrl(value, label) {
  if (typeof value !== "string" || !value.startsWith("https://")) {
    throw new Error(`${label} must use HTTPS`);
  }
}

if (!Array.isArray(products)) throw new Error("data/products.json must contain an array");
if (!Array.isArray(archetypes) || archetypes.length === 0) {
  throw new Error("data/sauna-archetypes.json must contain at least one entry");
}
if (!Array.isArray(sourceQueue) || sourceQueue.length === 0) throw new Error("data/source-queue.json must contain queued sources");

if (!Array.isArray(planningGuides) || planningGuides.length === 0) throw new Error("content/de/planning-guides.json must contain planning guides");
const planningSlugs = new Set();
for (const guide of planningGuides) {
  for (const key of ["slug", "eyebrow", "title", "accent", "description", "updated_at", "summary"]) {
    if (typeof guide[key] !== "string" || guide[key].trim() === "") throw new Error(`Planning guide is missing ${key}`);
  }
  if (planningSlugs.has(guide.slug)) throw new Error(`Duplicate planning guide slug: ${guide.slug}`);
  planningSlugs.add(guide.slug);
  assertIsoDate(guide.updated_at, `Planning guide date for ${guide.slug}`);
  if (!Array.isArray(guide.sections) || guide.sections.length < 3) throw new Error(`${guide.slug} needs at least three sections`);
  for (const section of guide.sections) {
    if (!section.title || !section.copy || !Array.isArray(section.points) || section.points.length < 3) throw new Error(`${guide.slug} has an incomplete section`);
  }
  if (!Array.isArray(guide.checklist) || guide.checklist.length < 5) throw new Error(`${guide.slug} needs at least five checklist items`);
  if (!Array.isArray(guide.sources) || guide.sources.length < 2) throw new Error(`${guide.slug} needs at least two sources`);
  for (const source of guide.sources) {
    if (!source.title) throw new Error(`${guide.slug} has a source without a title`);
    assertHttpsUrl(source.url, `Planning guide source for ${guide.slug}`);
    assertIsoDate(source.checked_at, `Planning guide source date for ${guide.slug}`);
  }
}

if (!Array.isArray(collections) || collections.length === 0) throw new Error("content/de/collections.json must contain collections");
const collectionRoutes = new Set();
const collectionMatchers = {
  mini_indoor: (product) => ["indoor", "infrared"].includes(product.category) && product.dimensions_cm.width * product.dimensions_cm.depth <= 30_000,
  one_person_indoor: (product) => ["indoor", "infrared"].includes(product.category) && product.people.max === 1,
  small_garden: (product) => product.category === "outdoor" && product.dimensions_cm.width * product.dimensions_cm.depth <= 50_000,
  price_under_2500: (product) => product.commercial.offers.some((offer) => offer.price <= 2_500),
  two_person_indoor: (product) => ["indoor", "infrared"].includes(product.category) && product.people.max === 2,
  infrared: (product) => product.category === "infrared",
  bio_sauna: (product) => product.sauna.type === "Bio-Sauna",
  barrel_sauna: (product) => product.category === "outdoor" && product.model.toLowerCase().includes("fasssauna"),
  price_under_4000: (product) => product.commercial.offers.some((offer) => offer.price <= 4_000),
  four_person: (product) => product.people.max === 4,
};
for (const collection of collections) {
  for (const key of ["id", "section", "slug", "kind", "eyebrow", "title", "accent", "description", "intro", "rule", "sort"]) {
    if (typeof collection[key] !== "string" || collection[key].trim() === "") throw new Error(`Collection is missing ${key}`);
  }
  if (!["indoor-sauna", "outdoor-sauna", "vergleiche"].includes(collection.section)) {
    throw new Error(`Unsupported collection section: ${collection.id}`);
  }
  if (!["mini_indoor", "one_person_indoor", "small_garden", "price_under_2500", "two_person_indoor", "infrared", "bio_sauna", "barrel_sauna", "price_under_4000", "four_person"].includes(collection.rule)) {
    throw new Error(`Unsupported collection rule: ${collection.id}`);
  }
  if (!["footprint", "price"].includes(collection.sort)) throw new Error(`Unsupported collection sort: ${collection.id}`);
  if (!Array.isArray(collection.criteria) || collection.criteria.length < 3) throw new Error(`${collection.id} needs at least three criteria`);
  if (!Array.isArray(collection.checks) || collection.checks.length < 3) throw new Error(`${collection.id} needs at least three checks`);
  const route = `${collection.section}/${collection.slug}`;
  if (collectionRoutes.has(route)) throw new Error(`Duplicate collection route: ${route}`);
  collectionRoutes.add(route);
  if (!products.some((product) => product.status === "verified" && collectionMatchers[collection.rule](product))) {
    throw new Error(`${collection.id} has no matching verified products`);
  }
}

const queueIds = new Set();
for (const source of sourceQueue) {
  for (const key of ["queue_id", "manufacturer", "url", "target_category", "status", "notes"]) {
    if (typeof source[key] !== "string" || source[key].trim() === "") throw new Error(`Source queue entry is missing ${key}`);
  }
  assertHttpsUrl(source.url, `Source queue URL for ${source.queue_id}`);
  if (!["queued", "verified", "skipped"].includes(source.status)) {
    throw new Error(`Unsupported source queue status: ${source.queue_id}`);
  }
  if (!["indoor", "outdoor", "infrared", "portable", "tent"].includes(source.target_category)) {
    throw new Error(`Unsupported source queue category: ${source.queue_id}`);
  }
  if (![120, 230, 400, "wood", "none"].includes(source.target_voltage)) {
    throw new Error(`Unsupported source queue voltage: ${source.queue_id}`);
  }
  if (queueIds.has(source.queue_id)) throw new Error(`Duplicate source queue id: ${source.queue_id}`);
  queueIds.add(source.queue_id);
}

const archetypeIds = new Set();
for (const item of archetypes) {
  for (const key of ["id", "label", "title", "summary", "space", "power", "idealFor", "status"]) {
    if (typeof item[key] !== "string" || item[key].trim() === "") {
      throw new Error(`Archetype ${item.id ?? "<unknown>"} is missing ${key}`);
    }
  }
  if (archetypeIds.has(item.id)) throw new Error(`Duplicate archetype id: ${item.id}`);
  archetypeIds.add(item.id);
}

const productIds = new Set();
const productDisplayNames = new Set();
let affiliateOfferCount = 0;
for (const product of products) {
  const required = ["product_id", "brand", "model", "family", "category", "status", "dimensions_cm", "people", "power", "sauna", "commercial", "editorial", "sources", "updated_at"];
  const missing = required.filter((key) => product[key] === undefined);
  if (missing.length) throw new Error(`${product.product_id ?? "<unknown>"} is missing: ${missing.join(", ")}`);
  if (productIds.has(product.product_id)) throw new Error(`Duplicate product_id: ${product.product_id}`);
  const displayName = `${product.brand}|${product.model}`;
  if (productDisplayNames.has(displayName)) throw new Error(`Duplicate product display name: ${displayName}`);
  productDisplayNames.add(displayName);
  if (!["draft", "verified", "archived"].includes(product.status)) {
    throw new Error(`${product.product_id} has an unsupported status`);
  }
  if (!["indoor", "outdoor", "infrared", "portable", "tent"].includes(product.category)) {
    throw new Error(`${product.product_id} has an unsupported category`);
  }
  if (!["indoor", "outdoor"].includes(product.sauna.indoor_outdoor)) {
    throw new Error(`${product.product_id} has an unsupported installation location`);
  }
  if (["indoor", "outdoor"].includes(product.category) && product.sauna.indoor_outdoor !== product.category) {
    throw new Error(`${product.product_id} category and installation location do not match`);
  }
  if (product.category === "infrared" && product.sauna.indoor_outdoor !== "indoor") {
    throw new Error(`${product.product_id} infrared products must use an indoor installation location`);
  }
  if (product.family !== null) {
    for (const key of ["id", "name", "variant"]) {
      if (typeof product.family[key] !== "string" || product.family[key].trim() === "") {
        throw new Error(`${product.product_id} has an invalid family ${key}`);
      }
    }
    if (!/^[a-z0-9-]+$/.test(product.family.id)) {
      throw new Error(`${product.product_id} has an invalid family id`);
    }
  }
  for (const dimension of ["width", "depth", "height"]) {
    if (!(product.dimensions_cm[dimension] > 0)) throw new Error(`${product.product_id} has an invalid ${dimension}`);
  }
  if (!(product.people.min >= 1) || product.people.max < product.people.min) {
    throw new Error(`${product.product_id} has an invalid people range`);
  }
  if (!Number.isInteger(product.people.seats) || product.people.seats < 0 || product.people.seats > product.people.max) {
    throw new Error(`${product.product_id} has an invalid seat count`);
  }
  if (!Number.isInteger(product.people.lying_places) || product.people.lying_places < 0 || product.people.lying_places > product.people.max) {
    throw new Error(`${product.product_id} has an invalid lying-place count`);
  }
  if (![120, 230, 400, "wood", "none"].includes(product.power.voltage)) {
    throw new Error(`${product.product_id} has an unsupported voltage`);
  }
  if (product.power.kw !== null && !(product.power.kw > 0)) {
    throw new Error(`${product.product_id} has an invalid power rating`);
  }
  if (!Array.isArray(product.commercial.offers)) throw new Error(`${product.product_id} offers must be an array`);
  if (!["from", "current", "unavailable"].includes(product.commercial.price_status)) {
    throw new Error(`${product.product_id} has an unsupported price status`);
  }
  if (product.status === "verified" && product.commercial.price_status !== "unavailable" && product.commercial.offers.length === 0) {
    throw new Error(`${product.product_id} needs a checked offer for its published price`);
  }
  if (product.status === "verified" && product.sources.length === 0) {
    throw new Error(`${product.product_id} cannot be verified without sources`);
  }
  const offerKeys = new Set();
  for (const offer of product.commercial.offers) {
    if (typeof offer.merchant !== "string" || offer.merchant.trim() === "") {
      throw new Error(`${product.product_id} has an offer without a merchant`);
    }
    if (!(offer.price >= 0)) throw new Error(`${product.product_id} has an invalid offer price`);
    assertHttpsUrl(offer.url, `Offer URL for ${product.product_id}`);
    assertIsoDate(offer.last_checked, `Offer check date for ${product.product_id}`);
    if (typeof offer.affiliate !== "boolean") throw new Error(`${product.product_id} has an invalid affiliate flag`);
    if (offer.affiliate) affiliateOfferCount += 1;
    const offerKey = `${offer.merchant}|${offer.url}`;
    if (offerKeys.has(offerKey)) throw new Error(`${product.product_id} has a duplicate offer`);
    offerKeys.add(offerKey);
  }
  if (!Array.isArray(product.sources)) throw new Error(`${product.product_id} sources must be an array`);
  const sourceUrls = new Set();
  for (const source of product.sources) {
    assertHttpsUrl(source.url, `Source URL for ${product.product_id}`);
    assertIsoDate(source.checked_at, `Source check date for ${product.product_id}`);
    if (!["manufacturer", "manual", "merchant", "test"].includes(source.type)) {
      throw new Error(`${product.product_id} has an unsupported source type`);
    }
    if (sourceUrls.has(source.url)) throw new Error(`${product.product_id} has a duplicate source URL`);
    sourceUrls.add(source.url);
  }
  for (const offer of product.commercial.offers) {
    if (!sourceUrls.has(offer.url)) {
      throw new Error(`${product.product_id} has an offer URL without a matching published source`);
    }
  }
  if (product.status === "verified" && !product.sources.some((source) => ["manufacturer", "manual"].includes(source.type))) {
    throw new Error(`${product.product_id} needs an official manufacturer or manual source`);
  }
  assertIsoDate(product.updated_at, `Updated date for ${product.product_id}`);
  const latestEvidenceDate = [...product.sources.map((source) => source.checked_at), ...product.commercial.offers.map((offer) => offer.last_checked)].sort((a, b) => b.localeCompare(a))[0];
  if (latestEvidenceDate && product.updated_at < latestEvidenceDate) {
    throw new Error(`${product.product_id} updated_at predates its latest evidence`);
  }
  productIds.add(product.product_id);
}

const families = new Map();
for (const product of products.filter((item) => item.family !== null)) {
  const familyProducts = families.get(product.family.id) ?? [];
  familyProducts.push(product);
  families.set(product.family.id, familyProducts);
}
for (const [familyId, familyProducts] of families) {
  if (familyProducts.length < 2) throw new Error(`${familyId} must contain at least two products`);
  if (new Set(familyProducts.map((product) => product.family.name)).size !== 1) {
    throw new Error(`${familyId} has inconsistent family names`);
  }
  if (new Set(familyProducts.map((product) => product.brand)).size !== 1) {
    throw new Error(`${familyId} cannot span multiple brands`);
  }
  if (new Set(familyProducts.map((product) => product.category)).size !== 1) {
    throw new Error(`${familyId} cannot span multiple categories`);
  }
  if (new Set(familyProducts.map((product) => product.family.variant)).size !== familyProducts.length) {
    throw new Error(`${familyId} has duplicate variant labels`);
  }
}

const publishedSourceUrls = new Set(products.flatMap((product) => product.sources.map((source) => source.url)));
for (const source of sourceQueue) {
  if (source.status === "verified" && !publishedSourceUrls.has(source.url)) {
    throw new Error(`Verified queue entry has no published product source: ${source.queue_id}`);
  }
  if (source.status === "verified") {
    const linkedProducts = products.filter((product) => product.sources.some((item) => item.url === source.url));
    if (linkedProducts.some((product) => product.category !== source.target_category)) {
      throw new Error(`Verified queue category does not match published product: ${source.queue_id}`);
    }
  }
}

if (!voltageGuide.title || !Array.isArray(voltageGuide.sources) || voltageGuide.sources.length === 0) {
  throw new Error("230-V guide must have a title and at least one source");
}
for (const source of voltageGuide.sources) {
  assertHttpsUrl(source.url, "230-V guide source URL");
}
assertIsoDate(voltageGuide.updated_at, "230-V guide updated_at");

const legalText = JSON.stringify(legal);
if (process.env.SITE_INDEXABLE === "true" && (legalText.includes("[ergänzen]") || legal.notice?.startsWith("Vorab-Entwurf"))) {
  throw new Error("SITE_INDEXABLE cannot be enabled while the legal pages still contain draft placeholders");
}
if (affiliateOfferCount > 0 && legal.affiliate?.intro?.includes("nicht affiliiert")) {
  throw new Error("Affiliate offers are enabled, but the legal disclosure still says that all links are non-affiliate");
}

console.log(`Data check passed: ${products.length} products in ${families.size} families, ${collections.length} collections, ${archetypes.length} sauna types, ${planningGuides.length + 1} sourced guides, ${sourceQueue.length} queued sources.`);
