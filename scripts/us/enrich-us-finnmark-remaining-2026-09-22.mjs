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

// The remaining four records were previously range-level placeholders. Values below
// are limited to the model-level specifications exposed on the reviewed product pages.
// Unknown fields stay unknown until the corresponding installation document is checked.
const models = [
  {
    id: "finnmark-fd-2",
    heat: "infrared",
    placement: "indoor",
    form: "Indoor full-spectrum infrared cabin",
    capacity: 2,
    capacityRaw: "Capacity: 2 persons",
    exterior: dimensions(47, 36, 75),
    interior: null,
    materials: ["Antimicrobial Western Canadian cedar interior"],
    components: [{ type: "infrared-system", name: "Full-spectrum infrared heating system", inclusion: "included" }],
    electrical: [{ component: "infrared-system", power: 2400, voltage: null, current: null, phase: null, plug: null, dedicated: null }],
    locator: "Exact product page specifications: capacity, exterior dimensions, cedar interior and full-spectrum infrared power",
  },
  {
    id: "finnmark-fd-4",
    heat: "hybrid",
    placement: "indoor",
    form: "Indoor infrared and traditional combination cabin",
    capacity: 2,
    capacityRaw: "Capacity: 2 persons",
    exterior: dimensions(48, 48, 83),
    interior: dimensions(44.25, 45.5, 75.5),
    materials: ["Thermo-Aspen exterior", "Western Canadian cedar interior", "8 mm tempered glass door"],
    components: [
      { type: "infrared-system", name: "Full-spectrum infrared heating system", inclusion: "included" },
      { type: "heater", name: "Harvia Vega Compact 1.9 kW traditional heater", inclusion: "included" },
    ],
    electrical: [
      { component: "infrared-system", power: 1750, voltage: 120, current: 15, phase: 1, plug: "NEMA 5-15P", dedicated: null },
      { component: "heater", power: 1900, voltage: 120, current: 15.9, phase: 1, plug: null, dedicated: true },
    ],
    locator: "Exact product page specifications: capacity, dimensions, materials, included Harvia heater and separate infrared/heater electrical requirements",
  },
  {
    id: "finnmark-fd-6",
    heat: "hybrid",
    placement: "outdoor",
    form: "Outdoor infrared and traditional combination barrel",
    capacity: 6,
    capacityRaw: "Capacity: 4–6 persons; catalog value stores the documented maximum for filtering",
    exterior: dimensions(75, 79, 75),
    interior: dimensions(66, 72, 71),
    materials: ["Clear-grade Western Canadian cedar, 1.5 in staves", "Clear-grade Western Canadian cedar interior", "8 mm glass with rubber gasket"],
    components: [
      { type: "infrared-system", name: "Spectrum Plus infrared heater panels", inclusion: "included" },
      { type: "heater", name: "4.5 kW traditional heater", inclusion: "excluded" },
    ],
    electrical: [{ component: "heater", power: 4500, voltage: null, current: null, phase: null, plug: null, dedicated: null }],
    locator: "Exact product page specifications: 4–6-person capacity, barrel dimensions, cedar construction, infrared system and separately sold 4.5 kW heater",
  },
  {
    id: "finnmark-fd-7",
    heat: "hybrid",
    placement: "outdoor",
    form: "Outdoor infrared and traditional combination barrel",
    capacity: 6,
    capacityRaw: "Capacity: 4–6 persons; catalog value stores the documented maximum for filtering",
    exterior: dimensions(75, 79, 75),
    interior: dimensions(66, 72, 71),
    materials: ["Thermally modified European aspen (Thermo-Aspen), 1.5 in staves", "Thermally modified European aspen interior", "8 mm glass with rubber gasket"],
    components: [
      { type: "infrared-system", name: "Spectrum Plus infrared heater panels", inclusion: "included" },
      { type: "heater", name: "4.5 kW traditional heater", inclusion: "excluded" },
    ],
    electrical: [{ component: "heater", power: 4500, voltage: null, current: null, phase: null, plug: null, dedicated: null }],
    locator: "Exact product page specifications: 4–6-person capacity, barrel dimensions, Thermo-Aspen construction, infrared system and separately sold 4.5 kW heater",
  },
];

