import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";
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

const collectionSourceId = "sweat-kingdom-saunas-collection";
if (!sources.sources.some((entry) => entry.id === collectionSourceId)) {
  sources.sources.push({
    id: collectionSourceId,
    type: "manufacturer-page",
    url: "https://sweatkingdom.com/collections/saunas",
    title: "Sweat Kingdom sauna collection",
    publisher: "Sweat Kingdom",
    market: "US",
    checked_at: today,
    locator: "Collection price, availability and model listing",
  });
}

const candidates = [
  {
    id: "sweat-kingdom-sweat-box",
    model: "The Sweat Box (1 Person)",
    url: "https://sweatkingdom.com/products/the-sweat-box-1-person",
    title: "Sweat Kingdom The Sweat Box product page",
    sourceIds: ["sweat-kingdom-sweat-box-product"],
    sourceTitle: "Sweat Kingdom The Sweat Box product page",
    statusReason: "The official product page currently marks this model sold out, so it is kept as a research candidate without an active offer.",
    capacity: 1,
    placements: ["indoor", "outdoor"],
    form: "Compact red cedar sauna cabin",
    materials: ["Red cedar", "Tempered glass", "Wool insulation", "Waterproof rubber flooring"],
    exterior: dimensions(42, 42, 80),
    heater: "Homecraft Revive Slim 4 kW WiFi-controlled heater",
    electrical: "30 A circuit breaker and #10 wire hardwired connection",
    power: 4000,
    current: 30,
    wire: "#10",
    identityRaw: "The Sweat Box (1 Person), compact traditional red cedar sauna for indoor and outdoor use; the product page currently shows Sold out.",
    configurationRaw: "One-person cabin; exterior height 80 in, depth 42 in and width 42 in; red cedar construction with tempered glass door and flat floor.",
    electricalRaw: "Homecraft Revive Slim 4 kW WiFi-controlled heater; 30 A circuit breaker and #10 wire hardwired connection.",
  },
  {
    id: "sweat-kingdom-sweat-cabin-deluxe",
    model: "The Sweat Cabin Deluxe (6 Person)",
    url: "https://sweatkingdom.com/products/the-deluxe-sweat-cabin",
    title: "Sweat Kingdom The Sweat Cabin Deluxe product page",
    sourceIds: ["sweat-kingdom-sweat-cabin-deluxe-product", collectionSourceId],
    sourceTitle: "Sweat Kingdom The Sweat Cabin Deluxe product page",
    statusReason: "The product page shows $8,245 while the current sauna collection shows $11,245. The model is recorded as a candidate until the merchant confirms the current price and selected package.",
    capacity: 6,
    placements: ["indoor", "outdoor"],
    form: "Six-person red cedar sauna cabin with L bench",
    materials: ["Premium red cedar", "Dual windows", "Tempered glass", "L bench"],
    exterior: dimensions(84, 73.5, 89),
    heater: "Homecraft Revive 9 kW heater with WiFi control (listed option)",
    electrical: "50 A dedicated breaker and 6/3 hardwired connection",
    power: 9000,
    current: 50,
    wire: "6/3",
    identityRaw: "The Sweat Cabin Deluxe (6 Person), traditional red cedar sauna for indoor and outdoor use with dual windows and an L bench.",
    configurationRaw: "One-size six-person cabin; exterior H 89 in × D 73.5 in × W 84 in; premium red cedar, dual windows and L bench configuration.",
    electricalRaw: "The product page lists a Homecraft Revive 9 kW heater with 50 A dedicated breaker and 6/3 hardwired connection as an option.",
  },
];

