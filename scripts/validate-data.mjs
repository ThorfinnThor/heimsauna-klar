import { readFile } from "node:fs/promises";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const archetypes = JSON.parse(await readFile(new URL("../data/sauna-archetypes.json", import.meta.url), "utf8"));
const voltageGuide = JSON.parse(await readFile(new URL("../content/de/guides/230-v-sauna.json", import.meta.url), "utf8"));
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
}

if (!voltageGuide.title || !Array.isArray(voltageGuide.sources) || voltageGuide.sources.length === 0) {
  throw new Error("230-V guide must have a title and at least one source");
}
for (const source of voltageGuide.sources) {
  assertHttpsUrl(source.url, "230-V guide source URL");
}
assertIsoDate(voltageGuide.updated_at, "230-V guide updated_at");

console.log(`Data check passed: ${products.length} products in ${families.size} families, ${archetypes.length} sauna types, 1 sourced guide, ${sourceQueue.length} queued sources.`);