for (const model of models) {
  const product = productById.get(model.id);
  const configuration = configurationByProductId.get(model.id);
  const sourceId = `source-${model.id}-product`;
  const source = sourceById.get(sourceId);
  if (!product || !configuration || !source) throw new Error(`Missing existing Finnmark record ${model.id}`);

  const pEvidence = `evidence-${model.id}-verified-product-2026-09-22`;
  const cEvidence = `evidence-${model.id}-verified-configuration-2026-09-22`;
  const eEvidence = `evidence-${model.id}-verified-electrical-2026-09-22`;
  for (const id of [pEvidence, cEvidence, eEvidence]) {
    if (evidenceIds.has(id)) throw new Error(`Evidence already exists: ${id}`);
    evidenceIds.add(id);
  }

  source.checked_at = checkedAt;
  source.locator = model.locator;
  sources.evidence.push(
    { id: pEvidence, entity_id: model.id, source_id: sourceId, field_path: "product_identity_heat_placement", raw_value: `${product.model}: ${model.heat}; ${model.placement}; ${model.form}.` },
    { id: cEvidence, entity_id: configuration.id, source_id: sourceId, field_path: "configuration.capacity_dimensions_materials", raw_value: `${model.capacityRaw}; exterior ${JSON.stringify(model.exterior)}; interior ${model.interior ? JSON.stringify(model.interior) : "not stated"}; materials ${model.materials.join(", ")}.` },
    { id: eEvidence, entity_id: configuration.id, source_id: sourceId, field_path: "electrical_supply_options", raw_value: JSON.stringify(model.electrical) },
  );

  product.product_type = documented(product.product_type.value, pEvidence);
  product.heat_type = documented(model.heat, pEvidence);
  product.energy_sources = documented(["electric"], eEvidence);
  product.placements = documented([model.placement], pEvidence);
  product.form = documented(model.form, pEvidence);
  product.spec_checked_at = checkedAt;
  product.next_review_at = "2026-12-22";
  product.change_reason = "Exact model-level specifications replaced the earlier range-level placeholder data; unknown installation fields remain explicitly marked until the applicable manual is checked.";

  configuration.label = `${product.model} documented configuration`;
  configuration.capacity = { seated: documented(model.capacity, cEvidence), reclining: unknown("A reclining capacity is not stated on the reviewed product page.") };
  configuration.dimensions = {
    exterior: documented(model.exterior, cEvidence),
    interior: model.interior ? documented(model.interior, cEvidence) : unknown("Interior dimensions are not stated on the reviewed product page."),
    shipping: unknown("Shipping dimensions are not stated on the reviewed product page."),
    minimum_clearances: unknown("Installation clearances require the linked installation manual and a site review."),
  };
  configuration.materials = documented(model.materials, cEvidence);
  configuration.components = model.components.map((component, index) => ({
    id: `${configuration.id}-${component.type}-${index + 1}`,
    component_type: component.type,
    name: component.name,
    inclusion: component.inclusion,
    evidence_ids: [cEvidence],
  }));
  configuration.electrical_supply_options = model.electrical.map((requirement, index) => ({
    id: `${configuration.id}-electrical-${index + 1}`,
    evidence_ids: [eEvidence],
    requirements: [{
      component: requirement.component,
      voltage_v: requirement.voltage === null ? unknown("Voltage is not stated on the reviewed product page.") : documented(requirement.voltage, eEvidence),
      frequency_hz: unknown("Frequency is not stated on the reviewed product page."),
      phase: requirement.phase === null ? unknown("Phase is not stated on the reviewed product page.") : documented(requirement.phase, eEvidence),
      rated_power_w: requirement.power === null ? unknown("Rated power is not stated on the reviewed product page.") : documented(requirement.power, eEvidence),
      rated_current_a: requirement.current === null ? unknown("Rated current is not stated on the reviewed product page.") : documented(requirement.current, eEvidence),
      required_circuit_a: unknown("Required circuit rating is not stated on the reviewed product page."),
      specified_breaker_a: unknown("A breaker rating is not stated on the reviewed product page."),
      connection: requirement.plug ? documented("plug-in", eEvidence) : unknown("Connection type is not stated on the reviewed product page."),
      plug_type: requirement.plug ? documented(requirement.plug, eEvidence) : unknown("Plug type is not stated on the reviewed product page."),
      dedicated_circuit: requirement.dedicated === null ? unknown("Dedicated-circuit status is not stated on the reviewed product page.") : documented(requirement.dedicated, eEvidence),
    }],
  }));
  configuration.publication_status = "candidate";
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);

console.log(JSON.stringify({ enriched: models.map((entry) => entry.id), totalProducts: products.products.length }, null, 2));
