import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-14";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const products = await readJson("data/us/products.json");
const configurations = await readJson("data/us/configurations.json");
const sources = await readJson("data/us/sources.json");
const rights = await readJson("docs/us/rights-register.json");
const snapshot = await readJson("docs/us/launch-snapshot.json");
const manifest = await readJson("docs/us/preview-manifest.json");
const gate = await readJson("docs/us/sol-acceptance-gate.json");
const backlog = await readJson("docs/us/catalog-expansion-backlog.json");

const productIds = products.products.map((entry) => entry.id);
const configurationIds = configurations.configurations.map((entry) => entry.id);
const productRoutes = products.products.map((entry) => ({ path: `/us/saunas/${entry.slug}/`, kind: "product", record_id: entry.id, robots: "noindex, follow" }));
const nonProductRoutes = manifest.routes.filter((route) => route.kind !== "product");
manifest.snapshot_id = "us-protected-preview-2026-09-14-l100";
manifest.expected_page_count = nonProductRoutes.length + productRoutes.length;
manifest.routes = [...nonProductRoutes, ...productRoutes];

snapshot.snapshot_id = manifest.snapshot_id;
snapshot.purpose = "Protected static preview integration for the L-100 candidate dataset. This snapshot is not a production publication approval.";
snapshot.records.product_ids = productIds;
snapshot.records.configuration_ids = configurationIds;
snapshot.records.source_count = sources.sources.length;
snapshot.records.evidence_count = sources.evidence.length;
snapshot.rights.asset_ids = rights.assets.map((entry) => entry.asset_id);
snapshot.file_hashes = snapshot.file_hashes.map((entry) => {
  const content = readFileSync(resolve(root, entry.path));
  return { ...entry, sha256: createHash("sha256").update(content).digest("hex") };
});

gate.status = "ready-for-sol-review";
gate.current_snapshot = { ...gate.current_snapshot, candidate_product_count: products.products.length, candidate_configuration_count: configurations.configurations.length, products_remaining: 0, configurations_remaining: 0, status: "ready-for-sol-review" };
backlog.current_catalog = { ...backlog.current_catalog, candidate_product_count: products.products.length, products_remaining_before_sol_acceptance: 0 };
backlog.status = "ready-for-sol-review";
backlog.updated_at = today;

await writeJson("docs/us/preview-manifest.json", manifest);
await writeJson("docs/us/launch-snapshot.json", snapshot);
await writeJson("docs/us/sol-acceptance-gate.json", gate);
await writeJson("docs/us/catalog-expansion-backlog.json", backlog);
console.log(`Finalized protected L-100 snapshot with ${products.products.length} products, ${configurations.configurations.length} configurations, ${sources.sources.length} sources, ${sources.evidence.length} evidence records and ${rights.assets.length} rights records.`);
