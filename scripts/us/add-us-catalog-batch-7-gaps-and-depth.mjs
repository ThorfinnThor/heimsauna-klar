import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checkedAt = "2026-09-22";
const nextReviewAt = "2026-12-22";

const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const dimensions = (width, depth, height, unit = "in") => ({
  width: { value: width, unit },
  depth: { value: depth, unit },
  height: { value: height, unit },
});

const [products, configurations, sources, merchants, rights] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("data/us/merchants.json"),
  readJson("docs/us/rights-register.json"),
]);

const productById = new Map(products.products.map((entry) => [entry.id, entry]));
const configurationById = new Map(configurations.configurations.map((entry) => [entry.id, entry]));
const sourceIds = new Set(sources.sources.map((entry) => entry.id));
const evidenceIds = new Set(sources.evidence.map((entry) => entry.id));
const assetIds = new Set(rights.assets.map((entry) => entry.asset_id));

const ensureMerchant = (merchant) => {
  if (!merchants.merchants.some((entry) => entry.id === merchant.id)) merchants.merchants.push(merchant);
};

ensureMerchant({ id: "thermasol", market: "US", name: "ThermaSol", kind: "manufacturer", allowed_hosts: ["thermasol.com", "www.thermasol.com"], status: "candidate" });
ensureMerchant({ id: "morzh", market: "US", name: "MORZH", kind: "manufacturer", allowed_hosts: ["morzh.eu"], status: "candidate" });
ensureMerchant({ id: "ox-sweat", market: "US", name: "Ox Sweat Sauna", kind: "manufacturer", allowed_hosts: ["oxsweat.com"], status: "candidate" });
ensureMerchant({ id: "saunabox", market: "US", name: "SaunaBox", kind: "manufacturer", allowed_hosts: ["saunabox.com"], status: "candidate" });

const addSource = ({ id, type = "manufacturer-page", url, title, publisher, locator }) => {
  if (sourceIds.has(id)) return;
  sources.sources.push({ id, type, url, title, publisher, market: "US", checked_at: checkedAt, locator });
  sourceIds.add(id);
};

const addEvidence = (entry) => {
  if (evidenceIds.has(entry.id)) throw new Error(`Duplicate evidence ID ${entry.id}`);
  sources.evidence.push(entry);
  evidenceIds.add(entry.id);
};

const addRightsRecord = ({ id, entityId, merchantId, url, assetType = "manufacturer-image" }) => {
  if (assetIds.has(id)) return;
  rights.assets.push({
    asset_id: id,
    entity_id: entityId,
    merchant_id: merchantId,
    asset_type: assetType,
    source_url: url,
    rights_status: "not-requested",
    permission_basis: "none",
    action: "Use no image until written permission or an approved feed license is recorded.",
  });
  assetIds.add(id);
};

const electricalOption = ({ id, component, evidenceId, voltage, power, connection }) => ({
  id,
  evidence_ids: [evidenceId],
  requirements: [{
    component,
    voltage_v: voltage ? documented(voltage, evidenceId) : unknown("The reviewed manufacturer source does not state a supply voltage."),
    frequency_hz: unknown("The reviewed manufacturer source does not state a supply frequency."),
    phase: unknown("The reviewed manufacturer source does not state the electrical phase."),
    rated_power_w: power ? documented(power, evidenceId) : unknown("The reviewed manufacturer source does not state rated power."),
    rated_current_a: unknown("The reviewed manufacturer source does not state rated current."),
    required_circuit_a: unknown("The reviewed manufacturer source does not state a required circuit rating."),
    specified_breaker_a: unknown("The reviewed manufacturer source does not state a breaker rating."),
    connection: connection ? documented(connection, evidenceId) : unknown("The reviewed manufacturer source does not state a normalized connection type."),
    plug_type: unknown("The reviewed manufacturer source does not state a plug type."),
    dedicated_circuit: unknown("The reviewed manufacturer source does not state whether a dedicated circuit is required."),
  }],
});

