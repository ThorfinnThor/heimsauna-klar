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
const weight = (value) => ({ value, unit: "lb" });

const [products, configurations, sources, rights] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("docs/us/rights-register.json"),
]);

const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationByProductId = new Map(configurations.configurations.map((entry) => [entry.product_id, entry]));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidenceIds = new Set(sources.evidence.map((entry) => entry.id));
const productIds = new Set(products.products.map((entry) => entry.id));
const rightsIds = new Set(rights.assets.map((entry) => entry.asset_id));

const records = [
  {
    id: "harvia-concept-r-105",
    model: "Concept R 10.5 kW",
    sku: "CP-RB-105",
    url: "https://www.harvia.com/en-US/products/CP-RB-105/concept-r-105-kw-black",
    placement: null,
    dimensions: dimensions(17.56, 17.72, 28.15),
    weight: weight(72.1),
    materials: null,
    roomVolume: "353–530 ft³",
    power: 10500,
    voltage: 400,
    frequency: null,
    phase: 3,
    energyNote: "Harvia lists electric high-voltage 400 V / 230 V 1/3N~ options; the US page's electrical table lists 400 V 3N~.",
    form: "Floor-standing electric sauna heater",
  },
  {
    id: "harvia-virta-wall-hlw90e",
    model: "Virta Wall HLW90E 9.0 kW",
    sku: "HLWE904M",
    url: "https://www.harvia.com/en-US/products/HLWE904M/virta-wall-hlw90e-90-kw",
    placement: ["indoor"],
    dimensions: dimensions(15.35, 14.96, 20.87),
    weight: null,
    materials: ["Steel", "Stainless steel inner components"],
    roomVolume: "283–494 ft³",
    power: 9000,
    voltage: 400,
    frequency: null,
    phase: 3,
    energyNote: "Harvia describes 400 V 3N~, 230 V 1N~ and 230 V 3~ connection options; the normalized record keeps the 400 V 3-phase option shown in the electrical table.",
    form: "Wall-mounted electric sauna heater",
  },
  {
    id: "harvia-legend-po70fc",
    model: "Legend PO70FC 6.8 kW WiFi",
    sku: "HPO704FC",
    url: "https://www.harvia.com/en-US/products/HPO704FC/legend-po70fc-68-kw-wifi-black",
    placement: ["indoor"],
    dimensions: dimensions(12.8, 12.8, 41.76),
    weight: weight(39.7),
    materials: ["Steel", "Stainless steel ventilation channels"],
    roomVolume: "Not stated on the reviewed page",
    power: 6800,
    voltage: 400,
    frequency: null,
    phase: 3,
    energyNote: "Harvia lists electric high-voltage 400 V / 230 V 1/3N~ options and a 230 V~ / 230 V 3~ / 400 V 3N~ electrical table.",
    form: "Floor-standing electric sauna heater with included Fenix control package",
    components: [
      ["heater", "Legend FC electric heater"],
      ["controls", "Fenix WiFi control panel"],
      ["controls", "Temperature sensor and door sensor"],
    ],
  },
];

const productEvidence = (record) => `evidence-${record.id}-verified-product-2026-09-22`;
const configurationEvidence = (record) => `evidence-${record.id}-verified-configuration-2026-09-22`;
const electricalEvidence = (record) => `evidence-${record.id}-verified-electrical-2026-09-22`;

