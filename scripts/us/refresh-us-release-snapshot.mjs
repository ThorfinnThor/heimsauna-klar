import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const ids = (entries) => entries.map((entry) => entry.id);

const [snapshot, manifest, publication, products, configurations, sources, offers, editorial, productEditorial, legal, rights] = await Promise.all([
  readJson("docs/us/launch-snapshot.json"),
  readJson("docs/us/preview-manifest.json"),
  readJson("data/us/publication.json"),
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("data/us/offers.json"),
  readJson("content/us/editorial.json"),
  readJson("content/us/product-editorial.json"),
  readJson("content/us/legal.json"),
  readJson("docs/us/rights-register.json"),
]);

const releaseId = "us-indexed-first-wave-2026-09-16-sweat-kingdom-expanded";
manifest.snapshot_id = releaseId;
manifest.expected_page_count = manifest.routes.length;
const productRoutes = products.products
  .filter((product) => product.publication_status === "published")
  .map((product) => ({ path: `/us/saunas/${product.slug}/`, kind: "product", record_id: product.id, robots: "index, follow" }));
const nonProductRoutes = manifest.routes.filter((route) => route.kind !== "product");
manifest.routes = [...nonProductRoutes, ...productRoutes];
manifest.expected_page_count = manifest.routes.length;

snapshot.snapshot_id = releaseId;
snapshot.input_commit = "sweat-kingdom-affiliate-expansion-2026-09-16";
snapshot.purpose = "Public indexed US release with seventeen manually reviewed Sweat Kingdom merchant offers. Two hundred twenty-one research records stay candidates; feed synchronization and manufacturer image use remain disabled.";
snapshot.status = "public-indexed-first-wave";
snapshot.publication_controls = { ...publication };
snapshot.records = {
  ...snapshot.records,
  product_ids: ids(products.products),
  configuration_ids: ids(configurations.configurations),
  offer_ids: ids(offers.offers),
  editorial_page_ids: ids(editorial.entries),
  product_editorial_ids: ids(productEditorial.entries),
  legal_page_ids: ids(legal.pages),
  source_count: sources.sources.length,
  evidence_count: sources.evidence.length,
};
snapshot.rights = { ...snapshot.rights, asset_ids: rights.assets.map((entry) => entry.asset_id) };
snapshot.blocking_conditions = [
  "Awin feed synchronization is not enabled; new offers require an exact feed or manual review before activation.",
  "Manufacturer image rights are not documented for public product imagery; the release remains image-free.",
  "Physical small-screen and assistive-technology checks remain follow-up release checks.",
];

const hashPaths = snapshot.file_hashes.map((entry) => entry.path);
snapshot.file_hashes = await Promise.all(hashPaths.map(async (path) => ({
  path,
  sha256: createHash("sha256").update(await readFile(resolve(root, path))).digest("hex"),
})));

await Promise.all([
  writeJson("docs/us/launch-snapshot.json", snapshot),
  writeJson("docs/us/preview-manifest.json", manifest),
]);
console.log(`Refreshed ${releaseId}: ${products.products.length} products, ${offers.offers.length} offers, ${manifest.routes.length} routes.`);
