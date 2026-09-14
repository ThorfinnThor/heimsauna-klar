import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-14";

const sourceDefinitions = [
  ["almost-heaven-saunas-collection", "https://almostheaven.com/collections/saunas", "Almost Heaven Saunas collection", "Almost Heaven Saunas"],
  ["thermory-sauna-products", "https://sauna.thermoryusa.com/products/", "Thermory USA sauna products", "Thermory"],
  ["sunlighten-sauna-collections", "https://shop-us.sunlighten.com/collections/saunas", "Sunlighten US sauna collections", "Sunlighten"],
  ["sun-home-craftsmanship", "https://sunhomesaunas.com/pages/craftsmanship", "Sun Home model and materials reference", "Sun Home"],
  ["redwood-outdoor-saunas", "https://www.redwoodoutdoors.com/collections/outdoor-saunas", "Redwood Outdoors outdoor sauna collection", "Redwood Outdoors"],
  ["redwood-assembly-guides", "https://www.redwoodoutdoors.com/pages/assembly", "Redwood Outdoors assembly and product guide index", "Redwood Outdoors"],
];

const merchantDefinitions = [
  ["almost-heaven", "Almost Heaven Saunas", "almostheaven.com"],
  ["thermory", "Thermory USA", "sauna.thermoryusa.com"],
  ["sun-home", "Sun Home Saunas", "sunhomesaunas.com"],
  ["redwood-outdoors", "Redwood Outdoors", "redwoodoutdoors.com"],
];

const candidates = [];
const add = (id, brand, model, sourceId, merchantId, { type = "sauna-kit", heat = "unknown", placement = "outdoor", form = "Sauna product", capacity, category = "outdoor-traditional-cabins" } = {}) => {
  candidates.push({ id, brand, model, sourceId, merchantId, type, heat, placement, form, capacity, category });
};

// SaunaLife's collection lists these exact model identities. The four already-imported models are intentionally omitted.
for (const [id, model, capacity] of [
  ["saunalife-e6w", "ERGO Series Model E6W", 3], ["saunalife-e7w", "ERGO Series Model E7W", 4], ["saunalife-e7g", "ERGO Series Model E7G", 4],
  ["saunalife-e8", "ERGO Series Model E8", 6], ["saunalife-e8w", "ERGO Series Model E8W", 6], ["saunalife-e8g", "ERGO Series Model E8G", 6],
  ["saunalife-ee6g", "ERGO Elegance Series Model EE6G", 4], ["saunalife-ee8g", "ERGO Elegance Series Model EE8G", 4],
  ["saunalife-x2", "XPERIENCE Series Model X2", undefined], ["saunalife-g2", "GARDEN Series Model G2", undefined],
  ["saunalife-g3", "GARDEN Series Model G3", undefined], ["saunalife-g6", "GARDEN Series Model G6", undefined],
  ["saunalife-cl4g", "CUBE Series Model CL4G", 3], ["saunalife-cl5g", "CUBE Series Model CL5G", 4],
  ["saunalife-cl7g", "CUBE Series Model CL7G", 6], ["saunalife-cl12gcp", "CUBE Series Model CL12GCP", 8],
  ["saunalife-gl4", "GARDEN LUXURY Series Model GL4", 4], ["saunalife-gl6", "GARDEN LUXURY Series Model GL6", 6],
]) add(id, "SaunaLife", model, "saunalife-products", "saunalife", { form: "Outdoor sauna kit", capacity });

for (const [id, model, heat, placement, capacity] of [
  ["almost-heaven-hillsboro", "Hillsboro 2 Person Indoor Sauna", "traditional", "indoor", 2], ["almost-heaven-pinnacle", "Pinnacle 4 Person Barrel Sauna", "traditional", "outdoor", 4],
  ["almost-heaven-logan", "Logan 1 Person Indoor Sauna", "traditional", "indoor", 1], ["almost-heaven-princeton", "Princeton 6 Person Barrel Sauna", "traditional", "outdoor", 6],
  ["almost-heaven-rainelle", "Rainelle 4 Person Indoor Sauna", "hybrid", "indoor", 4], ["almost-heaven-audra", "Audra 2-4 Person Canopy Barrel Sauna", "traditional", "outdoor", undefined],
  ["almost-heaven-bridgeport", "Bridgeport 6 Person Indoor Sauna", "hybrid", "indoor", 6], ["almost-heaven-grandview", "Grandview 4-6 Person Canopy Barrel Sauna", "traditional", "outdoor", undefined],
  ["almost-heaven-titan", "Titan 6 Person Indoor Sauna", "traditional", "indoor", 6], ["almost-heaven-patterson", "Patterson 6 Person Indoor Sauna", "traditional", "indoor", 6],
  ["almost-heaven-lewisburg", "Lewisburg 6-8 Person Barrel Sauna", "traditional", "outdoor", undefined], ["almost-heaven-grayson", "Grayson 4 Person Indoor Sauna", "hybrid", "indoor", 4],
  ["almost-heaven-charleston", "Charleston 4 Person Canopy Barrel Sauna", "traditional", "outdoor", 4], ["almost-heaven-huntington", "Huntington 4-6 Person Canopy Barrel Sauna", "traditional", "outdoor", undefined],
  ["almost-heaven-madison", "Madison 2-3 Person Indoor Sauna", "hybrid", "indoor", undefined],
]) add(id, "Almost Heaven Saunas", model, "almost-heaven-saunas-collection", "almost-heaven", { type: "sauna-kit", heat, placement, form: `${placement === "indoor" ? "Indoor" : "Outdoor"} sauna kit`, capacity, category: placement === "indoor" ? "indoor-traditional-cabins" : "outdoor-traditional-cabins" });

