import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";
const finnleo = {
  brand: "Finnleo",
  merchantId: "finnleo",
  host: "https://www.finnleo.com",
  publisher: "Finnleo",
};

const cabin = (handle, model, { heat = "traditional", placement = "unknown" } = {}) => ({
  id: `finnleo-${handle}`,
  handle,
  model,
  heat,
  placement,
  form: placement === "outdoor" ? "Outdoor sauna" : placement === "indoor" ? "Indoor sauna" : "Sauna cabin",
  productType: "sauna-cabin",
});
const heater = (handle, model) => ({
  id: `finnleo-${handle}`,
  handle,
  model,
  heat: "traditional",
  placement: "unknown",
  form: "Sauna heater",
  productType: "heater",
});

const candidates = [
  cabin("4-x-6-euro-9-0701", "Euro Sauna 4 x 6"),
  cabin("5-x-6-euro-9-0702", "Euro Sauna 5 x 6"),
  cabin("5-x-7-euro-9-0703", "Euro Sauna 5 x 7"),
  cabin("6-x-12-euro-sauna-wchanging-room-9-0705", "Euro Sauna 6 x 12 with Changing Room"),
  cabin("6-x-8-euro-9-0704", "Euro Sauna 6 x 8"),
  cabin("7-x-10-euro-sauna-wchanging-room-9-0706", "Euro Sauna 7 x 10 with Changing Room"),
  cabin("centurion-9-0504", "Centurion"),
  cabin("custom-outdoor-sauna-9-0330", "Finnleo Custom Outdoor Sauna", { placement: "outdoor" }),
  cabin("designerb-9-0251", "Designer-B Sauna"),
  cabin("designersl2-9-0250", "Designer-SL2 Sauna"),
  cabin("hallmark-44-9-0601", "Hallmark 44"),
  cabin("hallmark-46-9806-6620", "Hallmark 46"),
  cabin("hallmark-57-9806-6640", "Hallmark 57"),
  cabin("is440-infrasauna-9-0602", "IS440 InfraSauna", { heat: "infrared", placement: "indoor" }),
  cabin("is565-infrasauna-9805-0840", "IS565 InfraSauna", { heat: "infrared", placement: "indoor" }),
  cabin("northstar-indoor-sauna-4-x-4-9-0550", "NorthStar Indoor Sauna 4 x 4", { placement: "indoor" }),
  cabin("northstar-indoor-sauna-4-x-6-9630-2263", "NorthStar Indoor Sauna 4 x 6", { placement: "indoor" }),
  cabin("northstar-indoor-sauna-5-x-6-9630-2264", "NorthStar Indoor Sauna 5 x 6", { placement: "indoor" }),
  cabin("northstar-indoor-sauna-5-x-7-9630-2265", "NorthStar Indoor Sauna 5 x 7", { placement: "indoor" }),
  cabin("northstar-outdoor-sauna-4-x-6-9630-2266", "NorthStar Outdoor Sauna 4 x 6", { placement: "outdoor" }),
  cabin("northstar-outdoor-sauna-5-x-6-9630-2267", "NorthStar Outdoor Sauna 5 x 6", { placement: "outdoor" }),
  cabin("northstar-outdoor-sauna-5-x-7-9630-2268", "NorthStar Outdoor Sauna 5 x 7", { placement: "outdoor" }),
  cabin("permanently-installed-custom-infrasauna-9-0320", "Finnleo Custom InfraSauna", { heat: "infrared", placement: "indoor" }),
  cabin("permanently-installed-custom-traditional-sauna-9-0300", "Finnleo Custom Traditional Sauna", { placement: "indoor" }),
  cabin("permanently-installed-infrared-sauna-9-0310", "Finnleo Permanently Installed Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("s810-infrared-sauna-9804-4410", "S810 Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("s820-infrared-sauna-9804-4420", "S820 Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("s825-infrared-sauna-9804-4430", "S825 Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("s830-infrared-sauna-9804-4440", "S830 Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("s840-infrared-sauna-9804-4450", "S840 Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("s870-infrared-sauna-9804-4470", "S870 Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("s880-infrared-sauna-9804-4480", "S880 Infrared Sauna", { heat: "infrared", placement: "indoor" }),
  cabin("sisu-custom-free-standing-saunas-9-0400", "Sisu Custom Free-Standing Sauna", { placement: "indoor" }),
  cabin("solace-9-0502", "Solace", { placement: "indoor" }),
  cabin("twilight-9-0501", "Twilight", { placement: "indoor" }),
  cabin("vita-ii-9-0503", "Vita II", { placement: "indoor" }),
  heater("designerb-9-0251-heater", "Designer-B Sauna Heater"),
  heater("designersl2-9-0250-heater", "Designer-SL2 Sauna Heater"),
  heater("himalaya-9-0260", "Himalaya Sauna Heater"),
  heater("karhu-20-home-9053-624", "Karhu 20 Home Wood-Burning Heater"),
  heater("laava-9-2220", "Laava Sauna Heater"),
  heater("magma-9-2210", "Magma Sauna Heater"),
  heater("saga-22-9053-627", "Saga 22 Sauna Heater"),
];

const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const productsDocument = await readJson("data/us/products.json");
const configurationsDocument = await readJson("data/us/configurations.json");
const sourcesDocument = await readJson("data/us/sources.json");
const merchantsDocument = await readJson("data/us/merchants.json");
const rightsDocument = await readJson("docs/us/rights-register.json");

const existingIds = new Set(productsDocument.products.map((entry) => entry.id));
if (candidates.some((entry) => existingIds.has(entry.id))) throw new Error("Finnleo batch contains an existing product ID");
if (new Set(candidates.map((entry) => entry.id)).size !== candidates.length) throw new Error("Finnleo batch contains duplicate product IDs");
if (!merchantsDocument.merchants.some((entry) => entry.id === finnleo.merchantId)) {
  merchantsDocument.merchants.push({ id: finnleo.merchantId, market: "US", name: finnleo.brand, kind: "manufacturer", allowed_hosts: ["www.finnleo.com"], status: "candidate" });
}

const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const sourceIds = new Set(sourcesDocument.sources.map((entry) => entry.id));
const newEvidence = [];
const newRights = [];

for (const entry of candidates) {
  const sourceId = `source-${entry.id}-product`;
  const evidenceId = `evidence-${entry.id}-product`;
  const configEvidenceId = `evidence-${entry.id}-configuration`;
  const configId = `${entry.id}-standard`;
  const sourceUrl = `${finnleo.host}/products/${entry.handle}`;
  if (!sourceIds.has(sourceId)) {
    sourcesDocument.sources.push({ id: sourceId, type: "manufacturer-page", url: sourceUrl, title: `${entry.model} product page`, publisher: finnleo.publisher, market: "US", checked_at: today, locator: "Product page model identity and product class" });
    sourceIds.add(sourceId);
  }
  const product = {
    id: entry.id,
    market: "US",
    slug: entry.id,
    brand_name: finnleo.brand,
    model: entry.model,
    product_type: documented(entry.productType, evidenceId),
    heat_type: documented(entry.heat, evidenceId),
    energy_sources: unknown("The reviewed Finnleo product page does not provide a normalized US energy-source record for this catalog candidate."),
    placements: entry.placement === "unknown" ? unknown("The reviewed Finnleo product page does not state one placement context for this candidate.") : documented([entry.placement], evidenceId),
    form: documented(entry.form, evidenceId),
    configuration_ids: [configId],
    source_ids: [sourceId],
    publication_status: "candidate",
    spec_checked_at: today,
    change_reason: "Added from an exact official Finnleo US product page; technical review remains open before publication.",
  };
  const config = {
    id: configId,
    market: "US",
    product_id: entry.id,
    label: `${entry.model} standard configuration`,
    manufacturer_sku: unknown("The reviewed Finnleo page does not expose a normalized manufacturer SKU in this catalog record."),
    capacity: { seated: unknown("Seated capacity is not normalized from the reviewed product page."), reclining: unknown("Reclining capacity is not stated in the reviewed product record.") },
    dimensions: { exterior: unknown("Complete exterior dimensions require the individual technical specification."), interior: unknown("Complete interior dimensions require the individual technical specification."), shipping: unknown("Shipping dimensions are not stated in the reviewed catalog record."), minimum_clearances: unknown("Installation clearances require the applicable Finnleo documentation.") },
    net_weight: unknown("Net weight is not stated in the reviewed catalog record."),
    shipping_weight: unknown("Shipping weight is not stated in the reviewed catalog record."),
    materials: unknown("Model-level materials require the individual Finnleo specification."),
    components: [],
    electrical_supply_options: [{
      id: `${entry.id}-electrical-unknown`,
      evidence_ids: [configEvidenceId],
      requirements: [{ component: entry.productType === "heater" ? "heater" : entry.heat === "infrared" ? "infrared-system" : "heater", voltage_v: unknown("Voltage is not stated in the reviewed catalog record."), frequency_hz: unknown("Frequency is not stated in the reviewed catalog record."), phase: unknown("Phase is not stated in the reviewed catalog record."), rated_power_w: unknown("Rated power is not stated in the reviewed catalog record."), rated_current_a: unknown("Rated current is not stated in the reviewed catalog record."), required_circuit_a: unknown("Required circuit rating is not stated in the reviewed catalog record."), specified_breaker_a: unknown("Breaker rating is not stated in the reviewed catalog record."), connection: unknown("Connection type is not stated in the reviewed catalog record."), plug_type: unknown("Plug type is not stated in the reviewed catalog record."), dedicated_circuit: unknown("Dedicated-circuit requirements are not stated in the reviewed catalog record.") }],
    }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: [sourceId],
    publication_status: "candidate",
  };
  productsDocument.products.push(product);
  configurationsDocument.configurations.push(config);
  newEvidence.push({ id: evidenceId, entity_id: entry.id, source_id: sourceId, field_path: "product_identity", raw_value: `${entry.model} is listed on the official Finnleo US product page.` });
  newEvidence.push({ id: configEvidenceId, entity_id: configId, source_id: sourceId, field_path: "configuration_identity", raw_value: `${entry.model} is represented as a non-publishing research configuration.` });
  newRights.push({ asset_id: `${entry.id}-image`, entity_id: entry.id, merchant_id: finnleo.merchantId, asset_type: "manufacturer-image", source_url: sourceUrl, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}

sourcesDocument.evidence.push(...newEvidence);
rightsDocument.assets.push(...newRights);
await writeJson("data/us/products.json", productsDocument);
await writeJson("data/us/configurations.json", configurationsDocument);
await writeJson("data/us/sources.json", sourcesDocument);
await writeJson("data/us/merchants.json", merchantsDocument);
await writeJson("docs/us/rights-register.json", rightsDocument);
console.log(`Added ${candidates.length} Finnleo US candidates; total is now ${productsDocument.products.length}.`);
