import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const gate = JSON.parse(await readFile(resolve(projectRoot, "docs/us/sol-acceptance-gate.json"), "utf8"));
const products = JSON.parse(await readFile(resolve(projectRoot, "data/us/products.json"), "utf8"));
const configurations = JSON.parse(await readFile(resolve(projectRoot, "data/us/configurations.json"), "utf8"));
const strict = process.argv.includes("--strict");

const productCount = products.products.length;
const configurationCount = configurations.configurations.length;
const productGap = Math.max(0, gate.acceptance.minimum_candidate_products - productCount);
const configurationGap = Math.max(0, gate.acceptance.minimum_candidate_configurations - configurationCount);
const ready = productGap === 0 && configurationGap === 0;
const report = {
  status: ready ? "ready-for-sol-review" : "blocked",
  productCount,
  configurationCount,
  requiredProductCount: gate.acceptance.minimum_candidate_products,
  requiredConfigurationCount: gate.acceptance.minimum_candidate_configurations,
  productsRemaining: productGap,
  configurationsRemaining: configurationGap,
};

console.log(JSON.stringify(report, null, 2));
if (strict && !ready) {
  process.exitCode = 1;
}