const existing = new Set(products.products.map((entry) => entry.id));
for (const model of candidates) {
  const sourceId = model.sourceIds[0];
  if (!sources.sources.some((entry) => entry.id === sourceId)) {
    sources.sources.push({
      id: sourceId,
      type: "manufacturer-page",
      url: model.url,
      title: model.title,
      publisher: "Sweat Kingdom",
      market: "US",
      checked_at: today,
      locator: "Product identity, dimensions, materials, electrical section, availability and price",
    });
  }
  if (existing.has(model.id)) continue;
  const configurationId = `${model.id}-standard`;
  const productEvidenceId = `evidence-${model.id}-product`;
  const configEvidenceId = `evidence-${model.id}-configuration`;
  const electricalEvidenceId = `evidence-${model.id}-electrical`;
  sources.evidence.push(
    { id: productEvidenceId, entity_id: model.id, source_id: sourceId, field_path: "product_identity", raw_value: model.identityRaw },
    { id: configEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "configuration.capacity_dimensions_materials", raw_value: model.configurationRaw },
    { id: electricalEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "electrical_supply_options", raw_value: model.electricalRaw },
  );
  products.products.push({
    id: model.id,
    market: "US",
    slug: model.id,
    brand_name: "Sweat Kingdom",
    model: model.model,
    product_type: documented("sauna-cabin", productEvidenceId),
    heat_type: documented("traditional", productEvidenceId),
    energy_sources: documented(["electric"], electricalEvidenceId),
    placements: documented(model.placements, productEvidenceId),
    form: documented(model.form, productEvidenceId),
    configuration_ids: [configurationId],
    source_ids: model.sourceIds,
    publication_status: "candidate",
    spec_checked_at: today,
    next_review_at: "2026-12-15",
    change_reason: model.statusReason,
  });
  configurations.configurations.push({
    id: configurationId,
    market: "US",
    product_id: model.id,
    label: `${model.model} documented base configuration`,
    manufacturer_sku: unknown("A manufacturer SKU is not stated on the reviewed product page."),
    capacity: { seated: documented(model.capacity, configEvidenceId), reclining: unknown("A reclining capacity is not stated on the reviewed product page.") },
    dimensions: { exterior: documented(model.exterior, configEvidenceId), interior: unknown("Interior dimensions are not stated on the reviewed product page."), shipping: unknown("Shipping dimensions are not stated on the reviewed product page."), minimum_clearances: unknown("Installation clearances require the manufacturer's instructions and a site review.") },
    net_weight: unknown("Net weight is not stated on the reviewed product page."),
    shipping_weight: unknown("Shipping weight is not stated on the reviewed product page."),
    materials: documented(model.materials, configEvidenceId),
    components: [
      { id: `${configurationId}-heater`, component_type: "heater", name: model.heater, inclusion: "included", evidence_ids: [electricalEvidenceId] },
      { id: `${configurationId}-stones`, component_type: "stones", name: "Sauna stones", inclusion: "included", evidence_ids: [productEvidenceId] },
    ],
    electrical_supply_options: [{ id: `${configurationId}-electrical`, requirements: [{ component: "heater", voltage_v: unknown("Voltage is not stated on the reviewed product page."), frequency_hz: unknown("Frequency is not stated on the reviewed product page."), phase: unknown("Phase is not stated on the reviewed product page."), rated_power_w: documented(model.power, electricalEvidenceId), rated_current_a: documented(model.current, electricalEvidenceId), required_circuit_a: documented(model.current, electricalEvidenceId), specified_breaker_a: documented(model.current, electricalEvidenceId), connection: documented("hardwired", electricalEvidenceId), plug_type: unknown("A plug type does not apply to the stated hardwired connection."), dedicated_circuit: documented(true, electricalEvidenceId) }], evidence_ids: [electricalEvidenceId] }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: model.sourceIds,
    publication_status: "candidate",
  });
  rights.assets.push({ asset_id: `${model.id}-image`, entity_id: model.id, merchant_id: "sweat-kingdom", asset_type: "manufacturer-image", source_url: model.url, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}

rights.updated_at = today;
await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
  writeJson("docs/us/rights-register.json", rights),
]);
console.log(JSON.stringify({ addedCandidates: candidates.length, totalProducts: products.products.length }, null, 2));
