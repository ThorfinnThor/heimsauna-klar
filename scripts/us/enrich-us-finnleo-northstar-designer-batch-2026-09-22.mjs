import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checkedAt = "2026-09-22";
const nextReviewAt = "2026-12-22";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const dimensions = (width, depth, height) => ({ width: { value: width, unit: "in" }, depth: { value: depth, unit: "in" }, height: { value: height, unit: "in" } });

const [products, configurations, sources] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
]);
const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationById = new Map(configurations.configurations.map((entry) => [entry.id, entry]));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidenceIds = new Set(sources.evidence.map((entry) => entry.id));

const records = [
  { id: "finnleo-northstar-indoor-sauna-4-x-4-9-0550", capacity: 2, dimensions: dimensions(48, 48, 80), voltage: 120, power: null, connection: "plug-in", dedicated: true, material: "Nordic White Spruce interior and exterior; Clear Abachi or Aspen benches and backrests", url: "https://www.finnleo.com/products/northstar-indoor-sauna-4-x-4-9-0550", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-northstar-indoor-sauna-4-x-6-9630-2263", capacity: 2, dimensions: dimensions(72, 48, 84), voltage: 240, amps: 30, connection: null, dedicated: null, power: 4500, material: "Nordic White Spruce interior and exterior; Clear Abachi or Aspen benches and backrests", url: "https://www.finnleo.com/products/northstar-indoor-sauna-4-x-6-9630-2263", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-northstar-indoor-sauna-5-x-6-9630-2264", capacity: 2, dimensions: dimensions(72, 60, 84), voltage: 240, amps: 30, connection: null, dedicated: null, power: 6000, material: "Nordic White Spruce interior and exterior; Clear Aspen or Abachi benches and backrests", url: "https://www.finnleo.com/products/northstar-indoor-sauna-5-x-6-9630-2264", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-northstar-indoor-sauna-5-x-7-9630-2265", capacity: 5, dimensions: dimensions(84, 60, 84), voltage: 240, amps: 30, connection: null, dedicated: null, power: 6000, material: "Nordic White Spruce interior and exterior; Clear Abachi or Aspen benches and backrests", url: "https://www.finnleo.com/products/northstar-indoor-sauna-5-x-7-9630-2265", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-vita-ii-9-0503", capacity: 3, dimensions: dimensions(63, 63, 84), voltage: null, amps: null, connection: null, dedicated: null, power: null, material: "Hemlock interior and exterior; Abachi and heat-treated Alder deck, benches, backrest and upper bench skirt", url: "https://www.finnleo.com/products/vita-ii-9-0503", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-centurion-9-0504", capacity: 5, dimensions: dimensions(84, 72, 84), voltage: 240, amps: null, connection: null, dedicated: null, power: 7000, material: "Black Taika wall paneling; clear vertical-grain Canadian Hemlock benches and backrests", url: "https://www.finnleo.com/products/centurion-9-0504", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-twilight-9-0501", capacity: 5, dimensions: dimensions(84, 72, 84), voltage: null, amps: null, connection: null, dedicated: null, power: null, material: "Cedar interior walls; Abachi and heat-treated Alder benches, backrests, skirt and heater guard; oil-rubbed Cedar exterior", url: "https://www.finnleo.com/products/twilight-9-0501", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-solace-9-0502", capacity: 5, dimensions: dimensions(84, 72, 84), voltage: 240, amps: null, connection: null, dedicated: null, power: 6000, material: "Nordic White Spruce interior and exterior; Abachi benches and backrests", url: "https://www.finnleo.com/products/solace-9-0502", form: "Indoor traditional sauna cabin" },
  { id: "finnleo-is440-infrasauna-9-0602", capacity: 2, dimensions: dimensions(48.25, 48.25, 80), voltage: 120, amps: null, connection: "plug-in", dedicated: false, power: null, material: "Hemlock interior and exterior", heat: "hybrid", url: "https://www.finnleo.com/products/is440-infrasauna-9-0602", form: "Indoor hybrid infrared and traditional sauna cabin" },
  { id: "finnleo-is565-infrasauna-9805-0840", capacity: 5, dimensions: dimensions(73.75, 61.75, 80), voltage: 240, amps: 30, connection: "hardwired", dedicated: true, power: 6000, material: "Hemlock interior and exterior", heat: "hybrid", url: "https://www.finnleo.com/products/is565-infrasauna-9805-0840", form: "Indoor hybrid infrared and traditional sauna cabin" },
];

for (const record of records) {
  const product = productById.get(record.id);
  const configuration = configurationById.get(`${record.id}-standard`);
  const sourceId = `source-${record.id}-product`;
  if (!product || !configuration || !sourceById.has(sourceId)) throw new Error(`Missing Finnleo record: ${record.id}`);
  const productEvidenceId = `evidence-${record.id}-depth-product`;
  const configurationEvidenceId = `evidence-${record.id}-depth-configuration`;
  const electricalEvidenceId = `evidence-${record.id}-depth-electrical`;
  for (const id of [productEvidenceId, configurationEvidenceId, electricalEvidenceId]) {
    if (evidenceIds.has(id)) throw new Error(`Evidence already exists: ${id}`);
  }
  const source = sourceById.get(sourceId);
  source.checked_at = checkedAt;
  source.locator = "Exact Finnleo model page with seating capacity, dimensions, material and electrical details where stated";
  sources.evidence.push(
    { id: productEvidenceId, entity_id: record.id, source_id: sourceId, field_path: "product_identity_capacity_heat_and_placement", raw_value: `${product.model ?? record.id} is listed on the Finnleo model page with a seating capacity of ${record.capacity}; the page identifies the model as an indoor ${record.heat ?? "traditional"} sauna.` },
    { id: configurationEvidenceId, entity_id: configuration.id, source_id: sourceId, field_path: "configuration.dimensions_and_materials", raw_value: `Exterior dimensions ${JSON.stringify(record.dimensions)}; material ${record.material ?? "not stated on the exact model page"}.` },
    { id: electricalEvidenceId, entity_id: configuration.id, source_id: sourceId, field_path: "electrical_supply_options", raw_value: `Finnleo lists ${record.voltage ?? "no voltage"} V, ${record.amps ?? "no amperage"} A, ${record.connection ?? "no normalized connection wording"} and ${record.power ?? "no single rated power"} W for this model.` },
  );
  for (const id of [productEvidenceId, configurationEvidenceId, electricalEvidenceId]) evidenceIds.add(id);
  product.source_ids = [...new Set([...product.source_ids, sourceId])];
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "Exact Finnleo model-page specifications added for capacity, placement, dimensions, materials and electrical requirements where stated.";
  product.placements = documented(["indoor"], productEvidenceId);
  product.form = documented(record.form, productEvidenceId);
  product.energy_sources = documented(["electric"], electricalEvidenceId);
  if (record.heat) product.heat_type = documented(record.heat, productEvidenceId);
  configuration.manufacturer_sku = documented(record.id.replace(/^finnleo-/, ""), configurationEvidenceId);
  configuration.capacity.seated = documented(record.capacity, productEvidenceId);
  configuration.dimensions.exterior = documented(record.dimensions, configurationEvidenceId);
  configuration.materials = documented([record.material], configurationEvidenceId);
  const requirement = configuration.electrical_supply_options[0]?.requirements[0];
  if (!requirement) throw new Error(`${record.id} has no electrical requirement placeholder`);
  requirement.voltage_v = record.voltage ? documented(record.voltage, electricalEvidenceId) : unknown("The exact Finnleo model page does not state a supply voltage.");
  requirement.rated_current_a = record.amps ? documented(record.amps, electricalEvidenceId) : unknown("The exact Finnleo model page does not state a rated current.");
  requirement.rated_power_w = record.power ? documented(record.power, electricalEvidenceId) : unknown("The exact Finnleo model page does not state one single rated power for this configuration.");
  requirement.required_circuit_a = record.amps ? documented(record.amps, electricalEvidenceId) : unknown("The exact Finnleo model page does not state a required circuit rating.");
  requirement.connection = record.connection ? documented(record.connection, electricalEvidenceId) : unknown("The exact Finnleo model page does not state a normalized connection type.");
  requirement.dedicated_circuit = record.dedicated === null ? unknown("The exact Finnleo model page does not state whether a dedicated circuit is required.") : documented(record.dedicated, electricalEvidenceId);
  configuration.source_ids = [...new Set([...configuration.source_ids, sourceId])];
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);
console.log(`Deepened ${records.length} Finnleo NorthStar/Designer US records.`);
