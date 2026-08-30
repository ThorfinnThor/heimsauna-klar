import { readFile, writeFile } from "node:fs/promises";
import { buildProductIndexing } from "./product-indexing-policy.mjs";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const policy = JSON.parse(await readFile(new URL("../data/product-indexing-policy.json", import.meta.url), "utf8"));
const report = buildProductIndexing(products, policy);

await writeFile(
  new URL("../data/product-indexing.json", import.meta.url),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

console.log(
  `Product indexing generated: ${report.summary.index} index, ${report.summary.noindex} noindex, `
  + `${report.summary.total_verified_products} verified products.`,
);