for (const record of records) {
  const product = productById.get(record.id);
  const configuration = configurationByProductId.get(record.id);
  if (!product || !configuration) throw new Error(`Expected existing Harvia record is missing: ${record.id}`);
  const sourceId = `source-${record.id}-product`;
  const source = sourceById.get(sourceId);
  if (!source) throw new Error(`Expected source is missing: ${sourceId}`);
  const pEvidence = productEvidence(record);
  const cEvidence = configurationEvidence(record);
  const eEvidence = electricalEvidence(record);
  for (const id of [pEvidence, cEvidence, eEvidence]) {
    if (evidenceIds.has(id)) throw new Error(`Evidence already exists: ${id}`);
    evidenceIds.add(id);
  }

  source.url = record.url;
  source.checked_at = checkedAt;
  source.title = `${record.model} official Harvia US product page`;
  source.locator = "Official model number, room-volume range, installation location, dimensions, weight/materials and electrical table";
  sources.evidence.push(
    { id: pEvidence, entity_id: record.id, source_id: sourceId, field_path: "product_identity_heat_placement", raw_value: `${record.model} (${record.sku}) is listed by Harvia as an electric traditional sauna heater${record.placement ? " for an interior/wet-area use context" : "; the reviewed page does not state a normalized placement context"}.` },
    { id: cEvidence, entity_id: configuration.id, source_id: sourceId, field_path: "configuration_dimensions_materials", raw_value: `${record.model}: dimensions ${JSON.stringify(record.dimensions)}; ${record.weight ? `net weight ${JSON.stringify(record.weight)}; ` : "net weight is not stated; "}${record.materials ? `materials ${record.materials.join(", ")}; ` : "model-level materials are not stated; "}recommended room volume ${record.roomVolume}.` },
    { id: eEvidence, entity_id: configuration.id, source_id: sourceId, field_path: "electrical_supply_options", raw_value: `${record.model}: ${record.energyNote} Rated output ${record.power} W.` },
  );

  product.product_type = documented("heater", pEvidence);
  product.heat_type = documented("traditional", pEvidence);
  product.energy_sources = documented(["electric"], eEvidence);
  product.placements = record.placement ? documented(record.placement, pEvidence) : unknown("The reviewed Harvia product page does not state a normalized placement context.");
  product.form = documented(record.form, pEvidence);
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "Model-level Harvia US technical page review added the manufacturer item number, installation context, dimensions, output and electrical details; publication remains protected pending editorial and rights review.";

  configuration.label = `${record.model} documented configuration`;
  configuration.manufacturer_sku = documented(record.sku, pEvidence);
  configuration.capacity = {
    seated: { status: "not-applicable", reason: "A standalone heater has no seated capacity." },
    reclining: { status: "not-applicable", reason: "A standalone heater has no reclining capacity." },
  };
  configuration.dimensions = {
    exterior: documented(record.dimensions, cEvidence),
    interior: { status: "not-applicable", reason: "Interior dimensions are not applicable to a standalone heater." },
    shipping: unknown("Shipping dimensions are not stated on the reviewed product page."),
    minimum_clearances: unknown("The page lists selected safety distances, but complete installation clearances must be checked in the current Harvia manual."),
  };
  configuration.net_weight = record.weight ? documented(record.weight, cEvidence) : unknown("Net weight is not stated on the reviewed product page.");
  configuration.shipping_weight = unknown("Shipping weight is not stated on the reviewed product page.");
  configuration.materials = record.materials ? documented(record.materials, cEvidence) : unknown("Model-level materials are not stated on the reviewed Harvia product page.");
  configuration.components = (record.components ?? []).map(([type, name], index) => ({
    id: `${configuration.id}-component-${index + 1}`,
    component_type: type,
    name,
    inclusion: "included",
    evidence_ids: [pEvidence],
  }));
  configuration.electrical_supply_options = [{
    id: `${configuration.id}-electrical-400v-3ph`,
    evidence_ids: [eEvidence],
    requirements: [{
      component: "heater",
      voltage_v: documented(record.voltage, eEvidence),
      frequency_hz: record.frequency ? documented(record.frequency, eEvidence) : unknown("The reviewed page states 50/60 Hz, while this field accepts one exact frequency; the installation frequency is not normalized."),
      phase: documented(record.phase, eEvidence),
      rated_power_w: documented(record.power, eEvidence),
      rated_current_a: unknown("Rated current is not stated on the reviewed Harvia US product page."),
      required_circuit_a: unknown("Required circuit rating is not stated on the reviewed Harvia US product page."),
      specified_breaker_a: unknown("Breaker rating is not stated on the reviewed Harvia US product page."),
      connection: unknown("The product page states voltage/phase options but does not normalize the connection type."),
      plug_type: unknown("Plug type is not stated on the reviewed Harvia US product page."),
      dedicated_circuit: unknown("Dedicated-circuit requirements must be confirmed in the current Harvia manual and by a qualified electrician."),
    }],
  }];
  configuration.source_ids = [sourceId];
  configuration.publication_status = "candidate";
}

