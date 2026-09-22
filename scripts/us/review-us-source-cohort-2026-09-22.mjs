import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checkedAt = "2026-09-22";
const nextReviewAt = "2026-12-22";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const conflict = (evidenceIds, note) => ({ status: "conflict", evidence_ids: evidenceIds, note });

const [products, configurations, sources] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
]);

const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationByProductId = new Map(configurations.configurations.map((entry) => [entry.product_id, entry]));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidenceById = new Map(sources.evidence.map((entry) => [entry.id, entry]));

function requireRecord(id) {
  const product = productById.get(id);
  const configuration = configurationByProductId.get(id);
  const source = sourceById.get(`source-${id}-product`);
  if (!product || !configuration || !source) throw new Error(`Missing source-review record ${id}`);
  return { product, configuration, source };
}

function upsertEvidence(entry) {
  const existing = evidenceById.get(entry.id);
  if (existing) Object.assign(existing, entry);
  else {
    sources.evidence.push(entry);
    evidenceById.set(entry.id, entry);
  }
}

function findComponent(configuration, type) {
  const component = configuration.components.find((entry) => entry.component_type === type);
  if (!component) throw new Error(`Missing ${type} component in ${configuration.id}`);
  return component;
}

// Salus describes this model consistently as hybrid, but its own page conflicts
// between an 8 kW / 40 A electrical section and a 6 kW / 30 A feature list.
// Preserve both statements instead of selecting one for publication.
{
  const { product, configuration, source } = requireRecord("salus-renew-king");
  const sectionEvidence = "evidence-salus-renew-king-electrical-section-2026-09-22";
  const featureEvidence = "evidence-salus-renew-king-features-section-2026-09-22";
  upsertEvidence({
    id: sectionEvidence,
    entity_id: configuration.id,
    source_id: source.id,
    field_path: "electrical_supply_options.requirements.electrical_section",
    raw_value: "Official Electrical Requirements: traditional heater 8 kW; 40 A breaker; the 40 A breaker feeds the infrared system, traditional heater and lighting.",
  });
  upsertEvidence({
    id: featureEvidence,
    entity_id: configuration.id,
    source_id: source.id,
    field_path: "electrical_supply_options.requirements.features_section",
    raw_value: "Official Features & Specifications: Harvia WALL 6 kW traditional stove; 240 V / 30 A service.",
  });
  const conflictIds = [sectionEvidence, featureEvidence];
  product.heat_type = documented("hybrid", "evidence-salus-renew-king-product");
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "The official page confirms a hybrid traditional/infrared cabin but conflicts on traditional-heater output and circuit sizing. The record remains a candidate until Salus resolves the 6 kW / 30 A versus 8 kW / 40 A discrepancy.";
  source.checked_at = checkedAt;
  source.locator = "Exact manufacturer product page: hybrid identity, dimensions and materials; conflicting electrical statements in Electrical Requirements and Features & Specifications";
  const heater = findComponent(configuration, "heater");
  heater.name = "Traditional sauna stove; official page conflicts between 6 kW and 8 kW";
  const requirement = configuration.electrical_supply_options[0].requirements[0];
  requirement.rated_power_w = conflict(conflictIds, "The same official product page states both 8 kW and 6 kW for the traditional heater.");
  requirement.rated_current_a = conflict(conflictIds, "The same official product page states both 40 A and 30 A service.");
  requirement.required_circuit_a = conflict(conflictIds, "The same official product page states both 40 A and 30 A service.");
  requirement.specified_breaker_a = conflict(conflictIds, "The same official product page states both a 40 A breaker and 30 A service.");
  configuration.electrical_supply_options[0].evidence_ids = conflictIds;
}

// The Deluxe Panorama page specifies two separate 50 A breakers. A scalar 100 A
// value incorrectly implies one circuit and is removed until split circuits can be
// represented explicitly in the normalized schema.
{
  const { product, configuration, source } = requireRecord("salus-deluxe-panorama");
  const electricalEvidence = "evidence-salus-deluxe-panorama-electrical";
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "The exact manufacturer page verifies the cabin and 15 kW electric option. Its two separate 50 A breakers cannot be represented as one 100 A circuit, so scalar current fields remain unknown pending split-circuit modeling.";
  source.checked_at = checkedAt;
  source.locator = "Exact manufacturer product page: six-person glass cabin dimensions, materials and 15 kW electric option requiring two separate 50 A breakers";
  for (const component of configuration.components.filter((entry) => entry.component_type === "heater")) {
    component.inclusion = "unknown";
    component.name = `${component.name.replace(/ option$/, "")} option; selected package is not captured in this base record`;
  }
  const requirement = configuration.electrical_supply_options[0].requirements[0];
  requirement.rated_current_a = unknown("The page specifies two separate 50 A breakers, not one aggregate rated-current value.");
  requirement.required_circuit_a = unknown("The page specifies two separate 50 A breakers; the current scalar field cannot represent the split circuits safely.");
  requirement.specified_breaker_a = unknown("Two separate 50 A breakers are specified. They must not be normalized as one 100 A breaker.");
  configuration.electrical_supply_options[0].evidence_ids = [electricalEvidence];
}

