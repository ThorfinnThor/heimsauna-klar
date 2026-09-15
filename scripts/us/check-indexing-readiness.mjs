import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");

function readJson(path) {
  return readFile(resolve(projectRoot, path), "utf8").then(JSON.parse);
}

function documented(fact) {
  return fact?.status === "documented";
}

function documentedValue(fact) {
  return documented(fact) ? fact.value : null;
}

function sourceAgeDays(checkedAt, asOf) {
  const start = new Date(`${checkedAt}T00:00:00Z`);
  const end = new Date(`${asOf}T00:00:00Z`);
  return Math.floor((end.valueOf() - start.valueOf()) / 86_400_000);
}

const [plan, coverage, productsDocument, configurationsDocument, sourcesDocument, editorialDocument, legalDocument, publication] = await Promise.all([
  readJson("docs/us/indexing-readiness.json"),
  readJson("docs/us/coverage-matrix.json"),
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("content/us/editorial.json"),
  readJson("content/us/legal.json"),
  readJson("data/us/publication.json"),
]);

const issues = [];
const productById = new Map(productsDocument.products.map((product) => [product.id, product]));
const configurationByProductId = new Map(configurationsDocument.configurations.map((configuration) => [configuration.product_id, configuration]));
const sourceById = new Map(sourcesDocument.sources.map((source) => [source.id, source]));
const editorialById = new Map(editorialDocument.entries.map((entry) => [entry.id, entry]));
const trustById = new Map(legalDocument.pages.map((page) => [page.id, page]));
const firstWave = plan.first_wave.product_ids;

if (plan.schema_version !== 1) issues.push("schema_version must be 1");
if (plan.market !== "US") issues.push("market must be US");
if (new Set(firstWave).size !== firstWave.length) issues.push("first-wave product IDs must be unique");
if (plan.current_result.catalog_products !== productsDocument.products.length) issues.push("catalog product count is stale");
if (plan.current_result.first_wave_products !== firstWave.length) issues.push("first-wave product count is stale");

let qualified = 0;
for (const productId of firstWave) {
  const product = productById.get(productId);
  const configuration = configurationByProductId.get(productId);
  if (!product) {
    issues.push(`${productId}: product is missing`);
    continue;
  }
  if (!configuration) {
    issues.push(`${productId}: configuration is missing`);
    continue;
  }

  const sourceRecords = product.source_ids.map((sourceId) => sourceById.get(sourceId)).filter(Boolean);
  const exactManufacturerSources = sourceRecords.filter((source) =>
    source.type === "manufacturer-page" && source.locator?.toLowerCase().includes("product page specifications"));
  const exactManufacturerSource = exactManufacturerSources.length > 0;
  const currentManufacturerSource = exactManufacturerSources.some((source) => {
    const age = sourceAgeDays(source.checked_at, plan.updated_at);
    return Number.isFinite(age) && age >= 0 && age <= plan.data_criteria.maximum_source_age_days;
  });
  const productFactsComplete = [product.product_type, product.heat_type, product.energy_sources, product.placements, product.form]
    .every(documented);
  const configurationFactsComplete = [configuration.capacity.seated, configuration.dimensions.exterior, configuration.materials]
    .every(documented);
  const electricalFactsComplete = configuration.electrical_supply_options.some((option) =>
    option.requirements.some((requirement) =>
      documented(requirement.voltage_v)
      && documented(requirement.rated_power_w)
      && documented(requirement.rated_current_a)));
  const serialized = JSON.stringify({ product, configuration });
  const noConflicts = !serialized.includes('"status":"conflict"');

  if (!exactManufacturerSource) issues.push(`${productId}: exact manufacturer product source is missing`);
  if (exactManufacturerSource && !currentManufacturerSource) issues.push(`${productId}: exact manufacturer product source is stale or has an invalid check date`);
  if (!productFactsComplete) issues.push(`${productId}: a required product fact is not documented`);
  if (!configurationFactsComplete) issues.push(`${productId}: a required configuration fact is not documented`);
  if (!electricalFactsComplete) issues.push(`${productId}: voltage, rated power and rated current are not documented together`);
  if (!noConflicts) issues.push(`${productId}: unresolved fact conflict`);
  if (exactManufacturerSource && currentManufacturerSource && productFactsComplete && configurationFactsComplete && electricalFactsComplete && noConflicts) qualified += 1;
}