const newRecord = {
  id: "harvia-concept-r-combi-105",
  model: "Concept R Combi 10.5 kW",
  sku: "CP-RCB-105",
  sourceId: "source-harvia-concept-r-combi-105-product",
  url: "https://www.harvia.com/en-US/products/CP-RCB-105/concept-r-combi-105-kw-black",
  dimensions: dimensions(22.05, 17.72, 28.15),
  weight: weight(98.8),
  configId: "harvia-concept-r-combi-105-standard",
};
if (!productIds.has(newRecord.id)) {
  const pEvidence = `evidence-${newRecord.id}-product-2026-09-22`;
  const cEvidence = `evidence-${newRecord.id}-configuration-2026-09-22`;
  const eEvidence = `evidence-${newRecord.id}-electrical-2026-09-22`;
  sources.sources.push({ id: newRecord.sourceId, type: "manufacturer-page", url: newRecord.url, title: "Concept R Combi 10.5 kW official Harvia US product page", publisher: "Harvia", market: "US", checked_at: checkedAt, locator: "Official model number, room-volume range, combi function, dimensions, weight/materials and electrical table" });
  sources.evidence.push(
    { id: pEvidence, entity_id: newRecord.id, source_id: newRecord.sourceId, field_path: "product_identity_heat_placement", raw_value: "Harvia Concept R Combi CP-RCB-105 is an electric combi sauna heater with a built-in evaporator for gentle steam." },
    { id: cEvidence, entity_id: newRecord.configId, source_id: newRecord.sourceId, field_path: "configuration_dimensions_materials", raw_value: `Dimensions ${JSON.stringify(newRecord.dimensions)}; net weight ${JSON.stringify(newRecord.weight)}; stone amount 77.2 lb; recommended room volume 353–530 ft³.` },
    { id: eEvidence, entity_id: newRecord.configId, source_id: newRecord.sourceId, field_path: "electrical_supply_options", raw_value: "Harvia lists electric high-voltage 400 V / 230 V 1/3N~; the US page's electrical table lists 400 V 3N~; output 10.5 kW." },
  );
  products.products.push({
    id: newRecord.id, market: "US", slug: newRecord.id, brand_name: "Harvia", model: newRecord.model,
    product_type: documented("heater", pEvidence), heat_type: documented("traditional", pEvidence), energy_sources: documented(["electric"], eEvidence), placements: unknown("The reviewed Harvia product page does not state a normalized placement context."), form: documented("Floor-standing electric combi sauna heater with evaporator", pEvidence), configuration_ids: [newRecord.configId], source_ids: [newRecord.sourceId], publication_status: "candidate", spec_checked_at: checkedAt, next_review_at: nextReviewAt, change_reason: "Added from the exact official Harvia US Concept R Combi product page; the Sol review corrected the heat type to traditional because the combi function adds an evaporator, not infrared heating. Publication remains protected pending editorial and rights review.",
  });
  configurations.configurations.push({
    id: newRecord.configId, market: "US", product_id: newRecord.id, label: `${newRecord.model} documented configuration`, manufacturer_sku: documented(newRecord.sku, pEvidence),
    capacity: { seated: { status: "not-applicable", reason: "A standalone heater has no seated capacity." }, reclining: { status: "not-applicable", reason: "A standalone heater has no reclining capacity." } },
    dimensions: { exterior: documented(newRecord.dimensions, cEvidence), interior: { status: "not-applicable", reason: "Interior dimensions are not applicable to a standalone heater." }, shipping: unknown("Shipping dimensions are not stated on the reviewed product page."), minimum_clearances: unknown("The page lists selected safety distances, but complete installation clearances must be checked in the current Harvia manual.") },
    net_weight: documented(newRecord.weight, cEvidence), shipping_weight: unknown("Shipping weight is not stated on the reviewed product page."), materials: documented(["Ceramic bowl"], cEvidence), components: [{ id: `${newRecord.configId}-component-1`, component_type: "heater", name: "10.5 kW electric combi heater with built-in evaporator", inclusion: "included", evidence_ids: [pEvidence] }],
    electrical_supply_options: [{ id: `${newRecord.configId}-electrical-400v-3ph`, evidence_ids: [eEvidence], requirements: [{ component: "heater", voltage_v: documented(400, eEvidence), frequency_hz: unknown("The reviewed page does not state one exact frequency for this model."), phase: documented(3, eEvidence), rated_power_w: documented(10500, eEvidence), rated_current_a: unknown("Rated current is not stated on the reviewed Harvia US product page."), required_circuit_a: unknown("Required circuit rating is not stated on the reviewed Harvia US product page."), specified_breaker_a: unknown("Breaker rating is not stated on the reviewed Harvia US product page."), connection: unknown("The product page states voltage/phase options but does not normalize the connection type."), plug_type: unknown("Plug type is not stated on the reviewed Harvia US product page."), dedicated_circuit: unknown("Dedicated-circuit requirements must be confirmed in the current Harvia manual and by a qualified electrician.") }] }], certification_ids: [], warranty_ids: [], source_ids: [newRecord.sourceId], publication_status: "candidate",
  });
  if (!rightsIds.has(`${newRecord.id}-image`)) rights.assets.push({ asset_id: `${newRecord.id}-image`, entity_id: newRecord.id, merchant_id: "harvia", asset_type: "manufacturer-image", source_url: newRecord.url, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
  writeJson("docs/us/rights-register.json", rights),
]);
console.log(JSON.stringify({ enriched: records.map((record) => record.id), added: productIds.has(newRecord.id) ? [] : [newRecord.id], totalProducts: products.products.length }, null, 2));