const thermasolRecords = [
  {
    id: "thermasol-aalto", model: "Aalto", url: "https://www.thermasol.com/products/aalto", sku: "14-AALTODL",
    placement: "indoor", capacity: 4, exterior: dimensions(87, 87, 83), netWeight: 1543, shippingWeight: 1764,
    materials: ["Thermo-aspen", "Brushed Tyrol wood", "Transparent glass"], power: 9000, existing: true,
  },
  {
    id: "thermasol-spectra", model: "Spectra", url: "https://www.thermasol.com/products/spectra", sku: "14-SPECTRA",
    placement: "outdoor", capacity: 4, exterior: dimensions(82, 90, 91), netWeight: 2205, shippingWeight: 2425,
    materials: ["Thermally modified Tyrol wood", "Thermally modified aspen", "Parsol dark grey glass"], power: 8000, existing: true,
  },
  {
    id: "thermasol-vue", model: "Vue", url: "https://www.thermasol.com/products/vue", sku: "14-VUEDL",
    placement: "outdoor", capacity: 4, exterior: dimensions(79, 87, 89), netWeight: 2425, shippingWeight: 2646,
    materials: ["Thermally modified aspen", "Tyrol wood", "Mirror thermal glass"], power: 9000, existing: true,
  },
  {
    id: "thermasol-astra", model: "Astra", url: "https://www.thermasol.com/products/astra", sku: "14-ASTRADL",
    placement: "indoor", capacity: 4, exterior: dimensions(85.4, 85.4, 83), netWeight: 1323, shippingWeight: 1543,
    materials: ["Thermo-aspen", "Brushed Tyrol wood", "Transparent glass"], power: 9000,
  },
  {
    id: "thermasol-lumaria-medium", model: "Lumaria Medium", url: "https://www.thermasol.com/products/lumaria", sku: "14-LUMARIAMDL",
    placement: "indoor", capacity: 3, exterior: dimensions(66.9, 86.6, 83), netWeight: 1323, shippingWeight: 1543,
    materials: ["Thermally modified aspen", "Brushed Tyrol wood", "Transparent glass"], power: 9000,
  },
  {
    id: "thermasol-lumaria-large", model: "Lumaria Large", url: "https://www.thermasol.com/products/lumaria", sku: null,
    placement: "indoor", capacity: 5, exterior: dimensions(86.6, 86.6, 83), netWeight: 1543, shippingWeight: 1764,
    materials: ["Thermally modified aspen", "Brushed Tyrol wood", "Transparent glass"], power: 9000,
  },
  {
    id: "thermasol-fortis", model: "Fortis", url: "https://www.thermasol.com/products/fortis", sku: "14-FORTIS",
    placement: "outdoor", capacity: 4, exterior: dimensions(87, 90, 89), netWeight: 2161, shippingWeight: 2381,
    materials: ["Thermally modified aspen", "Thermally modified Nordic spruce", "Parsol dark grey glass"], power: 8000,
  },
  {
    id: "thermasol-solaris-small", model: "Solaris Small", url: "https://www.thermasol.com/products/solaris", sku: "14-KIR-4560",
    placement: "outdoor", capacity: 3, exterior: dimensions(60, 86, 97), netWeight: null, shippingWeight: null,
    materials: ["Tile Oak", "Tinted glass"], power: 3000, form: "Fully assembled off-grid solar sauna cabin",
  },
  {
    id: "thermasol-solaris-medium", model: "Solaris Medium", url: "https://www.thermasol.com/products/solaris", sku: null,
    placement: "outdoor", capacity: 5, exterior: dimensions(86, 86, 97), netWeight: null, shippingWeight: null,
    materials: ["Tile Oak", "Tinted glass"], power: 3000, form: "Fully assembled off-grid solar sauna cabin",
  },
];

