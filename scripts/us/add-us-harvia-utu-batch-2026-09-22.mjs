import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checkedAt = "2026-09-22";
const nextReviewAt = "2026-12-22";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const dimensions = (width, depth, height) => ({
  width: { value: width, unit: "in" },
  depth: { value: depth, unit: "in" },
  height: { value: height, unit: "in" },
});

const [products, configurations, sources, rights] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("docs/us/rights-register.json"),
]);

const productIds = new Set(products.products.map((entry) => entry.id));
const configurationIds = new Set(configurations.configurations.map((entry) => entry.id));
const sourceIds = new Set(sources.sources.map((entry) => entry.id));
const evidenceIds = new Set(sources.evidence.map((entry) => entry.id));
const assetIds = new Set(rights.assets.map((entry) => entry.asset_id));

const addSource = (entry) => {
  if (sourceIds.has(entry.id)) return;
  sources.sources.push({ ...entry, market: "US", checked_at: checkedAt });
  sourceIds.add(entry.id);
};
const addEvidence = (entry) => {
  if (evidenceIds.has(entry.id)) return;
  sources.evidence.push(entry);
  evidenceIds.add(entry.id);
};
const addRights = (id, entityId, url) => {
  if (assetIds.has(id)) return;
  rights.assets.push({
    asset_id: id,
    entity_id: entityId,
    merchant_id: "harvia",
    asset_type: "manufacturer-image",
    source_url: url,
    rights_status: "not-requested",
    permission_basis: "none",
    action: "Use no image until written permission or an approved feed license is recorded.",
  });
  assetIds.add(id);
};

const electricalOption = (configurationId, evidenceId) => ({
  id: `${configurationId}-electrical-unknown`,
  evidence_ids: [evidenceId],
  requirements: [{
    component: "heater",
    voltage_v: unknown("The reviewed Harvia US product page does not state a supply voltage."),
    frequency_hz: unknown("The reviewed Harvia US product page does not state a supply frequency."),
    phase: unknown("The reviewed Harvia US product page does not state the electrical phase."),
    rated_power_w: unknown("The reviewed Harvia US product page does not state rated heater power for the selected heater option."),
    rated_current_a: unknown("The reviewed Harvia US product page does not state rated current."),
    required_circuit_a: unknown("The reviewed Harvia US product page does not state a required circuit rating."),
    specified_breaker_a: unknown("The reviewed Harvia US product page does not state a breaker rating."),
    connection: unknown("The reviewed Harvia US product page does not state a normalized connection type."),
    plug_type: unknown("The reviewed Harvia US product page does not state a plug type."),
    dedicated_circuit: unknown("The reviewed Harvia US product page does not state whether a dedicated circuit is required."),
  }],
});

const records = [
  {
    id: "harvia-utu-mini", model: "Utu Mini", sku: "SHU0909", capacity: 1,
    dimensions: dimensions(38.19, 37.76, 81.12),
    url: "https://www.harvia.com/en-US/products/SHU0909/utu-mini",
    description: "Compact indoor Utu cabin with full tempered-glass front and thermo aspen surfaces.",
  },
  {
    id: "harvia-utu-small", model: "Utu Small", sku: "SHU1212", capacity: 2,
    dimensions: dimensions(47.24, 47.24, 80.16),
    url: "https://www.harvia.com/en-US/products/SHU1212/shu1212",
    description: "Compact indoor Utu cabin with a paneled surround, thermo aspen surfaces and a rear bench layout.",
  },
  {
    id: "harvia-utu-medium", model: "Utu Medium", sku: "SHU1616", capacity: 3,
    dimensions: dimensions(63.78, 63.0, 80.16),
    url: "https://www.harvia.com/en-US/products/SHU1616/utu-medium",
    description: "Medium indoor Utu cabin with thermo aspen surfaces, rear bench layout and traditional or combi heater options.",
  },
  {
    id: "harvia-utu-vision-medium", model: "Utu Vision Medium", sku: "SHU1616V", capacity: 3,
    dimensions: dimensions(63.78, 63.0, 80.16),
    url: "https://www.harvia.com/en-US/products/SHU1616V/utu-vision-medium",
    description: "Vision version of the Utu Medium with a full tempered-glass front and thermo aspen interior.",
  },
];

