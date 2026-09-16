import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";
const merchant = { id: "harvia", brand: "Harvia", host: "https://www.harvia.com", publisher: "Harvia" };

const cabin = (id, model, url, placement = "unknown") => ({ id, model, url, placement, productType: "sauna-cabin", heat: "traditional", form: placement === "outdoor" ? "Outdoor sauna" : placement === "indoor" ? "Indoor sauna" : "Sauna cabin" });
const heater = (id, model, url) => ({ id, model, url, placement: "unknown", productType: "heater", heat: "traditional", form: "Sauna heater" });

const candidates = [
  cabin("harvia-legend-sauna-virta-11kw", "Legend Sauna with Virta 11 kW", "https://www.harvia.com/en-US/products/SHL3499US01/legend-sauna-with-electric-heater", "outdoor"),
  cabin("harvia-solide-compact-vision", "Solide Compact Vision", "https://www.harvia.com/en-US/products/SLDCV01PS/", "outdoor"),
  cabin("harvia-solide-compact", "Solide Compact", "https://www.harvia.com/en-US/products/SLDC02PS/outdoor-sauna-harvia-solide-compact", "outdoor"),
  cabin("harvia-variant-view-s1620sv", "Variant View S1620SV", "https://www.harvia.com/en-US/products/S1620SV/sauna-cabin-variant-view-s1620sv", "indoor"),
  cabin("harvia-variant-s1515l", "Variant S1515L", "https://www.harvia.com/en-US/products/S1515L/sauna-cabin-variant-1505x1505-left", "indoor"),
  cabin("harvia-polaris-large", "Polaris Large", "https://www.harvia.com/en-US/products/POLARIS-L/polaris-large", "indoor"),
  cabin("harvia-solide-s2119ld", "Solide S2119LD", "https://www.harvia.com/en-US/products/S2119LD/sauna-cabin-solide-s2119ld", "indoor"),
  cabin("harvia-block-right-medium", "Block Right Medium", "https://www.harvia.com/en-US/products/SHB1620ALD/sauna-cabin-block-1620-ald", "indoor"),
  cabin("harvia-alaska-view", "Alaska View", "https://www.harvia.com/en-US/products/ALASKA-V/alaskav", "indoor"),
  cabin("harvia-fenix-1620s", "Fenix 1620S", "https://www.harvia.com/en-US/products/SHF1620S/sauna-cabin-fenix-1620s", "indoor"),
  cabin("harvia-ventura", "Ventura Sauna Cabin", "https://www.harvia.com/en-US/harvia-ventura-sauna-cabin/", "indoor"),
  heater("harvia-concept-r-105", "Concept R 10.5 kW", "https://www.harvia.com/en-US/products/CP-RB-105/concept-r-105-kw-black"),
  heater("harvia-virta-wall-hlw90e", "Virta Wall HLW90E 9.0 kW", "https://www.harvia.com/en-US/products/HLWE904M/virta-wall-hlw90e-90-kw"),
  heater("harvia-legend-po70fc", "Legend PO70FC 6.8 kW WiFi", "https://www.harvia.com/en-US/products/HPO704FC/legend-po70fc-68-kw-wifi-black"),
];

const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const productsDocument = await readJson("data/us/products.json");
const configurationsDocument = await readJson("data/us/configurations.json");
const sourcesDocument = await readJson("data/us/sources.json");
const merchantsDocument = await readJson("data/us/merchants.json");
const rightsDocument = await readJson("docs/us/rights-register.json");

