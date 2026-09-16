import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";
const merchant = {
  id: "saunacompanyusa",
  name: "Sauna Company USA",
  host: "https://saunacompanyusa.com",
  publisher: "Sauna Company USA",
};

// Exact product URLs checked on the official Sauna Company USA collection and
// product pages. Records intentionally remain candidates until specification
// and rights review is complete.
const candidates = [
  ["thermasol-aalto", "ThermaSol Aalto Sauna Cabin", "ThermaSol", "thermasol-aalto-sauna-cabin", "traditional", "indoor", "sauna-cabin", 4],
  ["thermasol-nordic-misty", "ThermaSol Nordic Misty Sauna Cabin", "ThermaSol", "thermasol-nordic-misty-sauna-cabin", "traditional", "outdoor", "sauna-cabin", 3],
  ["thermasol-nordic-dawn", "ThermaSol Nordic Dawn Sauna Cabin", "ThermaSol", "thermasol-nordic-dawn-sauna-cabin", "traditional", "outdoor", "sauna-cabin", 3],
  ["thermasol-spectra", "ThermaSol Spectra Sauna Cabin", "ThermaSol", "thermasol-spectra-sauna-cabin", "traditional", "outdoor", "sauna-cabin", 4],
  ["thermasol-vera", "ThermaSol Vera Sauna Cabin", "ThermaSol", "thermasol-vera-sauna-cabin", "traditional", "outdoor", "sauna-cabin", 3],
  ["thermasol-vue", "ThermaSol Vue Sauna Cabin", "ThermaSol", "thermasol-vue-sauna-cabin", "traditional", "outdoor", "sauna-cabin", 4],
  ["finnmark-fd-1", "Finnmark FD-1 Full-Spectrum Infrared Sauna", "Finnmark", "finnmark-fd-1", "infrared", "indoor", "sauna-cabin", 2],
  ["finnmark-fd-2", "Finnmark FD-2 Full-Spectrum Infrared Sauna", "Finnmark", "finnmark-fd-2", "infrared", "indoor", "sauna-cabin", 3],
  ["finnmark-fd-3", "Finnmark FD-3 Full-Spectrum Infrared Sauna", "Finnmark", "finnmark-fd-3", "infrared", "indoor", "sauna-cabin", 4],
  ["finnmark-fd-4", "Finnmark FD-4 Trinity Infrared and Steam Sauna", "Finnmark", "finnmark-fd-4", "traditional", "indoor", "sauna-cabin", 4],
  ["finnmark-fd-5", "Finnmark FD-5 Trinity XL Infrared and Steam Sauna", "Finnmark", "finnmark-fd-5", "traditional", "indoor", "sauna-cabin", 5],
  ["finnmark-fd-6", "Finnmark FD-6 Cedar Combination Barrel Sauna", "Finnmark", "finnmark-fd-6", "traditional", "outdoor", "sauna-kit", 5],
  ["finnmark-fd-7", "Finnmark FD-7 Thermo-Aspen Combination Barrel Sauna", "Finnmark", "finnmark-fd-7", "traditional", "outdoor", "sauna-kit", 5],
].map(([handle, model, brand, path, heat, placement, productType, capacity]) => ({
  id: handle,
  model,
  brand,
  url: `${merchant.host}/products/${path}`,
  heat,
  placement,
  productType,
  capacity,
}));

const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const productsDocument = await readJson("data/us/products.json");
const configurationsDocument = await readJson("data/us/configurations.json");
const sourcesDocument = await readJson("data/us/sources.json");
const merchantsDocument = await readJson("data/us/merchants.json");
const rightsDocument = await readJson("docs/us/rights-register.json");

const existingIds = new Set(productsDocument.products.map((entry) => entry.id));
if (candidates.some((entry) => existingIds.has(entry.id))) throw new Error("Sauna Company USA batch contains an existing product ID");
if (!merchantsDocument.merchants.some((entry) => entry.id === merchant.id)) {
  merchantsDocument.merchants.push({ id: merchant.id, market: "US", name: merchant.name, kind: "retailer", allowed_hosts: ["saunacompanyusa.com"], status: "candidate" });
}

const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const sourceIds = new Set(sourcesDocument.sources.map((entry) => entry.id));

