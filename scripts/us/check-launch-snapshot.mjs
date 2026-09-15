import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");

async function readJson(path) {
  return JSON.parse(await readFile(resolve(projectRoot, path), "utf8"));
}

function values(entries, key = "id") {
  return entries.map((entry) => entry[key]);
}

function compareExactSet(actual, expected, path, issues) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const duplicates = actual.filter((value, index) => actual.indexOf(value) !== index);
  const missing = expected.filter((value) => !actualSet.has(value));
  const unexpected = actual.filter((value) => !expectedSet.has(value));
  if (duplicates.length > 0) issues.push(`${path}: duplicate values ${[...new Set(duplicates)].join(", ")}`);
  if (missing.length > 0) issues.push(`${path}: missing ${missing.join(", ")}`);
  if (unexpected.length > 0) issues.push(`${path}: unexpected ${unexpected.join(", ")}`);
}

function editorialPath(entry) {
  if (entry.page_type === "brand") return `/us/brands/${entry.slug}/`;
  if (entry.page_type === "comparison") return `/us/compare/${entry.slug}/`;
  if (entry.page_type === "guide") return `/us/guides/${entry.slug}/`;
  return null;
}

const [snapshot, manifest, publication, productsDocument, configurationsDocument, sourcesDocument, offersDocument, editorialDocument, productEditorialDocument, legalDocument, homeDocument, navigationDocument, affiliateDocument, presentationsDocument, rightsRegister] = await Promise.all([
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
  readJson("content/us/home.json"),
  readJson("content/us/navigation.json"),
  readJson("content/us/affiliate.json"),
  readJson("content/us/page-presentations.json"),
  readJson("docs/us/rights-register.json"),
]);

const issues = [];
if (snapshot.schema_version !== 1 || snapshot.market !== "US" || snapshot.status !== "public-noindex-beta") {
  issues.push("docs/us/launch-snapshot.json: must be schema version 1, market US and public-noindex-beta");
}
if (manifest.schema_version !== 1 || manifest.market !== "US" || manifest.mode !== "public-static-noindex-beta") {
  issues.push("docs/us/preview-manifest.json: must be schema version 1, market US and public-static-noindex-beta");
}
if (manifest.snapshot_id !== snapshot.snapshot_id) issues.push("preview manifest snapshot_id does not match launch snapshot");

const expectedPublicationControls = {
  routes_enabled: true,
  indexing_enabled: false,
  affiliate_links_enabled: false,
  feed_sync_enabled: false,
};
for (const [flag, expected] of Object.entries(expectedPublicationControls)) {
  if (publication[flag] !== expected) issues.push(`data/us/publication.json: ${flag} must be ${expected}`);
  if (snapshot.publication_controls?.[flag] !== publication[flag]) issues.push(`launch snapshot: ${flag} does not match publication controls`);
}

const products = productsDocument.products;
const configurations = configurationsDocument.configurations;
const offers = offersDocument.offers;
compareExactSet(values(products), snapshot.records?.product_ids ?? [], "snapshot product_ids", issues);
compareExactSet(values(configurations), snapshot.records?.configuration_ids ?? [], "snapshot configuration_ids", issues);
compareExactSet(values(offers), snapshot.records?.offer_ids ?? [], "snapshot offer_ids", issues);
compareExactSet(values(editorialDocument.entries), snapshot.records?.editorial_page_ids ?? [], "snapshot editorial_page_ids", issues);
compareExactSet(values(productEditorialDocument.entries), snapshot.records?.product_editorial_ids ?? [], "snapshot product_editorial_ids", issues);
compareExactSet(values(legalDocument.pages), snapshot.records?.legal_page_ids ?? [], "snapshot legal_page_ids", issues);
if (sourcesDocument.sources.length !== snapshot.records?.source_count) issues.push("snapshot source_count does not match data/us/sources.json");
if (sourcesDocument.evidence.length !== snapshot.records?.evidence_count) issues.push("snapshot evidence_count does not match data/us/sources.json");
if (offers.length !== 0) issues.push("protected launch snapshot must not contain an offer");

const configurationIds = new Set(values(configurations));
const productIds = new Set(values(products));
for (const product of products) {
  if (product.publication_status !== "candidate") issues.push(`product ${product.id}: public noindex beta requires candidate status`);
  if (product.configuration_ids.length !== 1 || !configurationIds.has(product.configuration_ids[0])) {
    issues.push(`product ${product.id}: must resolve to one snapshotted configuration`);
  }
}
for (const configuration of configurations) {
  if (configuration.publication_status !== "candidate") issues.push(`configuration ${configuration.id}: public noindex beta requires candidate status`);
  if (!productIds.has(configuration.product_id)) issues.push(`configuration ${configuration.id}: unknown product ${configuration.product_id}`);
}

