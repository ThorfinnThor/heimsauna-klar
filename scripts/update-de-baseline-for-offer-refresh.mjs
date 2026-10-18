// Records an automated offer refresh in docs/us/de-data-baseline.json.
// Only offer prices, availability and check dates may change: the script fails
// when any baseline metric (product, merchant, indexable or affiliate counts)
// or any other baselined file differs, so the DE guard still catches real
// catalogue changes.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const ALLOWED = new Set(["data/products.json", "data/product-indexing.json"]);
const today = new Date().toISOString().slice(0, 10);

const baselineUrl = new URL("docs/us/de-data-baseline.json", root);
const baseline = JSON.parse(await readFile(baselineUrl, "utf8"));
const products = JSON.parse(await readFile(new URL("data/products.json", root), "utf8"));
const merchants = JSON.parse(await readFile(new URL("data/merchants.json", root), "utf8"));
const indexing = JSON.parse(await readFile(new URL("data/product-indexing.json", root), "utf8"));

const metrics = {
  product_count: products.length,
  merchant_count: merchants.length,
  indexable_product_count: indexing.entries.filter((entry) => entry.decision === "index").length,
  active_affiliate_offer_count: products.flatMap((product) => product.commercial?.offers ?? [])
    .filter((offer) => offer.affiliate === true && typeof offer.affiliate_url === "string" && offer.affiliate_url.length > 0).length,
};
const issues = Object.entries(baseline.metrics)
  .filter(([metric, expected]) => metrics[metric] !== expected)
  .map(([metric, expected]) => `${metric}: ${metrics[metric]} != ${expected}`);

let changed = 0;
for (const [path, expected] of Object.entries(baseline.files)) {
  const actual = createHash("sha256").update(await readFile(new URL(path, root))).digest("hex");
  if (actual === expected) continue;
  if (!ALLOWED.has(path)) issues.push(`${path} changed outside an offer refresh`);
  else { baseline.files[path] = actual; changed += 1; }
}

if (issues.length > 0) throw new Error(`Refusing to update the DE baseline:\n- ${issues.join("\n- ")}`);
if (changed > 0) {
  baseline.captured_at = today;
  await writeFile(baselineUrl, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
}
console.log(`DE baseline: ${changed} offer file hash(es) updated, metrics unchanged.`);