for (const [id, model, capacity] of [
  ["sunlighten-mpulse-aspire", "mPulse Aspire Smart Sauna", 1], ["sunlighten-mpulse-believe", "mPulse Believe Smart Sauna", 2],
  ["sunlighten-mpulse-conquer", "mPulse Conquer Smart Sauna", 3], ["sunlighten-mpulse-discover", "mPulse Discover Smart Sauna", undefined],
  ["sunlighten-mpulse-empower", "mPulse Empower Smart Sauna", 5], ["sunlighten-amplify-ii", "Amplify II Full Spectrum Sauna", 2],
  ["sunlighten-amplify-iii", "Amplify III Full Spectrum Sauna", 3], ["sunlighten-amplify-iv", "Amplify IV Full Spectrum Sauna", 4],
  ["sunlighten-signature-i", "Signature I Far Infrared Sauna", 1],
]) add(id, "Sunlighten", model, "sunlighten-sauna-collections", "sunlighten", { type: "sauna-cabin", heat: "infrared", placement: "indoor", form: "Indoor infrared sauna cabin", capacity, category: "indoor-infrared-cabins" });

for (const [id, model, heat, placement, capacity] of [
  ["sun-home-solstice", "Solstice", "infrared", "indoor", undefined], ["sun-home-equinox", "Equinox", "infrared", "indoor", undefined],
  ["sun-home-eclipse-2", "Eclipse 2", "hybrid", "indoor", 2], ["sun-home-pod", "Pod", "infrared", "indoor", undefined],
  ["sun-home-luminar-2", "Luminar 2", "infrared", "outdoor", 2], ["sun-home-nova-3", "Nova 3", "traditional", "indoor", 3],
  ["sun-home-solaris", "Solaris", "traditional", "outdoor", undefined],
]) add(id, "Sun Home", model, "sun-home-craftsmanship", "sun-home", { type: "sauna-cabin", heat, placement, form: `${placement === "indoor" ? "Indoor" : "Outdoor"} sauna cabin`, capacity, category: placement === "indoor" ? (heat === "traditional" ? "indoor-traditional-cabins" : "indoor-infrared-cabins") : (heat === "traditional" ? "outdoor-traditional-cabins" : "outdoor-infrared-cabins") });

for (const [id, model, capacity] of [
  ["redwood-cabin-4", "Cabin Outdoor Sauna 4 Person", 4], ["redwood-cove-3", "Cove Outdoor Sauna 3 Person", 3], ["redwood-garden-8", "Garden Outdoor Sauna 8 Person", 8],
  ["redwood-grove-8", "Grove Outdoor Sauna 8 Person", 8], ["redwood-vista-6", "Vista Outdoor Sauna 6 Person", 6], ["redwood-horizon-6", "Horizon Outdoor Sauna 6 Person with Porch", 6],
  ["redwood-duo-2", "Duo Outdoor Sauna 2 Person", 2], ["redwood-summit-6", "Summit Outdoor Sauna 6 Person", 6], ["redwood-barrel-6", "Barrel Outdoor Sauna 6 Person", 6],
  ["redwood-barrel-porch-6", "Barrel Outdoor Sauna with Porch 6 Person", 6], ["redwood-extra-wide-porch-6", "Extra-Wide Outdoor Barrel Sauna with Porch 6 Person", 6],
  ["redwood-extra-wide-6", "Extra-Wide Outdoor Barrel Sauna 6 Person", 6], ["redwood-barrel-8", "Barrel Outdoor Sauna 8 Person", 8], ["redwood-noctra-8", "Noctra Outdoor Sauna 8 Person", 8],
]) add(id, "Redwood Outdoors", model, "redwood-outdoor-saunas", "redwood-outdoors", { type: "sauna-kit", heat: "unknown", placement: "outdoor", form: "Outdoor sauna kit", capacity });

