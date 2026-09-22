import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-18";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const dimensions = (width, depth, height) => ({
  width: { value: width, unit: "in" },
  depth: { value: depth, unit: "in" },
  height: { value: height, unit: "in" },
});

const models = [
  {
    id: "sunray-bristow",
    model: "Bristow 2-Person Outdoor Wet/Dry Traditional Sauna",
    url: "https://www.sunraysaunas.com/products/bristow-2-person-outdoor-traditional-sauna",
    heat: "traditional", placements: ["outdoor"], capacity: 2, form: "Outdoor traditional sauna cabin",
    exterior: dimensions(50, 50, 98), interior: dimensions(45, 45, 73), materials: ["Canadian hemlock", "Metal roof"],
    components: [{ name: "4.5 kW Harvia electric heater", type: "heater" }, { name: "Chromotherapy lighting", type: "lighting" }, { name: "Bluetooth speaker system", type: "other" }],
    electrical: { voltage: 220, power: 4500, current: 30, requiredCircuit: 30, breaker: null, connection: "hardwired", dedicated: true },
    identity: "The Bristow 2-person outdoor wet/dry traditional sauna is listed by SunRay Saunas with a Canadian hemlock cabin, 4.5 kW Harvia heater and metal roof.",
    config: "The official page lists 50 in W × 50 in D × 98 in H exterior dimensions and 45 in W × 45 in D × 73 in H interior dimensions. It states 220 V, 4,500 W and a 30 A dedicated circuit.",
  },
  {
    id: "sunray-aurora",
    model: "Aurora 2-4 Person Traditional Wet/Dry Barrel Sauna",
    url: "https://www.sunraysaunas.com/products/aurora-2-4-person-traditional-barrel-sauna",
    heat: "traditional", placements: ["indoor", "outdoor"], capacity: 4, form: "Traditional barrel sauna",
    exterior: dimensions(72, 61, 76), interior: dimensions(69, 51, 69), materials: ["Western red cedar", "Tempered glass", "Stainless steel hardware"],
    components: [{ name: "6 kW Harvia electric heater with stones", type: "heater" }, { name: "Flat floor kit", type: "other" }, { name: "Shingled roof", type: "other" }],
    electrical: { voltage: 220, power: 6000, current: 30, requiredCircuit: 30, breaker: null, connection: "hardwired", dedicated: true },
    identity: "The Aurora is listed as a 2-4 person traditional wet/dry barrel sauna with Western red cedar construction and a 6 kW Harvia heater.",
    config: "The official page lists a 72 in wide × 61 in deep × 76 in high exterior, 69 in wide × 51 in deep × 69 in high interior, 220 V, 6,000 W and a 30 A circuit.",
  },
  {
    id: "sunray-sedona",
    model: "Sedona 1-2 Person Indoor Infrared Cedar Sauna",
    url: "https://www.sunraysaunas.com/products/1-2-person-indoor-infrared-sauna",
    heat: "infrared", placements: ["indoor"], capacity: 2, form: "Indoor infrared sauna cabin",
    exterior: dimensions(36, 42, 75), interior: null, materials: ["Western red cedar"],
    components: [{ name: "Five carbon-nano infrared heaters", type: "infrared-system" }, { name: "Chromotherapy lighting", type: "lighting" }, { name: "Bluetooth speaker system", type: "other" }],
    electrical: { voltage: 120, power: null, current: null, requiredCircuit: null, breaker: null, connection: "plug-in", dedicated: null },
    identity: "SunRay lists the Sedona as a 1-2 person indoor infrared cedar sauna with carbon-nano heaters and a standard household outlet.",
    config: "The official page lists 36 in W × 42 in D × 75 in H and 120 V standard-outlet operation. The page does not state a rated wattage in the reviewed section.",
  },
  {
    id: "sunray-evansport",
    model: "Evansport 2-Person Indoor Infrared Sauna",
    url: "https://www.sunraysaunas.com/products/2-person-indoor-infrared-sauna",
    heat: "infrared", placements: ["indoor"], capacity: 2, form: "Indoor infrared sauna cabin",
    exterior: dimensions(48, 45, 75), interior: null, materials: ["Canadian hemlock"],
    components: [{ name: "Seven carbon-nano infrared heaters", type: "infrared-system" }, { name: "Dual LED control panels", type: "controls" }, { name: "Bluetooth speaker system", type: "other" }],
    electrical: { voltage: 120, power: 1665, current: null, requiredCircuit: null, breaker: null, connection: "plug-in", dedicated: null },
    identity: "The Evansport is listed as a 2-person indoor infrared sauna built from Canadian hemlock with seven carbon-nano heaters.",
    config: "The official page lists 47 in W × 45 in D × 75 in H overall dimensions, 120 V operation and 1,665 W. It describes a standard household outlet.",
  },
  {
    id: "sunray-aspen",
    model: "Aspen 3-Person Indoor Infrared Sauna",
    url: "https://www.sunraysaunas.com/products/3-person-indoor-infrared-sauna",
    heat: "infrared", placements: ["indoor"], capacity: 3, form: "Indoor infrared sauna cabin",
    exterior: dimensions(59, 47, 75), interior: null, materials: ["Canadian hemlock"],
    components: [{ name: "Carbon-nano infrared heaters", type: "infrared-system" }, { name: "Chromotherapy lighting", type: "lighting" }, { name: "Bluetooth speaker system", type: "other" }],
    electrical: { voltage: 120, power: null, current: null, requiredCircuit: null, breaker: null, connection: "plug-in", dedicated: true },
    identity: "SunRay lists the Aspen as a 3-person indoor infrared sauna made from Canadian hemlock with carbon-nano heaters.",
    config: "The official page lists 59 in W × 47 in D × 75 in H and a dedicated 110-120 V outlet. A rated wattage is not stated in the reviewed page section.",
  },
  {
    id: "sunray-cayenne",
    model: "Cayenne 4-Person Outdoor Infrared Sauna",
    url: "https://www.sunraysaunas.com/products/4-person-outdoor-infrared-sauna",
    heat: "infrared", placements: ["outdoor"], capacity: 4, form: "Outdoor infrared sauna cabin",
    exterior: dimensions(79, 52, 87), interior: null, materials: ["Canadian hemlock", "Metal composite roof"],
    components: [{ name: "Ten far-infrared heaters", type: "infrared-system" }, { name: "Weatherproof sealed cabin", type: "other" }],
    electrical: { voltage: 120, power: null, current: 20, requiredCircuit: 20, breaker: null, connection: "plug-in", dedicated: true },
    identity: "The Cayenne is listed by SunRay as a 4-person outdoor infrared sauna with a sealed weatherproof cabin and metal composite roof.",
    config: "The official page lists 79 in W × 52 in D × 87 in H, Canadian hemlock, ten far-infrared heaters and a dedicated 110-120 V, 20 A outlet.",
  },
  {
    id: "sunray-grandby",
    model: "Grandby 3-Person Outdoor Infrared Sauna",
    url: "https://www.sunraysaunas.com/products/3-person-outdoor-infrared-sauna",
    heat: "infrared", placements: ["outdoor"], capacity: 3, form: "Outdoor infrared sauna cabin",
    exterior: dimensions(69, 47, 87), interior: null, materials: ["Canadian hemlock", "Metal composite roof"],
    components: [{ name: "Seven far-infrared heaters", type: "infrared-system" }, { name: "Weatherproof sealed cabin", type: "other" }],
    electrical: { voltage: 120, power: null, current: null, requiredCircuit: null, breaker: null, connection: "plug-in", dedicated: true },
    identity: "SunRay lists the Grandby as a 3-person outdoor infrared sauna with a sealed weatherproof cabin and metal composite roof.",
    config: "The official page lists 69 in W × 47 in D × 87 in H, Canadian hemlock, seven far-infrared heaters and a dedicated 110-120 V outlet.",
  },
];

