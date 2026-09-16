import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";

const official = {
  "almost-heaven": {
    brand: "Almost Heaven Saunas",
    merchantId: "almost-heaven",
    host: "https://almostheaven.com",
    collection: "https://almostheaven.com/collections/saunas",
    publisher: "Almost Heaven Saunas",
  },
  "sun-home": {
    brand: "Sun Home",
    merchantId: "sun-home",
    host: "https://sunhomesaunas.com",
    collection: "https://sunhomesaunas.com/collections/all-saunas",
    publisher: "Sun Home",
  },
  peak: {
    brand: "Peak Saunas",
    merchantId: "peak-saunas",
    host: "https://peaksaunas.com",
    collection: "https://peaksaunas.com/collections/all",
    publisher: "Peak Saunas",
  },
};

const candidates = [
  // Additional unique sauna models from the official Almost Heaven collection.
  ["seneca", "Seneca 6 Person Barrel Sauna", "traditional", "outdoor", 6, "Outdoor barrel sauna"],
  ["allegheny-6-person-cabin-sauna", "Allegheny 6 Person Cabin Sauna", "traditional", "outdoor", 6, "Outdoor cabin sauna"],
  ["appalachia-6-person-cabin-sauna", "Appalachia 6 Person Cabin Sauna", "traditional", "outdoor", 6, "Outdoor cabin sauna"],
  ["vienna-2-person-canopy-barrel-sauna", "Vienna 2 Person Canopy Barrel Sauna", "traditional", "outdoor", 2, "Outdoor canopy barrel sauna"],
  ["sutton-2-person-indoor-sauna", "Sutton 2 Person Indoor Sauna", "traditional", "indoor", 2, "Indoor traditional sauna"],
  ["worthington-4-6-person-indoor-sauna", "Worthington 4-6 Person Indoor Sauna", "traditional", "indoor", 4, "Indoor traditional sauna"],
  ["olympus-6-person-sauna", "Olympus 6 Person Sauna", "traditional", "unknown", 6, "Sauna cabin"],
  ["shenandoah-4-person-barrel", "Shenandoah 4 Person Barrel Sauna", "traditional", "outdoor", 4, "Outdoor barrel sauna"],
  ["harmony-infrared-2-3-person", "Harmony Infrared 2-3 Person Sauna", "infrared", "indoor", 2, "Indoor infrared sauna"],
  ["elysian-infrared-2-3-person", "Elysian Infrared 2-3 Person Sauna", "infrared", "indoor", 2, "Indoor infrared sauna"],
  ["essex-barrel-sauna", "Essex 4 Person Barrel Sauna", "traditional", "outdoor", 4, "Outdoor barrel sauna"],
  ["spectacle-2-person-indoor-sauna", "Spectacle 2 Person Indoor Sauna", "traditional", "indoor", 2, "Indoor traditional sauna"],
  ["serena-3-person-indoor-sauna", "Serena 3 Person Indoor Sauna", "traditional", "indoor", 3, "Indoor traditional sauna"],
  ["oasis-4-person-indoor-sauna", "Oasis 4 Person Indoor Sauna", "traditional", "indoor", 4, "Indoor traditional sauna"],
  ["kuuma-barrel-sauna", "Kuuma 4-6 Person Classic Barrel Sauna", "traditional", "outdoor", 4, "Outdoor barrel sauna"],
  ["takoa-4-6-person-barrel-sauna", "Takoa Half Moon Classic Barrel Sauna", "traditional", "outdoor", 4, "Outdoor barrel sauna"],
  ["magnus-6-person-barrel-sauna", "Magnus 6 Person Canopy Barrel Sauna", "traditional", "outdoor", 6, "Outdoor canopy barrel sauna"],
  ["evander-6-person-barrel-sauna", "Evander Half-Moon Canopy Barrel Sauna", "traditional", "outdoor", 6, "Outdoor canopy barrel sauna"],
  ["solide-compact-4-person-cabin-sauna", "Solide Compact 4-6 Person Cabin Sauna", "traditional", "unknown", 4, "Cabin sauna"],
  ["blackwater-4-6-person-cube-sauna", "Blackwater 4 Person Cube Sauna", "traditional", "outdoor", 4, "Outdoor cube sauna"],
  ["watoga-2-4-person-barrel-sauna", "Watoga 2-4 Person Barrel Sauna", "traditional", "outdoor", 2, "Outdoor barrel sauna"],
  ["salem-2-person-barrel-sauna", "Salem 2 Person Barrel Sauna", "traditional", "outdoor", 2, "Outdoor barrel sauna"],
  ["wolfpine-indoor-saunas", "Wolfpine Indoor Sauna", "traditional", "indoor", undefined, "Indoor traditional sauna"],
  ["everwood-indoor-saunas", "Everwood Indoor Sauna", "traditional", "indoor", undefined, "Indoor traditional sauna"],
  ["alpina-outdoor-saunas", "Alpina Outdoor Sauna", "traditional", "outdoor", undefined, "Outdoor sauna"],
  ["saddle-mountain-sauna", "Saddle Mountain Outdoor Sauna", "traditional", "outdoor", undefined, "Outdoor sauna"],
  ["view-outdoor-sauna", "View Outdoor Sauna", "traditional", "outdoor", undefined, "Outdoor sauna"],
  ["timberline-outdoor-sauna-heritage-collection", "Timberline Outdoor Sauna", "traditional", "outdoor", undefined, "Outdoor sauna"],
  ["himalaya-indoor-sauna", "Himalaya Salt Indoor Sauna", "traditional", "indoor", undefined, "Indoor traditional sauna"],
  ["hinton-2-3-person-infrared-sauna", "Hinton 2-3 Person Infrared Sauna", "infrared", "indoor", 2, "Indoor infrared sauna"],
  ["laurel-1-person-infrared-sauna", "Laurel 1 Person Infrared Sauna", "infrared", "indoor", 1, "Indoor infrared sauna"],
  ["tyrol-indoor-saunas", "Tyrol Indoor Sauna", "traditional", "indoor", undefined, "Indoor traditional sauna"],
  ["blackwater-mini-cube-sauna", "Blackwater 1-2 Person Mini-Cube Sauna", "traditional", "outdoor", 1, "Outdoor cube sauna"],
  ["auburn-2-3-person-indoor-sauna", "Auburn 2-3 Person Indoor Sauna", "traditional", "indoor", 2, "Indoor traditional sauna"],
].map(([handle, model, heat, placement, capacity, form]) => ({
  id: `almost-heaven-${handle}`,
  merchantKey: "almost-heaven",
  handle,
  model,
  heat,
  placement,
  capacity,
  form,
  productType: "sauna-kit",
}));