for (const [id, model] of [
  ["thermory-luik-kodiak", "Luik Series Kodiak Spruce"], ["thermory-luik-ash", "Luik Series Benchmark Ash"], ["thermory-traditional-mod6", "Traditional Mod6 Sauna"],
  ["thermory-modern-mod6", "Modern Mod6 Sauna"], ["thermory-mod4-traditional", "Mod4 Sauna Traditional"], ["thermory-mod4-modern", "Mod4 Sauna Modern"],
  ["thermory-sauna-square", "Sauna Square"], ["thermory-natural-barrel", "Natural Barrel Sauna"], ["thermory-ignite-barrel", "Ignite Barrel Sauna"],
]) add(id, "Thermory", model, "thermory-sauna-products", "thermory", { type: "sauna-kit", heat: "unknown", placement: "outdoor", form: "Outdoor sauna product", category: "outdoor-traditional-cabins" });

for (const [id, model, type, heat, placement, form, sourceId, merchantId] of [
  ["redwood-electric-heater", "Redwood Outdoors Sauna Electric Heater", "heater", "traditional", "outdoor", "Sauna heater accessory", "redwood-assembly-guides", "redwood-outdoors"],
  ["redwood-heater-fence", "Redwood Outdoors Sauna Heater Fence", "accessory", "not-applicable", "outdoor", "Sauna safety accessory", "redwood-assembly-guides", "redwood-outdoors"],
  ["redwood-lighting", "Redwood Outdoors Sauna Lighting", "accessory", "not-applicable", "outdoor", "Sauna lighting accessory", "redwood-assembly-guides", "redwood-outdoors"],
  ["redwood-bench-extender", "Redwood Outdoors Sauna Bench Extender", "accessory", "not-applicable", "outdoor", "Sauna bench accessory", "redwood-assembly-guides", "redwood-outdoors"],
  ["redwood-roof-shingles", "Redwood Outdoors Sauna Roof Shingles", "accessory", "not-applicable", "outdoor", "Sauna installation accessory", "redwood-assembly-guides", "redwood-outdoors"],
  ["redwood-privacy-screen", "Redwood Outdoors Sauna Privacy Screen", "accessory", "not-applicable", "outdoor", "Sauna accessory", "redwood-assembly-guides", "redwood-outdoors"],
  ["redwood-outdoor-shower", "Redwood Outdoors Outdoor Shower", "accessory", "not-applicable", "outdoor", "Outdoor sauna accessory", "redwood-assembly-guides", "redwood-outdoors"],
  ["sunlighten-solo-system", "Solo System Sauna", "sauna-blanket", "infrared", "indoor", "Laydown infrared sauna system", "sunlighten-sauna-collections", "sunlighten"],
  ["sunlighten-solo-rise", "Solo Rise Sauna", "sauna-cabin", "infrared", "indoor", "Indoor infrared sauna cabin", "sunlighten-sauna-collections", "sunlighten"],
  ["sunlighten-luminir-panel", "lumiNIR Red Light Therapy Panel", "accessory", "not-applicable", "indoor", "Red light therapy accessory", "sunlighten-sauna-collections", "sunlighten"],
]) add(id, merchantId === "sunlighten" ? "Sunlighten" : merchantId === "redwood-outdoors" ? "Redwood Outdoors" : merchantId, model, sourceId, merchantId, { type, heat, placement, form, category: type === "accessory" || type === "heater" ? "accessories-and-portable" : "indoor-infrared-cabins" });

if (candidates.length !== 82) throw new Error(`Expected 82 additions, got ${candidates.length}`);

const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const productsDocument = await readJson("data/us/products.json");
const configurationsDocument = await readJson("data/us/configurations.json");
const sourcesDocument = await readJson("data/us/sources.json");
const merchantsDocument = await readJson("data/us/merchants.json");
const rightsDocument = await readJson("docs/us/rights-register.json");

const existingProductIds = new Set(productsDocument.products.map((entry) => entry.id));
if (candidates.some((entry) => existingProductIds.has(entry.id))) throw new Error("Batch contains an existing product ID");
const sourceById = new Set(sourcesDocument.sources.map((entry) => entry.id));
for (const [id, url, title, publisher] of sourceDefinitions) {
  if (!sourceById.has(id)) sourcesDocument.sources.push({ id, type: "manufacturer-page", url, title, publisher, market: "US", checked_at: today, locator: "Model collection and product listing" });
}
const merchantById = new Set(merchantsDocument.merchants.map((entry) => entry.id));
for (const [id, name, host] of merchantDefinitions) {
  if (!merchantById.has(id)) merchantsDocument.merchants.push({ id, market: "US", name, kind: "manufacturer", allowed_hosts: [host], status: "candidate" });
}

