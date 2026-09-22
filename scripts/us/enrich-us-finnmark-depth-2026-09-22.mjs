import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checkedAt = "2026-09-22";
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
const configurationByProductId = new Map(configurations.configurations.map((entry) => [entry.product_id, entry]));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidenceIds = new Set(sources.evidence.map((entry) => entry.id));

const models = [
  {
    id: "finnmark-fd-1", heat: "infrared", capacity: 1,
    exterior: dimensions(38, 38, 78), interior: dimensions(32, 34, 70),
    materials: ["Thermal Plus aspen exterior", "Antimicrobial Western Canadian cedar interior", "8 mm tempered glass door"],
    electrical: [{ component: "infrared-system", voltage: 120, power: 1750, current: 15, phase: 1, plug: "NEMA 5-15P", dedicated: null }],
  },
  {
    id: "finnmark-fd-3", heat: "infrared", capacity: 4,
    exterior: dimensions(72, 46, 78), interior: dimensions(67, 41, 70),
    materials: ["Thermal Plus aspen exterior", "Antimicrobial Western Canadian cedar interior", "8 mm tempered glass door"],
    electrical: [{ component: "infrared-system", voltage: 240, power: 3150, current: 15, phase: 1, plug: "NEMA 6-15P", dedicated: null }],
  },
  {
    id: "finnmark-fd-5", heat: "hybrid", capacity: 4,
    exterior: dimensions(75, 64, 83), interior: dimensions(71, 57.5, 75.5),
    materials: ["Thermal Plus aspen exterior", "Antimicrobial Western Canadian cedar interior", "8 mm tempered glass door"],
    electrical: [
      { component: "infrared-system", voltage: 240, power: 2700, current: 15, phase: 1, plug: "NEMA 6-15P", dedicated: true },
      { component: "heater", voltage: 240, power: 4500, current: null, phase: 1, plug: null, dedicated: true },
    ],
  },
];

for (const model of models) {
  const product = productById.get(model.id);
  const configuration = configurationByProductId.get(model.id);
  const sourceId = `source-${model.id}-product`;
  const source = sourceById.get(sourceId);
  if (!product || !configuration || !source) throw new Error(`Missing existing Finnmark record ${model.id}`);
  const productEvidenceId = `evidence-${model.id}-verified-product-2026-09-22`;
  const configurationEvidenceId = `evidence-${model.id}-verified-configuration-2026-09-22`;
  const electricalEvidenceId = `evidence-${model.id}-verified-electrical-2026-09-22`;
  for (const id of [productEvidenceId, configurationEvidenceId, electricalEvidenceId]) {
    if (evidenceIds.has(id)) throw new Error(`Evidence already exists: ${id}`);
    evidenceIds.add(id);
  }
  source.checked_at = checkedAt;
  source.locator = "Exact product page specifications: heat system, capacity, exterior and interior dimensions, materials and electrical requirements";
  sources.evidence.push(
    { id: productEvidenceId, entity_id: model.id, source_id: sourceId, field_path: "product_identity_heat_placement", raw_value: `${product.model}: ${model.heat} indoor sauna cabin.` },
    { id: configurationEvidenceId, entity_id: configuration.id, source_id: sourceId, field_path: "configuration.capacity_dimensions_materials", raw_value: `Capacity ${model.capacity}; exterior ${JSON.stringify(model.exterior)}; interior ${JSON.stringify(model.interior)}; materials ${model.materials.join(", ")}.` },
    { id: electricalEvidenceId, entity_id: configuration.id, source_id: sourceId, field_path: "electrical_supply_options", raw_value: JSON.stringify(model.electrical) },
  );

  product.product_type = documented("sauna-cabin", productEvidenceId);
  product.heat_type = documented(model.heat, productEvidenceId);
  product.energy_sources = documented(["electric"], electricalEvidenceId);
  product.placements = documented(["indoor"], productEvidenceId);
  product.form = documented(model.heat === "hybrid" ? "Indoor infrared and traditional combination cabin" : "Indoor full-spectrum infrared cabin", productEvidenceId);
  product.spec_checked_at = checkedAt;
  product.next_review_at = "2026-12-22";
  product.change_reason = "Exact retailer product specifications replaced the earlier range-level placeholder data; capacity, dimensions, materials and electrical requirements are now model-specific.";

  configuration.label = `${product.model} documented configuration`;
  configuration.capacity = { seated: documented(model.capacity, configurationEvidenceId), reclining: unknown("A reclining capacity is not stated on the reviewed product page.") };
  configuration.dimensions = {
    exterior: documented(model.exterior, configurationEvidenceId),
    interior: documented(model.interior, configurationEvidenceId),
    shipping: unknown("Shipping dimensions are not stated on the reviewed product page."),
    minimum_clearances: unknown("Installation clearances require the linked installation manual and site review."),
  };
  configuration.materials = documented(model.materials, configurationEvidenceId);
  configuration.components = model.electrical.map((requirement, index) => ({
    id: `${configuration.id}-${requirement.component}-${index + 1}`,
    component_type: requirement.component,
    name: requirement.component === "heater" ? "4.5 kW traditional sauna heater" : "Full-spectrum infrared heating system",
    inclusion: "included",
    evidence_ids: [electricalEvidenceId],
  }));
  configuration.electrical_supply_options = model.electrical.map((requirement, index) => ({
    id: `${configuration.id}-electrical-${index + 1}`,
    evidence_ids: [electricalEvidenceId],
    requirements: [{
      component: requirement.component,
      voltage_v: documented(requirement.voltage, electricalEvidenceId),
      frequency_hz: unknown("Frequency is not stated on the reviewed product page."),
      phase: documented(requirement.phase, electricalEvidenceId),
      rated_power_w: documented(requirement.power, electricalEvidenceId),
      rated_current_a: requirement.current ? documented(requirement.current, electricalEvidenceId) : unknown("Rated current is not stated for the traditional heater."),
      required_circuit_a: requirement.current ? documented(requirement.current, electricalEvidenceId) : unknown("Required circuit rating is not stated for the traditional heater."),
      specified_breaker_a: unknown("A breaker rating is not stated on the reviewed product page."),
      connection: requirement.plug ? documented("plug-in", electricalEvidenceId) : unknown("Connection type is not stated for the traditional heater."),
      plug_type: requirement.plug ? documented(requirement.plug, electricalEvidenceId) : unknown("Plug type is not stated for the traditional heater."),
      dedicated_circuit: requirement.dedicated === null ? unknown("The reviewed page does not explicitly state whether this circuit must be dedicated.") : documented(requirement.dedicated, electricalEvidenceId),
    }],
  }));
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);

console.log(JSON.stringify({ enriched: models.map((entry) => entry.id), correctedHybridClassification: ["finnmark-fd-5"] }, null, 2));