for (const [handle, model, heat, placement, capacity, form] of [
  ["sun-home-luminar-5", "Sun Home Luminar 5-Person Outdoor Full-Spectrum Infrared Sauna", "infrared", "outdoor", 5, "Outdoor infrared sauna"],
  ["sun-home-eclipse-4", "Sun Home Eclipse 4-Person Indoor Red Light and Full-Spectrum Infrared Sauna", "infrared", "indoor", 4, "Indoor infrared sauna"],
  ["sun-home-equinox-3", "Sun Home Equinox 3-Person Indoor Full-Spectrum Infrared Sauna", "infrared", "indoor", 3, "Indoor infrared sauna"],
  ["sun-home-nova-6", "Sun Home Nova 6-Person Indoor Traditional Sauna", "traditional", "indoor", 6, "Indoor traditional sauna"],
  ["sun-home-solstice-4", "Sun Home Solstice 4-Person Indoor Infrared Sauna", "infrared", "indoor", 4, "Indoor infrared sauna"],
  ["sun-home-solstice-3", "Sun Home Solstice 3-Person Indoor Infrared Sauna", "infrared", "indoor", 3, "Indoor infrared sauna"],
  ["sun-home-solstice-2", "Sun Home Solstice 2-Person Indoor Infrared Sauna", "infrared", "indoor", 2, "Indoor infrared sauna"],
  ["sun-home-solaris-6", "Sun Home Solaris 6-Person Outdoor Custom Traditional Sauna", "traditional", "outdoor", 6, "Outdoor traditional sauna"],
]) {
  candidates.push({
    id: handle,
    merchantKey: "sun-home",
    handle,
    model,
    heat,
    placement,
    capacity,
    form,
    productType: "sauna-cabin",
  });
}

candidates.push({
  id: "peak-denali",
  merchantKey: "peak",
  handle: "peak-saunas-denali-3-person-full-spectrum-infrared-sauna-with-two-xl-medical-grade-red-light-therapy-smart-wifi-app-control",
  model: "Peak Denali 3-Person Full Spectrum Infrared Sauna",
  heat: "infrared",
  placement: "unknown",
  capacity: 3,
  form: "Infrared sauna cabin",
  productType: "sauna-cabin",
});

const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const productsDocument = await readJson("data/us/products.json");
const configurationsDocument = await readJson("data/us/configurations.json");
const sourcesDocument = await readJson("data/us/sources.json");
const rightsDocument = await readJson("docs/us/rights-register.json");

const existingIds = new Set(productsDocument.products.map((entry) => entry.id));
const duplicates = candidates.filter((entry) => existingIds.has(entry.id));
if (duplicates.length) throw new Error(`Batch contains existing product IDs: ${duplicates.map((entry) => entry.id).join(", ")}`);
if (new Set(candidates.map((entry) => entry.id)).size !== candidates.length) throw new Error("Batch contains duplicate product IDs");

const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const sourceById = new Set(sourcesDocument.sources.map((entry) => entry.id));
const newEvidence = [];
const newRights = [];

