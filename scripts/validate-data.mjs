import { readFile } from "node:fs/promises";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const archetypes = JSON.parse(await readFile(new URL("../data/sauna-archetypes.json", import.meta.url), "utf8"));
const voltageGuide = JSON.parse(await readFile(new URL("../content/de/guides/230-v-sauna.json", import.meta.url), "utf8"));
const sourceQueue = JSON.parse(await readFile(new URL("../data/source-queue.json", import.meta.url), "utf8"));

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
  if (!source.url.startsWith("https://")) throw new Error(`Source queue URL must use HTTPS: ${source.queue_id}`);
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
for (const product of products) {
  const required = ["product_id", "brand", "model", "category", "status", "dimensions_cm", "people", "power", "sauna", "commercial", "editorial", "sources", "updated_at"];
  const missing = required.filter((key) => product[key] === undefined || product[key] === null);
  if (missing.length) throw new Error(`${product.product_id ?? "<unknown>"} is missing: ${missing.join(", ")}`);
  if (productIds.has(product.product_id)) throw new Error(`Duplicate product_id: ${product.product_id}`);
  for (const dimension of ["width", "depth", "height"]) {
    if (!(product.dimensions_cm[dimension] > 0)) throw new Error(`${product.product_id} has an invalid ${dimension}`);
  }
  if (!(product.people.min >= 1) || product.people.max < product.people.min) {
    throw new Error(`${product.product_id} has an invalid people range`);
  }
  if (![120, 230, 400, "wood", "none"].includes(product.power.voltage)) {
    throw new Error(`${product.product_id} has an unsupported voltage`);
  }
  if (!Array.isArray(product.commercial.offers)) throw new Error(`${product.product_id} offers must be an array`);
  if (product.status === "verified" && product.sources.length === 0) {
    throw new Error(`${product.product_id} cannot be verified without sources`);
  }
  for (const source of product.sources) {
    if (!source.url?.startsWith("https://") || !source.checked_at) {
      throw new Error(`${product.product_id} has an invalid source`);
    }
  }
  productIds.add(product.product_id);
}

if (!voltageGuide.title || !Array.isArray(voltageGuide.sources) || voltageGuide.sources.length === 0) {
  throw new Error("230-V guide must have a title and at least one source");
}
for (const source of voltageGuide.sources) {
  if (!source.url?.startsWith("https://")) throw new Error("230-V guide contains an invalid source URL");
}

console.log(`Data check passed: ${products.length} products, ${archetypes.length} sauna types, 1 sourced guide, ${sourceQueue.length} queued sources.`);
