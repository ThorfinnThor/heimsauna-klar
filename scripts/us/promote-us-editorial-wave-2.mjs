import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-23";
const nextReviewAt = "2026-12-10";
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const writeJson = async (path, value) => writeFile(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`, "utf8");

const [plan, products, configurations, editorial] = await Promise.all([
  readJson("docs/us/indexing-readiness.json"),
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("content/us/product-editorial.json"),
]);

if (plan.third_wave?.status !== "sol-approved") {
  throw new Error("Third wave must be explicitly marked sol-approved before promotion.");
}
const waveIds = new Set(plan.third_wave.product_ids ?? []);
if (waveIds.size !== 16) throw new Error(`Expected 16 third-wave products, found ${waveIds.size}`);

const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationsByProductId = new Map();
for (const configuration of configurations.configurations) {
  const rows = configurationsByProductId.get(configuration.product_id) ?? [];
  rows.push(configuration);
  configurationsByProductId.set(configuration.product_id, rows);
}
const editorialByProductId = new Map(editorial.entries.map((entry) => [entry.product_id, entry]));

for (const productId of waveIds) {
  const product = productById.get(productId);
  const productConfigurations = configurationsByProductId.get(productId) ?? [];
  const copy = editorialByProductId.get(productId);
  if (!product) throw new Error(`${productId}: missing product`);
  if (productConfigurations.length === 0) throw new Error(`${productId}: missing configuration`);
  if (!copy || copy.status !== "published") throw new Error(`${productId}: publication copy is missing`);
  if (JSON.stringify({ product, productConfigurations }).includes('"status":"conflict"')) {
    throw new Error(`${productId}: unresolved conflict blocks publication`);
  }
  const supportedSources = new Set([
    ...product.source_ids,
    ...productConfigurations.flatMap((configuration) => configuration.source_ids),
  ]);
  if (!copy.source_ids.every((sourceId) => supportedSources.has(sourceId))) {
    throw new Error(`${productId}: editorial copy cites a source outside the exact record`);
  }
  product.publication_status = "published";
  product.content_updated_at = today;
  product.next_review_at = nextReviewAt;
  product.change_reason = "Sol-approved third US publication wave: source, technical data, product-specific copy, SEO, links, build and presentation checks completed.";
  for (const configuration of productConfigurations) configuration.publication_status = "published";
}

plan.third_wave.status = "published";
plan.third_wave.published_at = today;
plan.current_result.third_wave_editorial_reviewed = waveIds.size;
plan.current_result.third_wave_indexable_now = waveIds.size;
plan.current_result.public_products = products.products.filter((entry) => entry.publication_status === "published").length;

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("docs/us/indexing-readiness.json", plan),
]);

console.log(`Promoted ${waveIds.size} third-wave products; ${plan.current_result.public_products} US products are now public.`);