const [products, configurations, sources, merchants, rights] = await Promise.all([
  readJson("data/us/products.json"), readJson("data/us/configurations.json"), readJson("data/us/sources.json"),
  readJson("data/us/merchants.json"), readJson("docs/us/rights-register.json"),
]);
if (products.products.some((entry) => models.some((model) => model.id === entry.id))) throw new Error("SunRay batch was already imported");
if (!merchants.merchants.some((entry) => entry.id === "sunray-saunas")) merchants.merchants.push({ id: "sunray-saunas", market: "US", name: "SunRay Saunas", kind: "manufacturer", allowed_hosts: ["sunraysaunas.com"], status: "candidate" });
const sourceIds = new Set(sources.sources.map((entry) => entry.id));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidence = [];
for (const model of models) {
  const sourceId = `source-${model.id}-product`;
  const productEvidenceId = `evidence-${model.id}-product`;
  const configEvidenceId = `evidence-${model.id}-configuration`;
  const electricalEvidenceId = `evidence-${model.id}-electrical`;
  if (!sourceIds.has(sourceId)) {
    const source = { id: sourceId, type: "manufacturer-page", url: model.url, title: `${model.model} product page`, publisher: "SunRay Saunas", market: "US", checked_at: today, locator: "Product identity, dimensions, materials, electrical and included components" };
    sources.sources.push(source); sourceById.set(sourceId, source); sourceIds.add(sourceId);
  }
  const configId = `${model.id}-standard`;
  products.products.push({
    id: model.id, market: "US", slug: model.id, brand_name: "SunRay Saunas", model: model.model,
    product_type: documented("sauna-cabin", productEvidenceId), heat_type: documented(model.heat, productEvidenceId), energy_sources: documented(["electric"], electricalEvidenceId),
    placements: documented(model.placements, productEvidenceId), form: documented(model.form, productEvidenceId), configuration_ids: [configId], source_ids: [sourceId],
    publication_status: "candidate", spec_checked_at: today, next_review_at: "2026-12-18", change_reason: "Added from an exact official SunRay US product page; editorial and publication review remain open.",
  });
  const electrical = model.electrical;
  configurations.configurations.push({
    id: configId, market: "US", product_id: model.id, label: `${model.model} documented base configuration`, manufacturer_sku: unknown("The reviewed product page does not expose a stable manufacturer SKU in the catalog record."),
    capacity: { seated: documented(model.capacity, configEvidenceId), reclining: unknown("A reclining capacity is not stated on the reviewed product page.") },
    dimensions: { exterior: documented(model.exterior, configEvidenceId), interior: model.interior ? documented(model.interior, configEvidenceId) : unknown("Interior dimensions are not stated on the reviewed product page."), shipping: unknown("Shipping dimensions are not stated on the reviewed product page."), minimum_clearances: unknown("Installation clearances require the manufacturer's instructions and a site review.") },
    net_weight: unknown("Net weight is not stated on the reviewed product page."), shipping_weight: unknown("Shipping weight is not stated on the reviewed product page."), materials: documented(model.materials, configEvidenceId), components: model.components.map((component, index) => ({ id: `${configId}-component-${index + 1}`, component_type: component.type, name: component.name, inclusion: "included", evidence_ids: [productEvidenceId] })),
    electrical_supply_options: [{ id: `${configId}-electrical`, requirements: [{ component: model.heat === "infrared" ? "infrared-system" : "heater", voltage_v: documented(electrical.voltage, electricalEvidenceId), frequency_hz: unknown("Frequency is not stated on the reviewed product page."), phase: unknown("Phase is not stated on the reviewed product page."), rated_power_w: electrical.power ? documented(electrical.power, electricalEvidenceId) : unknown("Rated power is not stated on the reviewed product page."), rated_current_a: electrical.current ? documented(electrical.current, electricalEvidenceId) : unknown("Rated current is not stated on the reviewed product page."), required_circuit_a: electrical.requiredCircuit ? documented(electrical.requiredCircuit, electricalEvidenceId) : unknown("Required circuit rating is not stated on the reviewed product page."), specified_breaker_a: electrical.breaker ? documented(electrical.breaker, electricalEvidenceId) : unknown("Breaker rating is not stated on the reviewed product page."), connection: electrical.connection ? documented(electrical.connection, electricalEvidenceId) : unknown("Connection type is not stated on the reviewed product page."), plug_type: unknown("Plug type is not stated on the reviewed product page."), dedicated_circuit: electrical.dedicated === null ? unknown("Dedicated-circuit status is not stated on the reviewed product page.") : documented(electrical.dedicated, electricalEvidenceId) }], evidence_ids: [electricalEvidenceId] }],
    certification_ids: [], warranty_ids: [], source_ids: [sourceId], publication_status: "candidate",
  });
  evidence.push(
    { id: productEvidenceId, entity_id: model.id, source_id: sourceId, field_path: "product_identity", raw_value: model.identity },
    { id: configEvidenceId, entity_id: configId, source_id: sourceId, field_path: "configuration.capacity_dimensions_materials", raw_value: model.config },
    { id: electricalEvidenceId, entity_id: configId, source_id: sourceId, field_path: "electrical_supply_options", raw_value: `${model.model}: ${JSON.stringify(model.electrical)}` },
  );
  rights.assets.push({ asset_id: `${model.id}-image`, entity_id: model.id, merchant_id: "sunray-saunas", asset_type: "manufacturer-image", source_url: model.url, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}
sources.evidence.push(...evidence); rights.updated_at = today;
await Promise.all([
  writeJson("data/us/products.json", products), writeJson("data/us/configurations.json", configurations), writeJson("data/us/sources.json", sources),
  writeJson("data/us/merchants.json", merchants), writeJson("docs/us/rights-register.json", rights),
]);
console.log(JSON.stringify({ addedCandidates: models.length, totalProducts: products.products.length, models: models.map((model) => model.id) }, null, 2));