const geyserTraditional = [
  {
    id: "geyser-hekla",
    form: "Indoor/outdoor traditional cabin with optional infrared and red-light add-ons",
    raw: "GeyserSteam lists Hekla as a 2–3 person indoor/outdoor traditional sauna. Infrared panels and red light are optional add-ons with separate power requirements.",
  },
  {
    id: "geyser-lukaku",
    form: "Indoor/outdoor traditional cabin with an optional infrared add-on",
    raw: "GeyserSteam lists Lukaku as a 6–8 person indoor/outdoor sauna with a 13.5 kW traditional heater; infrared is offered as an optional add-on.",
  },
  {
    id: "geyser-autana",
    form: "Indoor/outdoor traditional cabin with an optional infrared add-on",
    raw: "GeyserSteam lists Autana as an indoor/outdoor sauna with a 13.5 kW traditional heater; infrared is offered as an optional add-on. The page conflicts on maximum capacity.",
  },
  {
    id: "geyser-valera",
    form: "Indoor/outdoor traditional cabin with optional infrared and red-light add-ons",
    raw: "GeyserSteam lists Valera as a 4–5 person indoor/outdoor sauna with a 9 kW traditional heater; infrared and red light are optional add-ons.",
  },
];

for (const model of geyserTraditional) {
  const { product, configuration, source } = requireRecord(model.id);
  const productEvidence = `evidence-${model.id}-product`;
  product.heat_type = documented("traditional", productEvidence);
  product.form = documented(model.form, productEvidence);
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "The exact manufacturer page was rechecked. The normalized record now separates the included traditional heater from optional infrared or red-light add-ons.";
  source.checked_at = checkedAt;
  source.locator = "Exact manufacturer product page: current title, specification table, included traditional heater and optional add-ons";
  const infrared = findComponent(configuration, "infrared-system");
  infrared.inclusion = "excluded";
  infrared.name = infrared.name.replace(/^Optional /, "").replace(/ add-ons?$/, "") + " offered as an optional add-on";
  const evidence = evidenceById.get(productEvidence);
  if (!evidence) throw new Error(`Missing evidence ${productEvidence}`);
  evidence.raw_value = model.raw;
}

// Autana's heading says 6–8 people while the specification table says 4–6.
// Keep the maximum-capacity fact in conflict rather than silently preferring one.
{
  const { product, configuration } = requireRecord("geyser-autana");
  const headingEvidence = "evidence-geyser-autana-capacity-heading-2026-09-22";
  const tableEvidence = "evidence-geyser-autana-capacity-table-2026-09-22";
  upsertEvidence({
    id: headingEvidence,
    entity_id: configuration.id,
    source_id: "source-geyser-autana-product",
    field_path: "capacity.heading",
    raw_value: "Official product heading: Autana - 6 - 8 person Indoor & Outdoor Traditional & Infrared Sauna.",
  });
  upsertEvidence({
    id: tableEvidence,
    entity_id: configuration.id,
    source_id: "source-geyser-autana-product",
    field_path: "capacity.specification_table",
    raw_value: "Official specification table: Capacity 4-6 person.",
  });
  configuration.capacity.seated = conflict(
    [headingEvidence, tableEvidence],
    "The official heading states 6–8 people, while the specification table states 4–6 people.",
  );
  product.change_reason = "The exact manufacturer page confirms the traditional base heater and optional infrared add-on, but its heading and specification table conflict on maximum capacity. Publication remains blocked until clarified.";
}

// Balerion is the current on-page product identity even though the legacy Shopify
// handle still contains “doragon”. Record the distinction to avoid a false mismatch.
{
  const { product, source } = requireRecord("geyser-balerion");
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "The exact manufacturer page currently identifies the model as Balerion. The retained Shopify URL handle contains an older name, but the page title and specifications match this catalog record.";
  source.checked_at = checkedAt;
  source.title = "Balerion 6–8 Person Indoor & Outdoor Infrared Sauna product page";
  source.locator = "Exact manufacturer product page: current Balerion identity, 6–8-person capacity, dimensions, full-spectrum infrared system and electrical requirements; URL retains a legacy handle";
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);

console.log(JSON.stringify({
  reviewed: [
    "salus-renew-king",
    "salus-deluxe-panorama",
    "geyser-hekla",
    "geyser-lukaku",
    "geyser-autana",
    "geyser-valera",
    "geyser-balerion",
  ],
  heldForConflictOrSchema: ["salus-renew-king", "salus-deluxe-panorama", "geyser-autana"],
}, null, 2));