for (const record of thermasolRecords) {
  const sourceId = `source-${record.id}-manufacturer`;
  const productEvidenceId = `evidence-${record.id}-manufacturer-product`;
  const configurationEvidenceId = `evidence-${record.id}-manufacturer-configuration`;
  const electricalEvidenceId = `evidence-${record.id}-manufacturer-electrical`;
  const configurationId = `${record.id}-standard`;
  addSource({
    id: sourceId,
    url: record.url,
    title: `ThermaSol ${record.model} product page`,
    publisher: "ThermaSol",
    locator: "Manufacturer model identity, capacity, dimensions, materials, weight and included heater",
  });

  addEvidence({ id: productEvidenceId, entity_id: record.id, source_id: sourceId, field_path: "product_identity", raw_value: `${record.model} is listed by ThermaSol as a ${record.placement} traditional sauna.` });
  addEvidence({ id: configurationEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "configuration.capacity_dimensions_materials_weights", raw_value: `${record.model}: capacity ${record.capacity}; exterior ${JSON.stringify(record.exterior)}; materials ${record.materials.join(", ")}; assembled weight ${record.netWeight ?? "not stated"} lb; shipping weight ${record.shippingWeight ?? "not stated"} lb.` });
  addEvidence({ id: electricalEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "electrical_supply_options", raw_value: `${record.model} includes a ${record.power / 1000} kW heater. The reviewed product page does not state supply voltage or circuit requirements.` });

  const product = productById.get(record.id);
  if (record.existing) {
    if (!product) throw new Error(`Expected existing product ${record.id}`);
    product.product_type = documented("sauna-cabin", productEvidenceId);
    product.heat_type = documented("traditional", productEvidenceId);
    product.energy_sources = documented(["electric"], electricalEvidenceId);
    product.placements = documented([record.placement], productEvidenceId);
    product.form = documented(record.form ?? "Freestanding sauna cabin", productEvidenceId);
    product.source_ids = [...new Set([...product.source_ids, sourceId])];
    product.spec_checked_at = checkedAt;
    product.next_review_at = nextReviewAt;
    product.change_reason = "Manufacturer specifications replaced the earlier retailer-only placeholder fields; unresolved electrical installation details remain explicit.";
  } else {
    if (product) throw new Error(`New product ID already exists: ${record.id}`);
    const newProduct = {
      id: record.id, market: "US", slug: record.id, brand_name: "ThermaSol", model: record.model,
      product_type: documented("sauna-cabin", productEvidenceId),
      heat_type: documented("traditional", productEvidenceId),
      energy_sources: documented(["electric"], electricalEvidenceId),
      placements: documented([record.placement], productEvidenceId),
      form: documented(record.form ?? "Freestanding sauna cabin", productEvidenceId),
      configuration_ids: [configurationId], source_ids: [sourceId], publication_status: "candidate",
      spec_checked_at: checkedAt, next_review_at: nextReviewAt,
      change_reason: "Added from the current ThermaSol US manufacturer page with model-level capacity, dimensions, materials and heater output; publication review remains open.",
    };
    products.products.push(newProduct);
    productById.set(record.id, newProduct);
  }

  const configuration = configurationById.get(configurationId);
  const normalizedConfiguration = {
    id: configurationId,
    market: "US",
    product_id: record.id,
    label: `${record.model} documented configuration`,
    manufacturer_sku: record.sku ? documented(record.sku, configurationEvidenceId) : unknown("A distinct manufacturer SKU for this size is not stated on the reviewed page."),
    capacity: { seated: documented(record.capacity, configurationEvidenceId), reclining: unknown("A reclining capacity is not stated on the reviewed manufacturer page.") },
    dimensions: {
      exterior: documented(record.exterior, configurationEvidenceId),
      interior: unknown("Interior dimensions are not stated on the reviewed manufacturer page."),
      shipping: unknown("Complete shipping dimensions are not stated on the reviewed manufacturer page."),
      minimum_clearances: unknown("Installation clearances require the linked installation documentation and site review."),
    },
    net_weight: record.netWeight ? documented({ value: record.netWeight, unit: "lb" }, configurationEvidenceId) : unknown("Assembled weight is not stated for this size on the reviewed manufacturer page."),
    shipping_weight: record.shippingWeight ? documented({ value: record.shippingWeight, unit: "lb" }, configurationEvidenceId) : unknown("Shipping weight is not stated for this size on the reviewed manufacturer page."),
    materials: documented(record.materials, configurationEvidenceId),
    components: [{ id: `${configurationId}-heater`, component_type: "heater", name: `${record.power / 1000} kW sauna heater`, inclusion: "included", evidence_ids: [electricalEvidenceId] }],
    electrical_supply_options: [electricalOption({ id: `${configurationId}-electrical`, component: "heater", evidenceId: electricalEvidenceId, power: record.power })],
    certification_ids: [], warranty_ids: [], source_ids: [sourceId], publication_status: "candidate",
  };
  if (configuration) Object.assign(configuration, normalizedConfiguration);
  else {
    configurations.configurations.push(normalizedConfiguration);
    configurationById.set(configurationId, normalizedConfiguration);
  }

  if (!record.existing) {
    addRightsRecord({ id: `${record.id}-manufacturer-image`, entityId: record.id, merchantId: "thermasol", url: record.url });
  }
}