const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const newEvidence = [];
const newRights = [];
for (const entry of candidates) {
  const productEvidenceId = `evidence-${entry.id}-product`;
  const configEvidenceId = `evidence-${entry.id}-configuration`;
  const configId = `${entry.id}-standard`;
  const product = {
    id: entry.id, market: "US", slug: entry.id, brand_name: entry.brand, model: entry.model,
    product_type: documented(entry.type, productEvidenceId),
    heat_type: entry.heat === "unknown" ? unknown("The checked collection page does not state a specific heat format for this model.") : documented(entry.heat, productEvidenceId),
    energy_sources: unknown("The checked collection page does not state a model-specific energy source."),
    placements: entry.placement === "unknown" ? unknown("The checked collection page does not state a placement context for this product.") : documented([entry.placement], productEvidenceId),
    form: documented(entry.form, productEvidenceId), configuration_ids: [configId], source_ids: [entry.sourceId], publication_status: "candidate", spec_checked_at: today,
    change_reason: "Research candidate from an official US manufacturer collection; model-level technical, rights and publication review remain open.",
  };
  const component = entry.type === "heater" ? "heater" : entry.heat === "infrared" ? "infrared-system" : entry.type === "accessory" || entry.type === "sauna-blanket" ? "other" : "heater";
  const config = {
    id: configId, market: "US", product_id: entry.id, label: `${entry.model} standard configuration`,
    manufacturer_sku: unknown("The collection page does not expose a manufacturer SKU for this candidate."),
    capacity: { seated: entry.capacity ? documented(entry.capacity, configEvidenceId) : unknown("A model-level seated capacity is not stated on the checked collection page."), reclining: unknown("A reclining capacity is not stated on the checked collection page.") },
    dimensions: { exterior: unknown("Model-level exterior dimensions require the individual product page."), interior: unknown("Model-level interior dimensions require the individual product page."), shipping: unknown("Shipping dimensions are not stated on the checked collection page."), minimum_clearances: unknown("Installation clearances require the individual product page or manual.") },
    net_weight: unknown("Net weight is not stated on the checked collection page."), shipping_weight: unknown("Shipping weight is not stated on the checked collection page."), materials: unknown("Model-level materials require the individual product page."), components: [],
    electrical_supply_options: [{ id: `${entry.id}-electrical-unknown`, requirements: [{ component, voltage_v: unknown("Voltage is not stated on the checked collection page."), frequency_hz: unknown("Frequency is not stated on the checked collection page."), phase: unknown("Phase is not stated on the checked collection page."), rated_power_w: unknown("Rated power is not stated on the checked collection page."), rated_current_a: unknown("Rated current is not stated on the checked collection page."), required_circuit_a: unknown("Required circuit rating is not stated on the checked collection page."), specified_breaker_a: unknown("Breaker rating is not stated on the checked collection page."), connection: unknown("Connection type is not stated on the checked collection page."), plug_type: unknown("Plug type is not stated on the checked collection page."), dedicated_circuit: unknown("Dedicated-circuit requirements are not stated on the checked collection page.") }], evidence_ids: [configEvidenceId] }],
    certification_ids: [], warranty_ids: [], source_ids: [entry.sourceId], publication_status: "candidate",
  };
  productsDocument.products.push(product);
  configurationsDocument.configurations.push(config);
  newEvidence.push({ id: productEvidenceId, entity_id: entry.id, source_id: entry.sourceId, field_path: "product_identity", raw_value: `${entry.model} listed in the official collection.` });
  newEvidence.push({ id: configEvidenceId, entity_id: configId, source_id: entry.sourceId, field_path: "configuration_identity", raw_value: `${entry.model} is represented as a non-publishing review configuration.` });
  newRights.push({ asset_id: `${entry.id}-image`, entity_id: entry.id, merchant_id: entry.merchantId, asset_type: "manufacturer-image", source_url: sourcesDocument.sources.find((source) => source.id === entry.sourceId)?.url, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}
sourcesDocument.evidence.push(...newEvidence);
rightsDocument.assets.push(...newRights);

await writeJson("data/us/products.json", productsDocument);
await writeJson("data/us/configurations.json", configurationsDocument);
await writeJson("data/us/sources.json", sourcesDocument);
await writeJson("data/us/merchants.json", merchantsDocument);
await writeJson("docs/us/rights-register.json", rightsDocument);
console.log(`Added ${candidates.length} US candidates; total is now ${productsDocument.products.length}.`);
