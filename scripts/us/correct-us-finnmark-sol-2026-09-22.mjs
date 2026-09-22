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
const addUnique = (values, value) => values.includes(value) ? values : [...values, value];

const [products, configurations, sources] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
]);

const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationById = new Map(configurations.configurations.map((entry) => [entry.id, entry]));
const sourceById = new Map(sources.sources.map((entry) => [entry.id, entry]));
const evidenceById = new Map(sources.evidence.map((entry) => [entry.id, entry]));

const reviews = [
  {
    id: "finnmark-fd-2",
    source: {
      id: "source-finnmark-fd-2-spec-sheet",
      type: "spec-sheet",
      url: "https://finnmarkdesigns.com/wp-content/uploads/hybrid-2-0-full-spectrum-sauna-spec-sheet.pdf",
      title: "Finnmark Hybrid 2.0 Full Spectrum Sauna specification sheet",
      publisher: "Finnmark Designs",
      market: "US",
      checked_at: checkedAt,
      locator: "Manufacturer specification sheet: two-person capacity, exterior and interior dimensions, materials, glass and 120 V / 1,750 W / 15 A NEMA 5-15P electrical specification",
    },
    exterior: dimensions(48, 44, 78),
    interior: dimensions(43, 40, 70),
    materials: ["Thermal Plus exterior", "Canadian cedar interior", "8 mm tempered glass"],
    electrical: [
      { component: "infrared-system", voltage: 120, power: 1750, current: 15, plug: "NEMA 5-15P" },
    ],
  },
  {
    id: "finnmark-fd-4",
    source: {
      id: "source-finnmark-fd-4-spec-sheet",
      type: "spec-sheet",
      url: "https://finnmarkdesigns.com/wp-content/uploads/trinity-specs-web.pdf",
      title: "Finnmark Trinity Infrared and Steam Sauna specification sheet",
      publisher: "Finnmark Designs",
      market: "US",
      checked_at: checkedAt,
      locator: "Manufacturer specification sheet: two-person capacity, exterior and interior dimensions, materials, glass, included Harvia Vega Compact and separate infrared/heater electrical specifications",
    },
    exterior: dimensions(48, 48, 83),
    interior: dimensions(44, 45, 75),
    materials: ["Thermal Aspen exterior", "Western Red Cedar interior", "8 mm tempered glass"],
    electrical: [
      { component: "infrared-system", voltage: 120, power: 1750, current: 15, plug: "NEMA 5-15P" },
      { component: "heater", voltage: 120, power: 1900, current: 20, plug: null },
    ],
  },
];

for (const review of reviews) {
  const product = productById.get(review.id);
  const configuration = configurationById.get(`${review.id}-standard`);
  if (!product || !configuration) throw new Error(`Missing Finnmark record ${review.id}`);

  const existingSource = sourceById.get(review.source.id);
  if (existingSource) Object.assign(existingSource, review.source);
  else {
    sources.sources.push(review.source);
    sourceById.set(review.source.id, review.source);
  }

  const productEvidenceId = `evidence-${review.id}-verified-product-2026-09-22`;
  const configurationEvidenceId = `evidence-${review.id}-verified-configuration-2026-09-22`;
  const electricalEvidenceId = `evidence-${review.id}-verified-electrical-2026-09-22`;
  const productEvidence = evidenceById.get(productEvidenceId);
  const configurationEvidence = evidenceById.get(configurationEvidenceId);
  const electricalEvidence = evidenceById.get(electricalEvidenceId);
  if (!productEvidence || !configurationEvidence || !electricalEvidence) {
    throw new Error(`Missing verified evidence bundle for ${review.id}`);
  }

  productEvidence.source_id = review.source.id;
  productEvidence.raw_value = `${product.model}: ${product.heat_type.value}; ${product.placements.value.join(", ")}; ${product.form.value}.`;
  configurationEvidence.source_id = review.source.id;
  configurationEvidence.raw_value = `Capacity: 2 persons; exterior ${JSON.stringify(review.exterior)}; interior ${JSON.stringify(review.interior)}; materials ${review.materials.join(", ")}.`;
  electricalEvidence.source_id = review.source.id;
  electricalEvidence.raw_value = JSON.stringify(review.electrical.map((entry) => ({
    component: entry.component,
    power: entry.power,
    voltage: entry.voltage,
    current: entry.current,
    phase: null,
    plug: entry.plug,
    dedicated: null,
  })));

  product.source_ids = addUnique(product.source_ids, review.source.id);
  product.spec_checked_at = checkedAt;
  product.change_reason = "Sol source review replaced retailer-derived values with the model's official Finnmark specification sheet; fields not explicitly stated by the manufacturer remain unknown.";

  configuration.source_ids = addUnique(configuration.source_ids, review.source.id);
  configuration.dimensions.exterior = documented(review.exterior, configurationEvidenceId);
  configuration.dimensions.interior = documented(review.interior, configurationEvidenceId);
  configuration.materials = documented(review.materials, configurationEvidenceId);
  configuration.electrical_supply_options = review.electrical.map((entry, index) => ({
    id: `${configuration.id}-electrical-${index + 1}`,
    evidence_ids: [electricalEvidenceId],
    requirements: [{
      component: entry.component,
      voltage_v: documented(entry.voltage, electricalEvidenceId),
      frequency_hz: unknown("Frequency is not stated on the manufacturer specification sheet."),
      phase: unknown("Phase is not stated on the manufacturer specification sheet."),
      rated_power_w: documented(entry.power, electricalEvidenceId),
      rated_current_a: documented(entry.current, electricalEvidenceId),
      required_circuit_a: unknown("The manufacturer specification sheet states amperage but does not label a required circuit rating."),
      specified_breaker_a: unknown("A breaker rating is not stated on the manufacturer specification sheet."),
      connection: entry.plug ? documented("plug-in", electricalEvidenceId) : unknown("Connection type is not stated on the manufacturer specification sheet."),
      plug_type: entry.plug ? documented(entry.plug, electricalEvidenceId) : unknown("Plug type is not stated on the manufacturer specification sheet."),
      dedicated_circuit: unknown("Dedicated-circuit status is not stated on the manufacturer specification sheet."),
    }],
  }));
}

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
]);

console.log(JSON.stringify({ corrected: reviews.map((entry) => entry.id) }, null, 2));
