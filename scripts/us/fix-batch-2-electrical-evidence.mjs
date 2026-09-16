import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const path = resolve(root, "data/us/configurations.json");
const document = JSON.parse(await readFile(path, "utf8"));
let fixed = 0;
for (const configuration of document.configurations) {
  if (!/^(almost-heaven-|sun-home-|peak-denali)/.test(configuration.id)) continue;
  for (const option of configuration.electrical_supply_options ?? []) {
    if (!Array.isArray(option.evidence_ids)) {
      option.evidence_ids = [`evidence-${configuration.product_id}-configuration`];
      fixed += 1;
    }
  }
}
await writeFile(path, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Added evidence_ids to ${fixed} batch-2 electrical options.`);