const categoryRules = {
  "indoor-infrared-cabins": (product) => documentedValue(product.product_type) === "sauna-cabin"
    && documentedValue(product.heat_type) === "infrared"
    && documentedValue(product.placements)?.includes("indoor"),
  "outdoor-infrared-cabins": (product) => documentedValue(product.product_type) === "sauna-cabin"
    && documentedValue(product.heat_type) === "infrared"
    && documentedValue(product.placements)?.includes("outdoor"),
  "indoor-traditional-cabins": (product) => ["sauna-cabin", "sauna-kit"].includes(documentedValue(product.product_type))
    && documentedValue(product.heat_type) === "traditional"
    && documentedValue(product.placements)?.includes("indoor"),
  "outdoor-traditional-cabins": (product) => ["sauna-cabin", "sauna-kit"].includes(documentedValue(product.product_type))
    && documentedValue(product.heat_type) === "traditional"
    && documentedValue(product.placements)?.includes("outdoor"),
  "sauna-kits": (product) => documentedValue(product.product_type) === "sauna-kit",
  "heaters": (product) => documentedValue(product.product_type) === "heater",
  "accessories-and-portable": (product) => ["accessory", "sauna-blanket", "sauna-tent"].includes(documentedValue(product.product_type)),
};

for (const category of coverage.categories) {
  const rule = categoryRules[category.id];
  if (!rule) {
    issues.push(`${category.id}: unsupported coverage category`);
    continue;
  }
  const categoryProducts = productsDocument.products.filter(rule);
  const count = categoryProducts.length;
  const dataCompleteCount = categoryProducts.filter((product) => {
    const configuration = configurationByProductId.get(product.id);
    const productFactsComplete = [product.product_type, product.heat_type, product.energy_sources, product.placements, product.form]
      .every(documented);
    const configurationFactsComplete = [configuration?.capacity.seated, configuration?.dimensions.exterior, configuration?.materials]
      .every(documented);
    const electricalFactsComplete = configuration?.electrical_supply_options.some((option) =>
      option.requirements.some((requirement) =>
        documented(requirement.voltage_v)
        && documented(requirement.rated_power_w)
        && documented(requirement.rated_current_a)));
    return productFactsComplete && configurationFactsComplete && electricalFactsComplete;
  }).length;
  if (count !== category.product_count) issues.push(`${category.id}: coverage count is ${count}, expected ${category.product_count}`);
  if (dataCompleteCount !== category.data_complete_count) issues.push(`${category.id}: data-complete count is ${dataCompleteCount}, expected ${category.data_complete_count}`);
}
if (coverage.updated_at !== plan.updated_at) issues.push("coverage matrix and indexing plan review dates differ");

for (const pageId of plan.first_wave.editorial_page_ids) {
  if (!editorialById.has(pageId)) issues.push(`${pageId}: editorial page is missing`);
}
for (const pageId of plan.first_wave.trust_page_ids) {
  if (!trustById.has(pageId)) issues.push(`${pageId}: trust page is missing`);
}

if (qualified !== plan.current_result.first_wave_data_qualified) {
  issues.push(`qualified first-wave count is ${qualified}, expected ${plan.current_result.first_wave_data_qualified}`);
}
if (plan.status !== "ready-to-index" && publication.indexing_enabled) {
  issues.push("US indexing cannot be enabled while the indexing-readiness plan still has open gates");
}
if (plan.current_result.indexing_enabled !== publication.indexing_enabled) {
  issues.push("indexing state in the readiness plan is stale");
}
if (plan.status !== "ready-to-index" && plan.current_result.first_wave_indexable_now !== 0) {
  issues.push("a blocked plan cannot report indexable first-wave products");
}

if (issues.length > 0) throw new Error(`US indexing-readiness check failed:\n- ${issues.join("\n- ")}`);

console.log(`US indexing readiness passed: ${qualified}/${firstWave.length} first-wave products meet the technical data gate; indexing remains ${publication.indexing_enabled ? "enabled" : "disabled"} with ${plan.remaining_gates.length} recorded release gates.`);
