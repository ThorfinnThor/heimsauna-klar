import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const writeJson = async (path, value) => writeFile(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const unknown = (reason) => ({ status: "unknown", reason });
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });

const [configurations, sources, readiness] = await Promise.all([
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("docs/us/indexing-readiness.json"),
]);

const configurationById = new Map(configurations.configurations.map((entry) => [entry.id, entry]));
const evidenceById = new Map(sources.evidence.map((entry) => [entry.id, entry]));
const requireConfiguration = (id) => {
  const configuration = configurationById.get(id);
  if (!configuration) throw new Error(`Missing configuration ${id}`);
  return configuration;
};
const requireEvidence = (id) => {
  const evidence = evidenceById.get(id);
  if (!evidence) throw new Error(`Missing evidence ${id}`);
  return evidence;
};
const requirementFor = (productId) => {
  const configuration = requireConfiguration(`${productId}-standard`);
  const requirements = configuration.electrical_supply_options?.flatMap((option) => option.requirements ?? []) ?? [];
  if (requirements.length !== 1) throw new Error(`${productId}: expected one electrical requirement, found ${requirements.length}`);
  return requirements[0];
};

const senecaRequirement = requirementFor("almost-heaven-seneca");
senecaRequirement.specified_breaker_a = unknown("Breaker rating is not stated in the reviewed catalog record.");

const finnleoIds = [
  "finnleo-northstar-indoor-sauna-4-x-4-9-0550",
  "finnleo-northstar-indoor-sauna-4-x-6-9630-2263",
  "finnleo-northstar-indoor-sauna-5-x-6-9630-2264",
  "finnleo-northstar-indoor-sauna-5-x-7-9630-2265",
  "finnleo-vita-ii-9-0503",
  "finnleo-centurion-9-0504",
  "finnleo-twilight-9-0501",
  "finnleo-solace-9-0502",
  "finnleo-is440-infrasauna-9-0602",
  "finnleo-is565-infrasauna-9805-0840",
];
for (const productId of finnleoIds) {
  requireConfiguration(`${productId}-standard`).manufacturer_sku = unknown(
    "The reviewed Finnleo page does not explicitly label a manufacturer SKU; the URL slug is not treated as one.",
  );
}

const is565EvidenceId = "evidence-finnleo-is565-infrasauna-9805-0840-depth-electrical";
const is565Requirement = requirementFor("finnleo-is565-infrasauna-9805-0840");
is565Requirement.required_circuit_a = documented(30, is565EvidenceId);
is565Requirement.specified_breaker_a = documented(30, is565EvidenceId);
is565Requirement.connection = documented("hardwired", is565EvidenceId);
is565Requirement.dedicated_circuit = unknown(
  "The exact Finnleo model page specifies a 30-amp breaker but does not state that the circuit is dedicated.",
);

for (const productId of ["redwood-horizon-6", "redwood-summit-6"]) {
  const configuration = requireConfiguration(`${productId}-standard`);
  configuration.net_weight = unknown("The manufacturer page gives a listed weight but does not identify it as net weight.");
}

const luleaConfiguration = requireConfiguration("tylo-lulea-4-standard");
const combinedFeature = luleaConfiguration.components.find((entry) => entry.name === "Bluetooth sound and chromotherapy");
if (combinedFeature) {
  combinedFeature.name = "Chromotherapy lighting";
  combinedFeature.component_type = "lighting";
}
if (!luleaConfiguration.components.some((entry) => entry.name === "Optional Bluetooth sound bar")) {
  luleaConfiguration.components.push({
    id: "tylo-lulea-4-standard-component-4",
    component_type: "other",
    name: "Optional Bluetooth sound bar",
    inclusion: "excluded",
    evidence_ids: ["evidence-tylo-lulea-4-product"],
  });
}