for (const entry of candidates) {
  const sourceId = `source-${entry.id}-product`;
  const evidenceId = `evidence-${entry.id}-product`;
  const configEvidenceId = `evidence-${entry.id}-configuration`;
  const configId = `${entry.id}-standard`;
  if (!sourceIds.has(sourceId)) {
    sourcesDocument.sources.push({ id: sourceId, type: "retailer-page", url: entry.url, title: `${entry.model} product page`, publisher: merchant.publisher, market: "US", checked_at: today, locator: "Official retailer product page model identity and category" });
    sourceIds.add(sourceId);
  }
  productsDocument.products.push({
    id: entry.id,
    market: "US",
    slug: entry.id,
    brand_name: entry.brand,
    model: entry.model,
    product_type: documented(entry.productType, evidenceId),
    heat_type: documented(entry.heat, evidenceId),
    energy_sources: unknown("The reviewed retailer page does not provide a normalized US energy-source record in this catalog candidate."),
    placements: documented([entry.placement], evidenceId),
    form: documented(entry.productType === "sauna-kit" ? "Sauna kit" : "Sauna cabin", evidenceId),
    configuration_ids: [configId],
    source_ids: [sourceId],
    publication_status: "candidate",
    spec_checked_at: today,
    change_reason: "Added from an exact official Sauna Company USA product page; technical and rights review remains open before publication.",
  });
  configurationsDocument.configurations.push({
    id: configId,
    market: "US",
    product_id: entry.id,
    label: `${entry.model} standard configuration`,
    manufacturer_sku: unknown("The reviewed retailer page does not expose a stable manufacturer SKU in this catalog record."),
    capacity: { seated: documented(entry.capacity, configEvidenceId), reclining: unknown("Reclining capacity is not stated in the reviewed product record.") },
    dimensions: { exterior: unknown("Complete exterior dimensions require the individual technical specification."), interior: unknown("Complete interior dimensions require the individual technical specification."), shipping: unknown("Shipping dimensions are not stated in the reviewed catalog record."), minimum_clearances: unknown("Installation clearances require the applicable manufacturer documentation.") },
    net_weight: unknown("Net weight is not stated in the reviewed catalog record."),
    shipping_weight: unknown("Shipping weight is not stated in the reviewed catalog record."),
    materials: unknown("Model-level materials require the individual technical specification."),
    components: [],
    electrical_supply_options: [{ id: `${entry.id}-electrical-unknown`, evidence_ids: [configEvidenceId], requirements: [{ component: entry.heat === "infrared" ? "infrared-system" : "heater", voltage_v: unknown("Voltage is not stated in the reviewed catalog record."), frequency_hz: unknown("Frequency is not stated in the reviewed catalog record."), phase: unknown("Phase is not stated in the reviewed catalog record."), rated_power_w: unknown("Rated power is not stated in the reviewed catalog record."), rated_current_a: unknown("Rated current is not stated in the reviewed catalog record."), required_circuit_a: unknown("Required circuit rating is not stated in the reviewed catalog record."), specified_breaker_a: unknown("Breaker rating is not stated in the reviewed catalog record."), connection: unknown("Connection type is not stated in the reviewed catalog record."), plug_type: unknown("Plug type is not stated in the reviewed catalog record."), dedicated_circuit: unknown("Dedicated-circuit requirements are not stated in the reviewed catalog record.") }] }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: [sourceId],
    publication_status: "candidate",
  });
  sourcesDocument.evidence.push({ id: evidenceId, entity_id: entry.id, source_id: sourceId, field_path: "product_identity", raw_value: `${entry.model} is listed on the official Sauna Company USA product page.` });
  sourcesDocument.evidence.push({ id: configEvidenceId, entity_id: configId, source_id: sourceId, field_path: "configuration_identity", raw_value: `${entry.model} is represented as a non-publishing research configuration.` });
  rightsDocument.assets.push({ asset_id: `${entry.id}-image`, entity_id: entry.id, merchant_id: merchant.id, asset_type: "retailer-image", source_url: entry.url, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}

await writeJson("data/us/products.json", productsDocument);
await writeJson("data/us/configurations.json", configurationsDocument);
await writeJson("data/us/sources.json", sourcesDocument);
await writeJson("data/us/merchants.json", merchantsDocument);
await writeJson("docs/us/rights-register.json", rightsDocument);
console.log(`Added ${candidates.length} Sauna Company USA US candidates; total is now ${productsDocument.products.length}.`);