const tentRecords = [
  {
    id: "morzh-sauna-tent", brand: "MORZH", model: "MORZH Sauna Tent", merchantId: "morzh",
    url: "https://morzh.eu/wa-data/public/site/morzh/Technical%20Sertificate%20Morzh%20Lux%20English.pdf", sourceType: "spec-sheet",
    exterior: dimensions(205, 205, 195, "cm"), weight: { value: 8.3, unit: "kg" },
    materials: ["Oxford 240 outer fabric", "80 g/m² insulation", "Taffeta 210 RipStop inner fabric"],
    form: "Portable insulated sauna tent with chimney opening",
  },
  {
    id: "morzh-light", brand: "MORZH", model: "MORZH Light", merchantId: "morzh",
    url: "https://morzh.eu/wa-data/public/site/morzh/Technical%20Sertificate%20Morzh%20Light%20English.pdf", sourceType: "spec-sheet",
    exterior: dimensions(205, 205, 195, "cm"), weight: { value: 6.2, unit: "kg" },
    materials: ["Oxford 240 PU 2000 polyester fabric"],
    form: "Lightweight portable sauna tent with chimney opening",
  },
  {
    id: "morzh-max", brand: "MORZH", model: "MORZH Max", merchantId: "morzh",
    url: "https://morzh.eu/wa-data/public/site/morzh/MORZH%20MAX%20.pdf", sourceType: "spec-sheet",
    exterior: dimensions(230, 296, 197, "cm"), weight: { value: 17.7, unit: "kg" }, materials: null,
    form: "Large portable sauna tent with removable internal partition and support for two stoves",
  },
  {
    id: "morzh-shelter", brand: "MORZH", model: "MORZH Shelter", merchantId: "morzh",
    url: "https://morzh.eu/wa-data/public/site/morzh/Technical%20Sertificate%20Morzh%20Shelter.pdf", sourceType: "spec-sheet",
    exterior: dimensions(230, 300, 195, "cm"), weight: { value: 15, unit: "kg" },
    materials: ["Oxford 240 polyester fabric with water-repellent impregnation"],
    form: "Portable sauna shelter with removable wall, mosquito net and chimney opening",
  },
  {
    id: "ox-sweat-skylight", brand: "Ox Sweat Sauna", model: "Skylight Sauna Tent", merchantId: "ox-sweat",
    url: "https://oxsweat.com/products/skylight-sauna-tent", sourceType: "manufacturer-page",
    exterior: dimensions(6, 6, 7, "ft"), weight: null,
    materials: ["Three-layer insulated 420D quilted denier fabric"],
    form: "Pop-up outdoor sauna tent with stove jack, ventilation opening and fresh-air intake",
  },
];

