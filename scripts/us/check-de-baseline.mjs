import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const baseline = JSON.parse(await readFile(resolve(projectRoot, "docs/us/de-data-baseline.json"), "utf8"));
const issues = [];

for (const [relativePath, expectedHash] of Object.entries(baseline.files)) {
  const contents = await readFile(resolve(projectRoot, relativePath));
  const actualHash = createHash("sha256").update(contents).digest("hex");
  if (actualHash !== expectedHash) issues.push(`${relativePath}: ${actualHash} != ${expectedHash}`);
}

const products = JSON.parse(await readFile(resolve(projectRoot, "data/products.json"), "utf8"));
const merchants = JSON.parse(await readFile(resolve(projectRoot, "data/merchants.json"), "utf8"));
const productIndexing = JSON.parse(await readFile(resolve(projectRoot, "data/product-indexing.json"), "utf8"));
const productIds = new Set(products.map((product) => product.product_id));
const activeAffiliateOffers = products.flatMap((product) => product.commercial?.offers ?? [])
  .filter((offer) => offer.affiliate === true && typeof offer.affiliate_url === "string" && offer.affiliate_url.length > 0);
const actualMetrics = {
  product_count: products.length,
  merchant_count: merchants.length,
  indexable_product_count: productIndexing.entries.filter((entry) => entry.decision === "index").length,
  active_affiliate_offer_count: activeAffiliateOffers.length,
};

if (productIds.size !== products.length) issues.push("data/products.json: duplicate product IDs detected");
for (const [metric, expected] of Object.entries(baseline.metrics)) {
  if (actualMetrics[metric] !== expected) issues.push(`${metric}: ${actualMetrics[metric]} != ${expected}`);
}

if (issues.length > 0) {
  throw new Error(`DE baseline drift detected:\n- ${issues.join("\n- ")}`);
}

console.log(
  `DE baseline unchanged at ${baseline.source_commit.slice(0, 7)}: ${actualMetrics.product_count} products, `
    + `${actualMetrics.indexable_product_count} indexable product pages, ${actualMetrics.merchant_count} merchants and `
    + `${actualMetrics.active_affiliate_offer_count} active affiliate offers across ${Object.keys(baseline.files).length} protected files.`,
);