const setElectricalSemantics = (productId, { breaker, connection, dedicated }) => {
  const requirement = requirementFor(productId);
  const evidenceId = `evidence-${productId}-electrical`;
  requirement.specified_breaker_a = breaker === null
    ? unknown("The reviewed product page does not state a breaker rating.")
    : documented(breaker, evidenceId);
  requirement.connection = connection === null
    ? unknown("The reviewed product page does not state the connection type.")
    : documented(connection, evidenceId);
  requirement.dedicated_circuit = dedicated === null
    ? unknown("The reviewed product page does not state that a dedicated circuit is required.")
    : documented(dedicated, evidenceId);
};

setElectricalSemantics("tylo-lulea-4", { breaker: null, connection: null, dedicated: null });
for (const productId of ["geyser-hekla", "geyser-lukaku", "geyser-valera"]) {
  setElectricalSemantics(productId, { breaker: null, connection: null, dedicated: null });
}
setElectricalSemantics("geyser-balerion", { breaker: 30, connection: null, dedicated: null });
for (const productId of ["sunray-bristow", "sunray-aurora"]) {
  setElectricalSemantics(productId, { breaker: null, connection: "hardwired", dedicated: true });
}
setElectricalSemantics("salus-ally", { breaker: null, connection: "hardwired", dedicated: null });

requireEvidence("evidence-tylo-lulea-4-product").raw_value =
  "Tylo lists Lulea 4 as an outdoor traditional sauna for three or four people with clear hemlock, a Sense Bliss 8 heater, included chromotherapy lighting and an optional Bluetooth sound bar.";
requireEvidence("evidence-tylo-lulea-4-electrical").raw_value =
  "The exact Tylo Lulea 4 page states electrical requirements of 240 V / 35 A and an 8 kW heater. It does not state a breaker rating, connection type or dedicated-circuit requirement.";
requireEvidence("evidence-geyser-hekla-electrical").raw_value =
  "The exact Hekla page states 220 V, 30 AMP connection required and a 6,000 W heater. It does not state a breaker rating, hardwired connection or dedicated circuit.";
requireEvidence("evidence-geyser-lukaku-electrical").raw_value =
  "The exact Lukaku page states a 13.5 kW heater and 240 V / 65 A electrical service. It does not state a breaker rating, connection type or dedicated circuit.";
requireEvidence("evidence-geyser-valera-electrical").raw_value =
  "The exact Valera page states a 9 kW heater and 220 V / 40 A electrical service. It does not state a breaker rating, connection type or dedicated circuit.";
requireEvidence("evidence-geyser-balerion-electrical").raw_value =
  "The exact Balerion page states 5,000 W at 240 V and a 30 AMP breaker. It does not state a connection type or dedicated-circuit requirement.";
requireEvidence("evidence-sunray-bristow-electrical").raw_value =
  "The exact Bristow page states 220 V, 4,500 W and a 30 A dedicated hardwired circuit. It does not state a breaker rating.";
requireEvidence("evidence-sunray-aurora-electrical").raw_value =
  "The exact Aurora page states 220 V, 6,000 W and a 30 A dedicated hardwired circuit. It does not state a breaker rating.";
requireEvidence("evidence-salus-ally-electrical").raw_value =
  "The exact Ally page states a 220/240 V hardwired 30 A connection for the 6 kW heater. It does not state a breaker rating or dedicated-circuit requirement.";

const heldProductId = "finnleo-northstar-indoor-sauna-5-x-6-9630-2264";
readiness.third_wave.product_ids = readiness.third_wave.product_ids.filter((id) => id !== heldProductId);
if (!readiness.third_wave.held_product_ids.includes(heldProductId)) readiness.third_wave.held_product_ids.push(heldProductId);
readiness.current_result.third_wave_products = readiness.third_wave.product_ids.length;
readiness.current_result.third_wave_data_qualified = readiness.third_wave.product_ids.length;
readiness.current_result.third_wave_editorial_prepared = readiness.third_wave.product_ids.length;

await Promise.all([
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
  writeJson("docs/us/indexing-readiness.json", readiness),
]);

console.log(JSON.stringify({
  thirdWave: readiness.third_wave.product_ids.length,
  held: readiness.third_wave.held_product_ids.length,
  correctedFinnleoSkus: finnleoIds.length,
}, null, 2));