for (const [label, document] of [
  ["navigation", navigationDocument],
  ["affiliate", affiliateDocument],
  ["legal", legalDocument],
  ["page presentations", presentationsDocument],
]) {
  if (document.status !== "draft") issues.push(`${label}: public noindex beta requires an explicit draft status`);
}
if (homeDocument.status !== "reviewed") issues.push("home: accepted public noindex beta content must have reviewed status");
if (editorialDocument.status !== "reviewed") issues.push("editorial: accepted public noindex beta content must have reviewed status");
if (productEditorialDocument.status !== "reviewed") issues.push("product editorial: accepted first-wave copy must have reviewed status");
for (const entry of editorialDocument.entries) {
  if (entry.publication_status !== "reviewed") issues.push(`editorial ${entry.id}: accepted public noindex beta content must have reviewed status`);
}
for (const entry of productEditorialDocument.entries) {
  if (entry.status !== "reviewed") issues.push(`product editorial ${entry.id}: accepted first-wave copy must have reviewed status`);
}
for (const page of legalDocument.pages) {
  if (page.publication_status !== "draft") issues.push(`legal ${page.id}: public noindex beta requires draft status`);
}

compareExactSet(values(rightsRegister.assets, "asset_id"), snapshot.rights?.asset_ids ?? [], "snapshot rights asset_ids", issues);
const rightsByProduct = new Map();
for (const asset of rightsRegister.assets) {
  if (asset.rights_status !== snapshot.rights?.required_status) issues.push(`rights ${asset.asset_id}: expected ${snapshot.rights?.required_status}`);
  if (asset.permission_basis !== "none") issues.push(`rights ${asset.asset_id}: permission_basis must remain none in this snapshot`);
  const current = rightsByProduct.get(asset.entity_id) ?? [];
  current.push(asset.asset_id);
  rightsByProduct.set(asset.entity_id, current);
}
for (const product of products) {
  if ((rightsByProduct.get(product.id) ?? []).length !== 1) issues.push(`product ${product.id}: needs exactly one explicit rights-register entry`);
}

const expectedRoutes = [
  "/us/",
  "/us/saunas/",
  "/us/sauna-finder/",
  "/us/brands/",
  "/us/compare/",
  "/us/compare/models/",
  "/us/guides/",
  ...editorialDocument.entries.map(editorialPath).filter(Boolean),
  ...legalDocument.pages.map((page) => `/us/${page.slug}/`),
  ...products.map((product) => `/us/saunas/${product.slug}/`),
];
const manifestRoutes = manifest.routes.map((route) => route.path);
if (manifest.expected_page_count !== manifest.routes.length) issues.push("preview manifest expected_page_count does not match its route list");
compareExactSet(manifestRoutes, expectedRoutes, "preview manifest routes", issues);
for (const route of manifest.routes) {
  if (route.robots !== "noindex, follow") issues.push(`${route.path}: public beta robots must be noindex, follow`);
  if (route.kind === "product" && !productIds.has(route.record_id)) issues.push(`${route.path}: unknown product record ${route.record_id}`);
}

for (const hashEntry of snapshot.file_hashes ?? []) {
  if (!/^[a-f0-9]{64}$/.test(hashEntry.sha256 ?? "")) {
    issues.push(`launch snapshot hash for ${hashEntry.path ?? "unknown"}: invalid sha256`);
    continue;
  }
  const file = await readFile(resolve(projectRoot, hashEntry.path));
  const actualHash = createHash("sha256").update(file).digest("hex");
  if (actualHash !== hashEntry.sha256) issues.push(`launch snapshot hash mismatch: ${hashEntry.path}`);
}

const serializedPreviewInput = JSON.stringify({ productsDocument, configurationsDocument, sourcesDocument, offersDocument, editorialDocument, productEditorialDocument, legalDocument, homeDocument });
for (const marker of manifest.forbidden_output_markers ?? []) {
  if (serializedPreviewInput.toLowerCase().includes(String(marker).toLowerCase())) issues.push(`public beta input contains forbidden marker ${marker}`);
}

if (issues.length > 0) throw new Error(`US launch snapshot check failed:\n${issues.join("\n")}`);

console.log(
  `US launch snapshot passed: ${snapshot.snapshot_id}; ${products.length} candidate products, `
  + `${configurations.length} configurations, ${offers.length} offers, ${manifest.routes.length} public noindex routes, `
  + `${rightsRegister.assets.length} explicit rights records.`,
);
