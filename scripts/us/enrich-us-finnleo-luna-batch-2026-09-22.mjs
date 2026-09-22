import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checkedAt = "2026-09-22";
const nextReviewAt = "2026-12-22";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });

const [products, configurations, sources] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
]);
const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationById = new Map(configurations.configurations.map((entry) => [entry.id, entry]));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidenceById = new Map(sources.evidence.map((entry) => [entry.id, entry]));

// These four records already have official Finnleo model-page sources. This batch
// adds the model-specific component and electrical facts stated on those pages;
// unstated installation facts stay unknown.
const records = [
  {
    id: "finnleo-hallmark-44-9-0601",
    productForm: "Indoor portable traditional sauna cabin",
    energy: ["electric"],
    components: [{ type: "heater", name: "Piccolo Mini sauna heater", inclusion: "included" }],
    component: "heater",
    voltage: 120,
    power: null,
    current: null,
    connection: "plug-in",
    dedicated: null,
    rawElectrical: "Finnleo lists a 120 V plug-in Hallmark 44 with a Piccolo Mini heater; rated power, current and circuit rating are not stated on the model page.",
  },
  {
    id: "finnleo-is440-infrasauna-9-0602",
    productForm: "Indoor hybrid infrared and traditional sauna cabin",
    energy: ["electric"],
    components: [
      { type: "infrared-system", name: "Low-EMR/EF infrared panel system", inclusion: "included" },
      { type: "heater", name: "Piccolo Mini traditional sauna heater", inclusion: "included" },
    ],
    component: "other",
    voltage: 120,
    power: null,
    current: null,
    connection: "plug-in",
    dedicated: false,
    rawElectrical: "Finnleo lists 1.7 or 2.1 kW heating options at 120 V and says the IS440 plugs into a household outlet; no single rated power, current or circuit rating is stated for the configuration.",
  },
  {
    id: "finnleo-solace-9-0502",
    productForm: "Indoor traditional sauna cabin",
    energy: ["electric"],
    components: [{ type: "heater", name: "Designer-SL2 sauna heater", inclusion: "included" }],
    component: "heater",
    voltage: 240,
    power: 6000,
    current: null,
    connection: null,
    dedicated: null,
    rawElectrical: "Finnleo lists the Designer-SL2 heater at 6.0 kW and 240 V for Solace; current, connection and circuit rating are not stated on the model page.",
  },
  {
    id: "finnleo-twilight-9-0501",
    productForm: "Indoor traditional sauna cabin",
    energy: ["electric"],
    components: [{ type: "heater", name: "Designer-SL2 sauna heater", inclusion: "included" }],
    component: "heater",
    voltage: null,
    power: null,
    current: null,
    connection: null,
    dedicated: null,
    rawElectrical: "Finnleo lists the Designer-SL2 heater for Twilight but does not state voltage, power, current or circuit details on the model page.",
  },
];

for (const record of records) {
  const product = productById.get(record.id);
  const configuration = configurationById.get(`${record.id}-standard`);
  const sourceId = `source-${record.id}-product`;
  if (!product || !configuration || !sourceById.has(sourceId)) throw new Error(`Missing Finnleo record ${record.id}`);
  const productEvidence = evidenceById.get(`evidence-${record.id}-depth-product`);
  const configurationEvidence = evidenceById.get(`evidence-${record.id}-depth-configuration`);
  const electricalEvidence = evidenceById.get(`evidence-${record.id}-depth-electrical`);
  if (!productEvidence || !configurationEvidence || !electricalEvidence) throw new Error(`Missing depth evidence for ${record.id}`);

  sourceById.get(sourceId).checked_at = checkedAt;
  sourceById.get(sourceId).locator = "Exact Finnleo model page with model-specific capacity, dimensions, materials, included heater and electrical details where stated";
  productEvidence.raw_value = `${productEvidence.raw_value.split(" The model page identifies")[0]} The model page identifies the model's form and included heating equipment.`;
  configurationEvidence.raw_value = `${configurationEvidence.raw_value.split(" Included components:")[0]} Included components: ${record.components.map((component) => component.name).join(", ")}.`;
  electricalEvidence.raw_value = record.rawElectrical;

  product.placements = documented(["indoor"], productEvidence.id);
  product.form = documented(record.productForm, productEvidence.id);
  product.energy_sources = documented(record.energy, electricalEvidence.id);
  product.spec_checked_at = checkedAt;
  product.next_review_at = nextReviewAt;
  product.change_reason = "Luna batch adds model-specific Finnleo component and electrical facts from the official product page; installation fields not stated there remain unknown.";

  configuration.components = record.components.map((component, index) => ({
    id: `${configuration.id}-component-${index + 1}`,
    component_type: component.type,
    name: component.name,
    inclusion: component.inclusion,
    evidence_ids: [productEvidence.id],
  }));
  const requirement = configuration.electrical_supply_options[0]?.requirements?.[0];
  if (!requirement) throw new Error(`Missing electrical requirement for ${record.id}`);
  requirement.component = record.component;
  requirement.voltage_v = record.voltage === null ? unknown("The exact Finnleo model page does not state a supply voltage.") : documented(record.voltage, electricalEvidence.id);
  requirement.rated_power_w = record.power === null ? unknown("The exact Finnleo model page does not state one single rated power for this configuration.") : documented(record.power, electricalEvidence.id);
  requirement.rated_current_a = record.current === null ? unknown("The exact Finnleo model page does not state a rated current.") : documented(record.current, electricalEvidence.id);
  requirement.required_circuit_a = unknown("The exact Finnleo model page does not state a required circuit rating.");
  requirement.specified_breaker_a = unknown("Breaker rating is not stated on the exact Finnleo model page.");
  requirement.connection = record.connection === null ? unknown("The exact Finnleo model page does not state a normalized connection type.") : documented(record.connection, electricalEvidence.id);
  requirement.plug_type = unknown("Plug type is not stated on the exact Finnleo model page.");
  requirement.dedicated_circuit = record.dedicated === null ? unknown("The exact Finnleo model page does not state whether a dedicated circuit is required.") : documented(record.dedicated, electricalEvidence.id);
  configuration.source_ids = [...new Set([...configuration.source_ids, sourceId])];
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);
console.log(`Deepened ${records.length} Finnleo US records for the Luna batch.`);
