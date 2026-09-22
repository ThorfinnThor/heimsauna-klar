import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const MAXIMUM_SOURCE_AGE_DAYS = 90;

function readJson(path) {
  return readFile(resolve(projectRoot, path), "utf8").then(JSON.parse);
}

function documented(fact) {
  return fact?.status === "documented";
}

function daysBetween(asOf, checkedAt) {
  const end = Date.parse(`${asOf}T00:00:00Z`);
  const start = Date.parse(`${checkedAt}T00:00:00Z`);
  if (!Number.isFinite(end) || !Number.isFinite(start)) return null;
  return Math.floor((end - start) / 86_400_000);
}

function asOfArgument() {
  const index = process.argv.indexOf("--as-of");
  const value = index >= 0 ? process.argv[index + 1] : null;
  if (!value) throw new Error("Usage: npm run us:candidates:readiness -- --as-of YYYY-MM-DD");
  return value;
}

const asOf = asOfArgument();
const [productsDocument, configurationsDocument, sourcesDocument, editorialDocument] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("content/us/product-editorial.json"),
]);

const configurationByProductId = new Map(
  configurationsDocument.configurations.map((configuration) => [configuration.product_id, configuration]),
);
const sourceById = new Map(sourcesDocument.sources.map((source) => [source.id, source]));
const editorialByProductId = new Map(editorialDocument.entries.map((entry) => [entry.product_id, entry]));

const cohorts = {
  editorialReady: [],
  sourceReview: [],
  electricalEnrichment: [],
  foundationalEnrichment: [],
};

for (const product of productsDocument.products.filter((entry) => entry.publication_status === "candidate")) {
  const configuration = configurationByProductId.get(product.id);
  const productFactsComplete = [
    product.product_type,
    product.heat_type,
    product.energy_sources,
    product.placements,
    product.form,
  ].every(documented);
  const configurationFactsComplete = configuration && [
    configuration.capacity?.seated,
    configuration.dimensions?.exterior,
    configuration.materials,
  ].every(documented);
  const electricalFactsComplete = configuration?.electrical_supply_options?.some((option) =>
    option.requirements?.some((requirement) =>
      documented(requirement.voltage_v)
      && documented(requirement.rated_power_w)
      && documented(requirement.rated_current_a)));
  const exactCurrentManufacturerSource = product.source_ids
    .map((sourceId) => sourceById.get(sourceId))
    .filter((source) => source?.type === "manufacturer-page")
    .filter((source) => source.locator?.toLowerCase().includes("product page specifications"))
    .some((source) => {
      const age = daysBetween(asOf, source.checked_at);
      return age !== null && age >= 0 && age <= MAXIMUM_SOURCE_AGE_DAYS;
    });
  const hasConflict = JSON.stringify({ product, configuration }).includes('"status":"conflict"');
  const editorial = editorialByProductId.get(product.id);
  const editorialReviewed = ["reviewed", "published"].includes(editorial?.status);
  const coreComplete = productFactsComplete && configurationFactsComplete;
  const row = {
    id: product.id,
    name: `${product.brand_name} ${product.model}`,
    productType: documented(product.product_type) ? product.product_type.value : "unknown",
    coreComplete,
    electricalFactsComplete: Boolean(electricalFactsComplete),
    exactCurrentManufacturerSource,
    conflictFree: !hasConflict,
    editorialReviewed,
  };

  if (coreComplete && electricalFactsComplete && exactCurrentManufacturerSource && !hasConflict) {
    cohorts.editorialReady.push(row);
  } else if (coreComplete && electricalFactsComplete && !hasConflict) {
    cohorts.sourceReview.push(row);
  } else if (coreComplete && !hasConflict) {
    cohorts.electricalEnrichment.push(row);
  } else {
    cohorts.foundationalEnrichment.push(row);
  }
}

function byType(rows) {
  return Object.fromEntries(
    Object.entries(Object.groupBy(rows, (row) => row.productType))
      .map(([type, entries]) => [type, entries.length])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

const summary = Object.fromEntries(
  Object.entries(cohorts).map(([id, rows]) => [id, { count: rows.length, byType: byType(rows) }]),
);

const candidateCount = Object.values(cohorts).reduce((total, rows) => total + rows.length, 0);
const reviewedEditorialCount = Object.values(cohorts)
  .flat()
  .filter((row) => row.editorialReviewed).length;

console.log(JSON.stringify({
  schemaVersion: 1,
  market: "US",
  asOf,
  candidateCount,
  reviewedEditorialCount,
  publicationDecision: candidateCount > 0 && reviewedEditorialCount === 0
    ? "No candidate can be bulk-published. Start with the editorial-ready cohort and require editorial and presentation QA before promotion."
    : "Review cohort-level blockers before promotion.",
  summary,
  editorialReady: cohorts.editorialReady,
}, null, 2));
