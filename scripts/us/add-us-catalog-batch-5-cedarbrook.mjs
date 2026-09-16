import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";
const merchant = { id: "cedarbrook", brand: "Cedarbrook Sauna + Steam", host: "https://cedarbrooksauna.com", publisher: "Cedarbrook Sauna + Steam" };

const candidates = [
  ["1-person-indoor", "1 Person Indoor Sauna Kit", "1-person-indoor-sauna-kit", "traditional"],
  ["3x4-indoor", "3 x 4 Indoor Home Sauna Kit", "3x4-indoor-home-sauna-kit", "traditional"],
  ["4x4-indoor", "4 x 4 Indoor Home Sauna Kit", "4x4-indoor-home-sauna-kit", "traditional"],
  ["4x5-indoor", "4 x 5 Indoor Sauna Kit", "4x5-indoor-sauna-kit", "traditional"],
  ["4x7-indoor", "4 x 7 Modular Sauna Kit", "4x7-modular-sauna-kit-indoor-compact-freestanding", "traditional"],
  ["4x6-near-infrared", "4 x 6 Indoor Near Infrared Sauna Kit", "4x6-2inf-indoor-sauna-kit-freestanding-pre-fab-modular", "infrared"],
  ["5x5-indoor", "5 x 5 Indoor Sauna Kit", "5x5-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["5x6-indoor", "5 x 6 Indoor Sauna Kit", "5x6-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["5x8-indoor", "5 x 8 Indoor Sauna Kit", "5x8-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["6x6-indoor", "6 x 6 Indoor Sauna Kit", "6x6-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["6x7-indoor", "6 x 7 Indoor Sauna Kit", "6x7-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["6x8-indoor", "6 x 8 Indoor Sauna Kit", "6x8-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["7x7-indoor", "7 x 7 Indoor Sauna Kit", "7x7-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["7x7-ada-indoor", "7 x 7 ADA Indoor Sauna Kit", "7x7-ada-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["8x10-indoor", "8 x 10 Indoor Sauna Kit", "8x10-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
  ["8x8-indoor", "8 x 8 Indoor Sauna Kit", "8x8-indoor-sauna-kit-freestanding-pre-fab-modular", "traditional"],
].map(([handle, model, path, heat]) => ({ id: `cedarbrook-${handle}`, model, url: `${merchant.host}/${path}/`, heat }));

const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const productsDocument = await readJson("data/us/products.json");
const configurationsDocument = await readJson("data/us/configurations.json");
const sourcesDocument = await readJson("data/us/sources.json");
const merchantsDocument = await readJson("data/us/merchants.json");
const rightsDocument = await readJson("docs/us/rights-register.json");

const existingIds = new Set(productsDocument.products.map((entry) => entry.id));
if (candidates.some((entry) => existingIds.has(entry.id))) throw new Error("Cedarbrook batch contains an existing product ID");
if (!merchantsDocument.merchants.some((entry) => entry.id === merchant.id)) {
  merchantsDocument.merchants.push({ id: merchant.id, market: "US", name: merchant.brand, kind: "manufacturer", allowed_hosts: ["cedarbrooksauna.com"], status: "candidate" });
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
    sourcesDocument.sources.push({ id: sourceId, type: "manufacturer-page", url: entry.url, title: `${entry.model} product page`, publisher: merchant.publisher, market: "US", checked_at: today, locator: "Product page model identity and product class" });
    sourceIds.add(sourceId);
  }
  productsDocument.products.push({
    id: entry.id,
    market: "US",
    slug: entry.id,
    brand_name: merchant.brand,
    model: entry.model,
    product_type: documented("sauna-kit", evidenceId),
    heat_type: documented(entry.heat, evidenceId),
    energy_sources: unknown("The reviewed Cedarbrook product page does not provide a normalized US energy-source record for this catalog candidate."),
    placements: documented(["indoor"], evidenceId),
    form: documented("Indoor sauna kit", evidenceId),
    configuration_ids: [configId],
    source_ids: [sourceId],
    publication_status: "candidate",
    spec_checked_at: today,
    change_reason: "Added from an exact official Cedarbrook product page; technical review remains open before publication.",
  });
  configurationsDocument.configurations.push({
    id: configId,
    market: "US",
    product_id: entry.id,
    label: `${entry.model} standard configuration`,
    manufacturer_sku: unknown("The reviewed Cedarbrook page does not expose a normalized manufacturer SKU in this catalog record."),
    capacity: { seated: unknown("Seated capacity is not normalized from the reviewed product page."), reclining: unknown("Reclining capacity is not stated in the reviewed product record.") },
    dimensions: { exterior: unknown("Complete exterior dimensions require the individual technical specification."), interior: unknown("Complete interior dimensions require the individual technical specification."), shipping: unknown("Shipping dimensions are not stated in the reviewed catalog record."), minimum_clearances: unknown("Installation clearances require the applicable Cedarbrook documentation.") },
    net_weight: unknown("Net weight is not stated in the reviewed catalog record."),
    shipping_weight: unknown("Shipping weight is not stated in the reviewed catalog record."),
    materials: unknown("Model-level materials require the individual Cedarbrook specification."),
    components: [],
    electrical_supply_options: [{ id: `${entry.id}-electrical-unknown`, evidence_ids: [configEvidenceId], requirements: [{ component: entry.heat === "infrared" ? "infrared-system" : "heater", voltage_v: unknown("Voltage is not stated in the reviewed catalog record."), frequency_hz: unknown("Frequency is not stated in the reviewed catalog record."), phase: unknown("Phase is not stated in the reviewed catalog record."), rated_power_w: unknown("Rated power is not stated in the reviewed catalog record."), rated_current_a: unknown("Rated current is not stated in the reviewed catalog record."), required_circuit_a: unknown("Required circuit rating is not stated in the reviewed catalog record."), specified_breaker_a: unknown("Breaker rating is not stated in the reviewed catalog record."), connection: unknown("Connection type is not stated in the reviewed catalog record."), plug_type: unknown("Plug type is not stated in the reviewed catalog record."), dedicated_circuit: unknown("Dedicated-circuit requirements are not stated in the reviewed catalog record.") }] }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: [sourceId],
    publication_status: "candidate",
  });
  sourcesDocument.evidence.push({ id: evidenceId, entity_id: entry.id, source_id: sourceId, field_path: "product_identity", raw_value: `${entry.model} is listed on the official Cedarbrook product page.` });
  sourcesDocument.evidence.push({ id: configEvidenceId, entity_id: configId, source_id: sourceId, field_path: "configuration_identity", raw_value: `${entry.model} is represented as a non-publishing research configuration.` });
  rightsDocument.assets.push({ asset_id: `${entry.id}-image`, entity_id: entry.id, merchant_id: merchant.id, asset_type: "manufacturer-image", source_url: entry.url, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}

await writeJson("data/us/products.json", productsDocument);
await writeJson("data/us/configurations.json", configurationsDocument);
await writeJson("data/us/sources.json", sourcesDocument);
await writeJson("data/us/merchants.json", merchantsDocument);
await writeJson("docs/us/rights-register.json", rightsDocument);
console.log(`Added ${candidates.length} Cedarbrook US candidates; total is now ${productsDocument.products.length}.`);