const existingIds = new Set(productsDocument.products.map((entry) => entry.id));
if (candidates.some((entry) => existingIds.has(entry.id))) throw new Error("Harvia batch contains an existing product ID");
if (!merchantsDocument.merchants.some((entry) => entry.id === merchant.id)) {
  merchantsDocument.merchants.push({ id: merchant.id, market: "US", name: merchant.brand, kind: "manufacturer", allowed_hosts: ["www.harvia.com"], status: "candidate" });
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
    product_type: documented(entry.productType, evidenceId),
    heat_type: documented(entry.heat, evidenceId),
    energy_sources: unknown("The reviewed Harvia product page does not provide a normalized US energy-source record for this catalog candidate."),
    placements: entry.placement === "unknown" ? unknown("The reviewed Harvia product page does not state one placement context for this candidate.") : documented([entry.placement], evidenceId),
    form: documented(entry.form, evidenceId),
    configuration_ids: [configId],
    source_ids: [sourceId],
    publication_status: "candidate",
    spec_checked_at: today,
    change_reason: "Added from an exact official Harvia US product page; technical review remains open before publication.",
  });
  configurationsDocument.configurations.push({
    id: configId,
    market: "US",
    product_id: entry.id,
    label: `${entry.model} standard configuration`,
    manufacturer_sku: unknown("The reviewed Harvia page does not expose a normalized manufacturer SKU in this catalog record."),
    capacity: { seated: unknown("Seated capacity is not normalized from the reviewed product page."), reclining: unknown("Reclining capacity is not stated in the reviewed product record.") },
    dimensions: { exterior: unknown("Complete exterior dimensions require the individual technical specification."), interior: unknown("Complete interior dimensions require the individual technical specification."), shipping: unknown("Shipping dimensions are not stated in the reviewed catalog record."), minimum_clearances: unknown("Installation clearances require the applicable Harvia documentation.") },
    net_weight: unknown("Net weight is not stated in the reviewed catalog record."),
    shipping_weight: unknown("Shipping weight is not stated in the reviewed catalog record."),
    materials: unknown("Model-level materials require the individual Harvia specification."),
    components: [],
    electrical_supply_options: [{
      id: `${entry.id}-electrical-unknown`,
      evidence_ids: [configEvidenceId],
      requirements: [{ component: entry.productType === "heater" ? "heater" : entry.heat === "infrared" ? "infrared-system" : "heater", voltage_v: unknown("Voltage is not stated in the reviewed catalog record."), frequency_hz: unknown("Frequency is not stated in the reviewed catalog record."), phase: unknown("Phase is not stated in the reviewed catalog record."), rated_power_w: unknown("Rated power is not stated in the reviewed catalog record."), rated_current_a: unknown("Rated current is not stated in the reviewed catalog record."), required_circuit_a: unknown("Required circuit rating is not stated in the reviewed catalog record."), specified_breaker_a: unknown("Breaker rating is not stated in the reviewed catalog record."), connection: unknown("Connection type is not stated in the reviewed catalog record."), plug_type: unknown("Plug type is not stated in the reviewed catalog record."), dedicated_circuit: unknown("Dedicated-circuit requirements are not stated in the reviewed catalog record.") }],
    }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: [sourceId],
    publication_status: "candidate",
  });
  sourcesDocument.evidence.push({ id: evidenceId, entity_id: entry.id, source_id: sourceId, field_path: "product_identity", raw_value: `${entry.model} is listed on the official Harvia US product page.` });
  sourcesDocument.evidence.push({ id: configEvidenceId, entity_id: configId, source_id: sourceId, field_path: "configuration_identity", raw_value: `${entry.model} is represented as a non-publishing research configuration.` });
  rightsDocument.assets.push({ asset_id: `${entry.id}-image`, entity_id: entry.id, merchant_id: merchant.id, asset_type: "manufacturer-image", source_url: entry.url, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}

await writeJson("data/us/products.json", productsDocument);
await writeJson("data/us/configurations.json", configurationsDocument);
await writeJson("data/us/sources.json", sourcesDocument);
await writeJson("data/us/merchants.json", merchantsDocument);
await writeJson("docs/us/rights-register.json", rightsDocument);
console.log(`Added ${candidates.length} Harvia US candidates; total is now ${productsDocument.products.length}.`);
