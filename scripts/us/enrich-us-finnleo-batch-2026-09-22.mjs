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
  { id: "finnleo-s810-infrared-sauna-9804-4410", capacity: 1, dimensions: dimensions(36, 36, 76.5), voltage: 120, amps: 15, connection: "plug-in", dedicated: false, material: "Hemlock interior and exterior", url: "https://www.finnleo.com/products/s810-infrared-sauna-9804-4410", kind: "infrared-system" },
  { id: "finnleo-s820-infrared-sauna-9804-4420", capacity: 2, dimensions: dimensions(47.75, 40, 76.5), voltage: 120, amps: 15, connection: "plug-in", dedicated: false, material: "Hemlock interior and exterior", url: "https://www.finnleo.com/products/s820-infrared-sauna-9804-4420", kind: "infrared-system" },
  { id: "finnleo-s825-infrared-sauna-9804-4430", capacity: 2, dimensions: dimensions(64.25, 42.5, 76.5), voltage: 120, amps: 20, connection: "plug-in", dedicated: true, material: "Hemlock interior and exterior", url: "https://www.finnleo.com/products/s825-infrared-sauna-9804-4430", kind: "infrared-system" },
  { id: "finnleo-s830-infrared-sauna-9804-4440", capacity: 3, dimensions: dimensions(71.375, 42.5, 76.5), voltage: 120, amps: 20, connection: "plug-in", dedicated: true, material: "Hemlock interior and exterior", url: "https://www.finnleo.com/products/s830-infrared-sauna-9804-4440", kind: "infrared-system" },
  { id: "finnleo-s840-infrared-sauna-9804-4450", capacity: 4, dimensions: dimensions(71.375, 56.625, 76.5), voltage: 120, amps: 20, connection: "plug-in", dedicated: true, material: "Hemlock interior and exterior", url: "https://www.finnleo.com/products/s840-infrared-sauna-9804-4450", kind: "infrared-system" },
  { id: "finnleo-s870-infrared-sauna-9804-4470", capacity: 3, dimensions: dimensions(51.875, 51.875, 76.5), voltage: 120, amps: 15, connection: "plug-in", dedicated: false, material: "Hemlock interior and exterior", url: "https://www.finnleo.com/products/s870-infrared-sauna-9804-4470", kind: "infrared-system" },
  { id: "finnleo-hallmark-44-9-0601", capacity: 2, dimensions: dimensions(48, 48, 80), voltage: 120, amps: null, connection: "plug-in", dedicated: null, material: "Clear Canadian Hemlock interior and exterior", url: "https://www.finnleo.com/products/hallmark-44-9-0601", kind: "heater" },
  { id: "finnleo-hallmark-46-9806-6620", capacity: 3, dimensions: dimensions(73.375, 49.25, 80), voltage: 240, amps: 18.8, power: 4500, connection: null, dedicated: null, material: null, url: "https://www.finnleo.com/products/hallmark-46-9806-6620", kind: "heater" },
  { id: "finnleo-hallmark-57-9806-6640", capacity: 5, dimensions: dimensions(85.375, 61.375, 80), voltage: 240, amps: 25, power: 6000, connection: null, dedicated: null, material: "Clear Canadian Hemlock interior and exterior", url: "https://www.finnleo.com/products/hallmark-57-9806-6640", kind: "heater" },
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
  source.locator = "Exact Finnleo model page with seating capacity, electrical requirements, dimensions and material where stated";
  sources.evidence.push(
    { id: productEvidenceId, entity_id: record.id, source_id: sourceId, field_path: "product_identity_and_capacity", raw_value: `${product.model ?? record.id} is listed on the Finnleo model page with a seating capacity of ${record.capacity}.` },
    { id: configurationEvidenceId, entity_id: configuration.id, source_id: sourceId, field_path: "configuration.dimensions_materials", raw_value: `Exterior dimensions ${JSON.stringify(record.dimensions)}; material ${record.material ?? "not stated on the exact model page"}.` },
    { id: electricalEvidenceId, entity_id: configuration.id, source_id: sourceId, field_path: "electrical_supply_options", raw_value: `Finnleo lists ${record.voltage} V, ${record.amps ?? "not stated"} A and ${record.connection ?? "no connection wording"} for this model; rated power ${record.power ?? "not stated"}.` },
  );
  for (const id of [productEvidenceId, configurationEvidenceId, electricalEvidenceId]) evidenceIds.add(id);
  product.source_ids = [...new Set([...product.source_ids, sourceId])];
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "Exact Finnleo model-page specifications added for capacity, dimensions, materials and electrical requirements where stated.";
  configuration.manufacturer_sku = documented(record.id.replace(/^finnleo-/, ""), configurationEvidenceId);
  configuration.capacity.seated = documented(record.capacity, productEvidenceId);
  configuration.dimensions.exterior = documented(record.dimensions, configurationEvidenceId);
  if (record.material) configuration.materials = documented([record.material], configurationEvidenceId);
  const requirement = configuration.electrical_supply_options[0]?.requirements[0];
  if (!requirement) throw new Error(`${record.id} has no electrical requirement placeholder`);
  requirement.voltage_v = documented(record.voltage, electricalEvidenceId);
  requirement.rated_current_a = record.amps ? documented(record.amps, electricalEvidenceId) : unknown("The exact Finnleo model page does not state rated current.");
  requirement.rated_power_w = record.power ? documented(record.power, electricalEvidenceId) : unknown("The exact Finnleo model page does not state rated heater power.");
  requirement.required_circuit_a = record.amps && record.dedicated !== null ? documented(record.amps, electricalEvidenceId) : unknown("The exact Finnleo model page does not state a required circuit rating.");
  requirement.connection = record.connection ? documented(record.connection, electricalEvidenceId) : unknown("The exact Finnleo model page does not state a normalized connection type.");
  requirement.dedicated_circuit = record.dedicated === null ? unknown("The exact Finnleo model page does not state whether a dedicated circuit is required.") : documented(record.dedicated, electricalEvidenceId);
  configuration.source_ids = [...new Set([...configuration.source_ids, sourceId])];
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);
console.log(`Deepened ${records.length} Finnleo US records.`);
