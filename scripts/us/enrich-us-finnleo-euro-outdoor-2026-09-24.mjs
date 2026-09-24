import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checkedAt = "2026-09-24";
const nextReviewAt = "2026-12-24";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const dimensions = (width, depth, height) => ({
  width: { value: width, unit: "in" },
  depth: { value: depth, unit: "in" },
  height: { value: height, unit: "in" },
});

const [products, configurations, sources] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
]);
const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationById = new Map(configurations.configurations.map((entry) => [entry.id, entry]));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidenceIds = new Set(sources.evidence.map((entry) => entry.id));

// Finnleo's page labels the model sizes separately from its overall dimensions.
// Capacity ranges are left unknown because the normalized capacity field accepts
// a single integer only; no midpoint or maximum is substituted.
const records = [
  {
    id: "finnleo-4-x-6-euro-9-0701",
    seating: 2,
    seatingNote: "Finnleo lists seating capacity as 2.",
    dimensions: dimensions(72, 48, 88),
    materials: ["Cedar exterior", "Interior options: Nordic White Spruce, Hemlock, or Cedar"],
    components: [
      { type: "other", name: "Floor", inclusion: "included" },
      { type: "other", name: "Optional roof kit", inclusion: "excluded" },
      { type: "other", name: "Bucket and ladle", inclusion: "included" },
    ],
    url: "https://www.finnleo.com/products/4-x-6-euro-9-0701",
    title: "4' x 6' Euro outdoor sauna product page",
    locator: "Outdoor model page: capacity, separate sauna-size and overall-dimension fields, construction options, floor, roof kit and accessories",
  },
  {
    id: "finnleo-5-x-6-euro-9-0702",
    seating: null,
    seatingNote: "Finnleo gives a 2–3 person range; the catalog's normalized seated-capacity field only accepts a single integer, so no value is inferred.",
    dimensions: dimensions(60, 72, 88),
    materials: ["Cedar exterior", "Interior options: Nordic White Spruce, Hemlock, or Cedar"],
    components: [
      { type: "other", name: "Floor", inclusion: "included" },
      { type: "other", name: "Optional roof kit", inclusion: "excluded" },
      { type: "other", name: "Bucket and ladle", inclusion: "included" },
    ],
    url: "https://www.finnleo.com/products/5-x-6-euro-9-0702",
    title: "5' x 6' Euro outdoor sauna product page",
    locator: "Outdoor model page: seating range, separate sauna-size and overall-dimension fields, construction options, floor, roof kit and accessories",
  },
  {
    id: "finnleo-5-x-7-euro-9-0703",
    seating: null,
    seatingNote: "Finnleo gives a 2–3 person range; the catalog's normalized seated-capacity field only accepts a single integer, so no value is inferred.",
    dimensions: dimensions(84, 60, 88),
    materials: ["Cedar exterior", "Interior options: Nordic White Spruce, Hemlock, or Cedar"],
    components: [
      { type: "other", name: "Floor", inclusion: "included" },
      { type: "other", name: "Optional roof kit", inclusion: "excluded" },
      { type: "other", name: "Bucket and ladle", inclusion: "included" },
    ],
    url: "https://www.finnleo.com/products/5-x-7-euro-9-0703",
    title: "5' x 7' Euro outdoor sauna product page",
    locator: "Outdoor model page: seating range, separate sauna-size and overall-dimension fields, construction options, floor, roof kit and accessories",
  },
];

for (const record of records) {
  const product = productById.get(record.id);
  const configuration = configurationById.get(`${record.id}-standard`);
  const sourceId = `source-${record.id}-product`;
  if (!product || !configuration || !sourceById.has(sourceId)) throw new Error(`Missing Finnleo record: ${record.id}`);
  if (product.publication_status !== "candidate" || configuration.publication_status !== "candidate") {
    throw new Error(`Refusing to change publication state for ${record.id}`);
  }
  const productEvidenceId = `evidence-${record.id}-euro-depth-product`;
  const configurationEvidenceId = `evidence-${record.id}-euro-depth-configuration`;
  if (evidenceIds.has(productEvidenceId) || evidenceIds.has(configurationEvidenceId)) {
    throw new Error(`Evidence already exists for ${record.id}`);
  }

  const source = sourceById.get(sourceId);
  source.checked_at = checkedAt;
  source.title = record.title;
  source.locator = record.locator;
  sources.evidence.push(
    {
      id: productEvidenceId,
      entity_id: record.id,
      source_id: sourceId,
      field_path: "product_identity_capacity_and_included_items",
      raw_value: `${record.seatingNote} Finnleo describes an outdoor Euro model with configurable benches. Listed items and options are captured separately in the configuration record.`,
    },
    {
      id: configurationEvidenceId,
      entity_id: configuration.id,
      source_id: sourceId,
      field_path: "configuration.overall_dimensions_materials_and_components",
      raw_value: `Finnleo publishes overall dimensions ${JSON.stringify(record.dimensions)} separately from the named sauna size. Exterior is cedar; interior options are Nordic White Spruce, Hemlock, or Cedar. The page states the floor is included and roof kit optional.`,
    },
  );
  evidenceIds.add(productEvidenceId);
  evidenceIds.add(configurationEvidenceId);

  product.source_ids = [...new Set([...product.source_ids, sourceId])];
  product.product_type = documented("sauna-cabin", productEvidenceId);
  product.heat_type = documented("traditional", productEvidenceId);
  product.placements = documented(["outdoor"], productEvidenceId);
  product.form = documented("Customizable free-standing outdoor sauna", productEvidenceId);
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "Finnleo Euro Outdoor model pages reviewed for capacity, overall dimensions, material options and included/optional components; model-specific electrical details remain unconfirmed.";

  configuration.manufacturer_sku = unknown("The exact Finnleo page does not identify a manufacturer SKU; its URL identifier is not treated as an SKU.");
  configuration.capacity.seated = record.seating === null
    ? unknown(record.seatingNote)
    : documented(record.seating, productEvidenceId);
  configuration.dimensions.exterior = documented(record.dimensions, configurationEvidenceId);
  configuration.materials = documented(record.materials, configurationEvidenceId);
  configuration.components = record.components.map((component, index) => ({
    id: `${configuration.id}-component-${index + 1}`,
    component_type: component.type,
    name: component.name,
    inclusion: component.inclusion,
    evidence_ids: [configurationEvidenceId],
  }));
  configuration.source_ids = [...new Set([...configuration.source_ids, sourceId])];
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);
console.log(`Deepened ${records.length} Finnleo Euro Outdoor US records; candidates remain unpublished.`);