for (const entry of candidates) {
  const merchant = official[entry.merchantKey];
  const sourceId = `source-${entry.id}-product`;
  const evidenceId = `evidence-${entry.id}-product`;
  const configEvidenceId = `evidence-${entry.id}-configuration`;
  const configId = `${entry.id}-standard`;
  const sourceUrl = `${merchant.host}/products/${entry.handle}`;
  if (!sourceById.has(sourceId)) {
    sourcesDocument.sources.push({
      id: sourceId,
      type: "manufacturer-page",
      url: sourceUrl,
      title: `${entry.model} product page`,
      publisher: merchant.publisher,
      market: "US",
      checked_at: today,
      locator: "Product page model identity and collection membership",
    });
    sourceById.add(sourceId);
  }
  const product = {
    id: entry.id,
    market: "US",
    slug: entry.id,
    brand_name: merchant.brand,
    model: entry.model,
    product_type: documented(entry.productType, evidenceId),
    heat_type: documented(entry.heat, evidenceId),
    energy_sources: unknown("The official product page does not state a normalized US energy source in the reviewed collection record."),
    placements: entry.placement === "unknown" ? unknown("The reviewed product page does not state a single placement context.") : documented([entry.placement], evidenceId),
    form: documented(entry.form, evidenceId),
    configuration_ids: [configId],
    source_ids: [sourceId],
    publication_status: "candidate",
    spec_checked_at: today,
    change_reason: "Added from an exact official US manufacturer product page; technical review remains open before publication.",
  };
  const component = entry.heat === "infrared" ? "infrared-system" : "heater";
  const config = {
    id: configId,
    market: "US",
    product_id: entry.id,
    label: `${entry.model} standard configuration`,
    manufacturer_sku: unknown("The reviewed product page does not expose a stable manufacturer SKU in the catalog record."),
    capacity: {
      seated: entry.capacity ? documented(entry.capacity, configEvidenceId) : unknown("A model-level seated capacity is not stated on the reviewed product page."),
      reclining: unknown("A reclining capacity is not stated on the reviewed product page."),
    },
    dimensions: {
      exterior: unknown("Complete exterior dimensions require the individual technical specification or manual."),
      interior: unknown("Complete interior dimensions require the individual technical specification or manual."),
      shipping: unknown("Shipping dimensions are not stated in the reviewed catalog record."),
      minimum_clearances: unknown("Installation clearances require the applicable manual."),
    },
    net_weight: unknown("Net weight is not stated in the reviewed catalog record."),
    shipping_weight: unknown("Shipping weight is not stated in the reviewed catalog record."),
    materials: unknown("Model-level materials require the individual product specification."),
    components: [],
    electrical_supply_options: [{
      id: `${entry.id}-electrical-unknown`,
      evidence_ids: [configEvidenceId],
      requirements: [{
        component,
        voltage_v: unknown("Voltage is not stated in the reviewed catalog record."),
        frequency_hz: unknown("Frequency is not stated in the reviewed catalog record."),
        phase: unknown("Phase is not stated in the reviewed catalog record."),
        rated_power_w: unknown("Rated power is not stated in the reviewed catalog record."),
        rated_current_a: unknown("Rated current is not stated in the reviewed catalog record."),
        required_circuit_a: unknown("Required circuit rating is not stated in the reviewed catalog record."),
        specified_breaker_a: unknown("Breaker rating is not stated in the reviewed catalog record."),
        connection: unknown("Connection type is not stated in the reviewed catalog record."),
        plug_type: unknown("Plug type is not stated in the reviewed catalog record."),
        dedicated_circuit: unknown("Dedicated-circuit requirements are not stated in the reviewed catalog record."),
      }],
    }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: [sourceId],
    publication_status: "candidate",
  };
  productsDocument.products.push(product);
  configurationsDocument.configurations.push(config);
  newEvidence.push({ id: evidenceId, entity_id: entry.id, source_id: sourceId, field_path: "product_identity", raw_value: `${entry.model} listed on the official US product page.` });
  newEvidence.push({ id: configEvidenceId, entity_id: configId, source_id: sourceId, field_path: "configuration_identity", raw_value: `${entry.model} is represented as a non-publishing review configuration.` });
  newRights.push({ asset_id: `${entry.id}-image`, entity_id: entry.id, merchant_id: merchant.merchantId, asset_type: "manufacturer-image", source_url: sourceUrl, rights_status: "not-requested", permission_basis: "none", action: "Use no image until written permission or an approved feed license is recorded." });
}

sourcesDocument.evidence.push(...newEvidence);
rightsDocument.assets.push(...newRights);
await writeJson("data/us/products.json", productsDocument);
await writeJson("data/us/configurations.json", configurationsDocument);
await writeJson("data/us/sources.json", sourcesDocument);
await writeJson("docs/us/rights-register.json", rightsDocument);
console.log(`Added ${candidates.length} source-backed US candidates; total is now ${productsDocument.products.length}.`);