for (const record of records) {
  if (productIds.has(record.id) || configurationIds.has(`${record.id}-standard`)) throw new Error(`Record already exists: ${record.id}`);
  const sourceId = `source-${record.id}-manufacturer`;
  const productEvidenceId = `evidence-${record.id}-product`;
  const configurationId = `${record.id}-standard`;
  const configurationEvidenceId = `evidence-${record.id}-configuration`;
  const electricalEvidenceId = `evidence-${record.id}-electrical`;

  addSource({ id: sourceId, type: "manufacturer-page", url: record.url, title: `Harvia ${record.model} US product page`, publisher: "Harvia", locator: "Official US model identity, item number, indoor placement, capacity, dimensions and material description" });
  addEvidence({ id: productEvidenceId, entity_id: record.id, source_id: sourceId, field_path: "product_identity", raw_value: `Harvia lists ${record.model} (${record.sku}) as an indoor Utu sauna cabin with traditional and/or combi heater options.` });
  addEvidence({ id: configurationEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "configuration.capacity_dimensions_materials", raw_value: `${record.model}: seated capacity ${record.capacity}; exterior dimensions ${JSON.stringify(record.dimensions)}; thermo aspen surfaces and tempered safety glass are stated on the product page.` });
  addEvidence({ id: electricalEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "electrical_supply_options", raw_value: `${record.model} supports traditional electric or combi heater options, but the reviewed US product page does not state voltage, circuit or heater power.` });

  products.products.push({
    id: record.id,
    market: "US",
    slug: record.id,
    brand_name: "Harvia",
    model: record.model,
    product_type: documented("sauna-cabin", productEvidenceId),
    heat_type: documented("traditional", productEvidenceId),
    energy_sources: documented(["electric"], electricalEvidenceId),
    placements: documented(["indoor"], productEvidenceId),
    form: documented("Indoor sauna cabin", productEvidenceId),
    configuration_ids: [configurationId],
    source_ids: [sourceId],
    publication_status: "candidate",
    spec_checked_at: checkedAt,
    next_review_at: nextReviewAt,
    change_reason: "Added from an exact official Harvia US Utu product page; publication review remains open.",
  });
  configurations.configurations.push({
    id: configurationId,
    market: "US",
    product_id: record.id,
    label: `${record.model} documented configuration`,
    manufacturer_sku: documented(record.sku, configurationEvidenceId),
    capacity: { seated: documented(record.capacity, configurationEvidenceId), reclining: unknown("A reclining capacity is not stated on the reviewed Harvia US page.") },
    dimensions: {
      exterior: documented(record.dimensions, configurationEvidenceId),
      interior: unknown("Interior dimensions are not stated on the reviewed Harvia US page."),
      shipping: unknown("Shipping dimensions are not stated on the reviewed Harvia US page."),
      minimum_clearances: unknown("Installation clearances require the applicable Harvia manual and site review."),
    },
    net_weight: unknown("Net weight is not used for this catalog record because the US product page does not state it in the reviewed section."),
    shipping_weight: unknown("Shipping weight is not stated on the reviewed Harvia US page."),
    materials: documented(["Thermo aspen", "Tempered safety glass"], configurationEvidenceId),
    components: [],
    electrical_supply_options: [electricalOption(configurationId, electricalEvidenceId)],
    certification_ids: [],
    warranty_ids: [],
    source_ids: [sourceId],
    publication_status: "candidate",
  });
  addRights(`${record.id}-manufacturer-image`, record.id, record.url);
  productIds.add(record.id);
  configurationIds.add(configurationId);
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
  writeJson("docs/us/rights-register.json", rights),
]);
console.log(`Added ${records.length} Harvia Utu US candidate products.`);
