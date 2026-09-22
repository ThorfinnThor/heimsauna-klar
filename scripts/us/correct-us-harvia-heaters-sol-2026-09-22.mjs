import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const unknown = (reason) => ({ status: "unknown", reason });
const notApplicable = (reason) => ({ status: "not-applicable", reason });

const [products, configurations, sources] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
]);

const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationByProductId = new Map(configurations.configurations.map((entry) => [entry.product_id, entry]));
const evidenceById = new Map(sources.evidence.map((entry) => [entry.id, entry]));
const ids = ["harvia-concept-r-105", "harvia-virta-wall-hlw90e", "harvia-legend-po70fc", "harvia-concept-r-combi-105"];

for (const id of ids) {
  const product = productById.get(id);
  const configuration = configurationByProductId.get(id);
  if (!product || !configuration) throw new Error(`Missing Harvia record ${id}`);
  configuration.capacity = {
    seated: notApplicable("A standalone heater has no seated capacity."),
    reclining: notApplicable("A standalone heater has no reclining capacity."),
  };
  configuration.dimensions.interior = notApplicable("Interior dimensions are not applicable to a standalone heater.");
  for (const option of configuration.electrical_supply_options) {
    for (const requirement of option.requirements) {
      requirement.frequency_hz = unknown(id === "harvia-concept-r-combi-105"
        ? "The reviewed page does not state one exact frequency for this model."
        : "The reviewed page states 50/60 Hz, while this field accepts one exact frequency; the installation frequency is not normalized.");
    }
  }
}

for (const id of ["harvia-concept-r-105", "harvia-concept-r-combi-105"]) {
  const product = productById.get(id);
  product.placements = unknown("The reviewed Harvia product page does not state a normalized placement context.");
}

const concept = configurationByProductId.get("harvia-concept-r-105");
concept.materials = unknown("Model-level materials are not stated on the reviewed Harvia product page.");

const combiConfiguration = configurationByProductId.get("harvia-concept-r-combi-105");
combiConfiguration.materials = {
  status: "documented",
  value: ["Ceramic bowl"],
  evidence_ids: ["evidence-harvia-concept-r-combi-105-configuration-2026-09-22"],
};

const combi = productById.get("harvia-concept-r-combi-105");
combi.heat_type = {
  status: "documented",
  value: "traditional",
  evidence_ids: ["evidence-harvia-concept-r-combi-105-product-2026-09-22"],
};
combi.change_reason = "Added from the exact official Harvia US Concept R Combi product page; the Sol review corrected the heat type to traditional because the combi function adds an evaporator, not infrared heating. Publication remains protected pending editorial and rights review.";

const conceptEvidence = evidenceById.get("evidence-harvia-concept-r-105-verified-product-2026-09-22");
const conceptConfigEvidence = evidenceById.get("evidence-harvia-concept-r-105-verified-configuration-2026-09-22");
const combiEvidence = evidenceById.get("evidence-harvia-concept-r-combi-105-product-2026-09-22");
if (!conceptEvidence || !conceptConfigEvidence || !combiEvidence) throw new Error("Expected Harvia evidence records are missing");
conceptEvidence.raw_value = "Concept R 10.5 kW (CP-RB-105) is listed by Harvia as an electric traditional sauna heater; the reviewed page does not state a normalized placement context.";
conceptConfigEvidence.raw_value = "Concept R 10.5 kW: exterior dimensions 17.56 in W × 17.72 in D × 28.15 in H; net weight 72.1 lb; model-level materials are not stated; recommended room volume 353–530 ft³.";
combiEvidence.raw_value = "Harvia Concept R Combi CP-RCB-105 is an electric traditional sauna heater with a built-in evaporator for gentle steam; it does not combine infrared and traditional heating.";

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);
console.log(JSON.stringify({ corrected: ids, heatTypeCorrection: "harvia-concept-r-combi-105: hybrid -> traditional" }, null, 2));