for (const record of tentRecords) {
  if (productById.has(record.id)) throw new Error(`Tent product ID already exists: ${record.id}`);
  const sourceId = `source-${record.id}-manufacturer`;
  const productEvidenceId = `evidence-${record.id}-product`;
  const configurationEvidenceId = `evidence-${record.id}-configuration`;
  const configurationId = `${record.id}-standard`;
  addSource({ id: sourceId, type: record.sourceType, url: record.url, title: `${record.model} official specification`, publisher: record.brand, locator: "Official model identity, dimensions, construction and transport weight where stated" });
  addEvidence({ id: productEvidenceId, entity_id: record.id, source_id: sourceId, field_path: "product_identity", raw_value: `${record.model} is documented by ${record.brand} as a portable sauna tent designed around a stove and chimney opening.` });
  addEvidence({ id: configurationEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "configuration.dimensions_materials_weight", raw_value: `${record.model}: exterior ${JSON.stringify(record.exterior)}; transport weight ${record.weight ? `${record.weight.value} ${record.weight.unit}` : "not stated"}; materials ${record.materials?.join(", ") ?? "not fully stated"}.` });
  const product = {
    id: record.id, market: "US", slug: record.id, brand_name: record.brand, model: record.model,
    product_type: documented("sauna-tent", productEvidenceId), heat_type: documented("traditional", productEvidenceId),
    energy_sources: unknown("The tent specification describes stove compatibility but does not normalize the fuel source for every compatible stove."),
    placements: documented(["outdoor"], productEvidenceId), form: documented(record.form, productEvidenceId),
    configuration_ids: [configurationId], source_ids: [sourceId], publication_status: "candidate",
    spec_checked_at: checkedAt, next_review_at: nextReviewAt,
    change_reason: "Added to close the missing portable traditional sauna-tent category; capacity and stove-package details remain open unless the official source states them explicitly.",
  };
  const configuration = {
    id: configurationId, market: "US", product_id: record.id, label: `${record.model} tent configuration`,
    manufacturer_sku: unknown("A stable manufacturer SKU is not stated in the reviewed source."),
    capacity: { seated: unknown("The reviewed source does not state a seated sauna capacity."), reclining: unknown("The reviewed source does not state a reclining sauna capacity.") },
    dimensions: { exterior: documented(record.exterior, configurationEvidenceId), interior: unknown("Interior dimensions are not separately stated."), shipping: unknown("Complete shipping dimensions are not recorded for this catalog configuration."), minimum_clearances: unknown("Stove and chimney clearances must follow the selected stove documentation.") },
    net_weight: record.weight ? documented(record.weight, configurationEvidenceId) : unknown("Tent weight is not stated on the reviewed product page."),
    shipping_weight: unknown("Shipping weight is not stated in the reviewed source."),
    materials: record.materials ? documented(record.materials, configurationEvidenceId) : unknown("A complete material specification is not stated in the reviewed source."),
    components: [], electrical_supply_options: [], certification_ids: [], warranty_ids: [], source_ids: [sourceId], publication_status: "candidate",
  };
  products.products.push(product); configurations.configurations.push(configuration);
  productById.set(record.id, product); configurationById.set(configurationId, configuration);
  addRightsRecord({ id: `${record.id}-image`, entityId: record.id, merchantId: record.merchantId, url: record.url });
}

