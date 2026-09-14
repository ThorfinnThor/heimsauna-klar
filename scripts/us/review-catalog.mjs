import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { reviewUsCatalog } from "../../lib/us/catalog-review.ts";

const projectRoot = resolve(import.meta.dirname, "../..");

function readJson(path) {
  return readFile(resolve(projectRoot, path), "utf8").then(JSON.parse);
}

function asOfArgument() {
  const index = process.argv.indexOf("--as-of");
  const value = index >= 0 ? process.argv[index + 1] : null;
  if (!value) throw new Error("Usage: npm run us:catalog:review -- --as-of YYYY-MM-DD");
  return value;
}

const asOf = asOfArgument();
const [products, sources, programs, rights, publication, policy] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/sources.json"),
  readJson("data/us/programs.json"),
  readJson("docs/us/rights-register.json"),
  readJson("data/us/publication.json"),
  readJson("data/us/catalog-review-policy.json"),
]);

const report = reviewUsCatalog({
  asOf,
  products: products.products,
  sources: sources.sources,
  programs: programs.programs,
  rights: rights.assets,
  publication,
  policy,
});

console.log(JSON.stringify(report, null, 2));