{
  const record = {
    id: "saunabox-pulse-pro", brand: "SaunaBox", model: "Pulse PRO", merchantId: "saunabox",
    url: "https://saunabox.com/products/pulse-pro-portable-ir-sauna-with-redlights",
  };
  if (productById.has(record.id)) throw new Error(`Product ID already exists: ${record.id}`);
  const sourceId = `source-${record.id}-manufacturer`;
  const productEvidenceId = `evidence-${record.id}-product`;
  const configurationEvidenceId = `evidence-${record.id}-configuration`;
  const electricalEvidenceId = `evidence-${record.id}-electrical`;
  const configurationId = `${record.id}-standard`;
  addSource({ id: sourceId, url: record.url, title: "SaunaBox Pulse PRO product page", publisher: "SaunaBox", locator: "Official portable infrared model identity, dimensions, materials and electrical specification" });
  addEvidence({ id: productEvidenceId, entity_id: record.id, source_id: sourceId, field_path: "product_identity", raw_value: "Pulse PRO is listed as a portable infrared sauna tent with six infrared panels and integrated red-light panels." });
  addEvidence({ id: configurationEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "configuration.dimensions_materials", raw_value: "The manufacturer lists 36 in L × 36 in W × 68 in H, an insulated OEKO-TEX-certified cover and a heat-reflective liner." });
  addEvidence({ id: electricalEvidenceId, entity_id: configurationId, source_id: sourceId, field_path: "electrical_supply_options", raw_value: "The manufacturer lists 110 V, 1,600 W and 50–60 Hz." });
  products.products.push({
    id: record.id, market: "US", slug: record.id, brand_name: record.brand, model: record.model,
    product_type: documented("sauna-tent", productEvidenceId), heat_type: documented("infrared", productEvidenceId), energy_sources: documented(["electric"], electricalEvidenceId),
    placements: unknown("The portable product page does not define a single normalized indoor or outdoor placement."),
    form: documented("Portable infrared sauna tent with red-light panels", productEvidenceId), configuration_ids: [configurationId], source_ids: [sourceId], publication_status: "candidate",
    spec_checked_at: checkedAt, next_review_at: nextReviewAt,
    change_reason: "Added to close the missing portable infrared sauna-tent category using the current manufacturer specification; seated capacity remains unstated.",
  });
  configurations.configurations.push({
    id: configurationId, market: "US", product_id: record.id, label: "Pulse PRO documented configuration",
    manufacturer_sku: unknown("A stable manufacturer SKU is not stated on the reviewed product page."),
    capacity: { seated: unknown("The reviewed manufacturer page does not state a seated capacity."), reclining: unknown("The reviewed manufacturer page does not state a reclining capacity.") },
    dimensions: { exterior: documented(dimensions(36, 36, 68), configurationEvidenceId), interior: unknown("Interior dimensions are not stated separately."), shipping: unknown("Shipping dimensions are not stated."), minimum_clearances: unknown("Operating clearances are not stated in the reviewed product page.") },
    net_weight: unknown("Net weight is not stated on the reviewed product page."), shipping_weight: unknown("Shipping weight is not stated on the reviewed product page."),
    materials: documented(["OEKO-TEX-certified insulated cover", "Heat-reflective liner"], configurationEvidenceId),
    components: [{ id: `${configurationId}-infrared-system`, component_type: "infrared-system", name: "Six infrared heating panels", inclusion: "included", evidence_ids: [productEvidenceId] }],
    electrical_supply_options: [electricalOption({ id: `${configurationId}-electrical`, component: "infrared-system", evidenceId: electricalEvidenceId, voltage: 110, power: 1600 })],
    certification_ids: [], warranty_ids: [], source_ids: [sourceId], publication_status: "candidate",
  });
  addRightsRecord({ id: `${record.id}-image`, entityId: record.id, merchantId: record.merchantId, url: record.url });
}

rights.updated_at = checkedAt;

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
  writeJson("data/us/merchants.json", merchants),
  writeJson("docs/us/rights-register.json", rights),
]);

console.log(JSON.stringify({
  enrichedExisting: thermasolRecords.filter((entry) => entry.existing).map((entry) => entry.id),
  addedProducts: thermasolRecords.filter((entry) => !entry.existing).map((entry) => entry.id).concat(tentRecords.map((entry) => entry.id), "saunabox-pulse-pro"),
  totalProducts: products.products.length,
}, null, 2));
