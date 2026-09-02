import { readFile } from "node:fs/promises";

const schema = JSON.parse(await readFile(new URL("../data/schema/product.schema.json", import.meta.url), "utf8"));
const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const awinInput = JSON.parse(await readFile(new URL("../data/awin-expansion-import-26.json", import.meta.url), "utf8"));
const awinDrafts = JSON.parse(await readFile(new URL("../data/awin-expansion-product-drafts-26.json", import.meta.url), "utf8"));
const awinReview = JSON.parse(await readFile(new URL("../data/awin-expansion-sol-review-26.json", import.meta.url), "utf8"));
const awinEditorial = JSON.parse(await readFile(new URL("../data/awin-expansion-editorial-26.json", import.meta.url), "utf8"));
const awinPublication = JSON.parse(await readFile(new URL("../data/awin-expansion-publication-21.json", import.meta.url), "utf8"));
const productEditorialOverrides = JSON.parse(await readFile(new URL("../data/product-editorial-overrides.json", import.meta.url), "utf8"));

function matchesType(value, type) {
  if (type === "null") return value === null;
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === type;
}

function validate(value, rule, path) {
  const types = Array.isArray(rule.type) ? rule.type : rule.type ? [rule.type] : [];
  if (types.length > 0 && !types.some((type) => matchesType(value, type))) {
    throw new Error(`${path} has type ${typeof value}, expected ${types.join(" or ")}`);
  }
  if (rule.enum && !rule.enum.some((candidate) => Object.is(candidate, value))) {
    throw new Error(`${path} has an unsupported value`);
  }
  if (typeof value === "string") {
    if (rule.minLength !== undefined && value.length < rule.minLength) throw new Error(`${path} is too short`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) throw new Error(`${path} does not match its pattern`);
    if (rule.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${path} must be an ISO date`);
    if (rule.format === "uri" && !/^[a-z][a-z\d+.-]*:\/\//i.test(value)) throw new Error(`${path} must be a URI`);
  }
  if (typeof value === "number") {
    if (rule.minimum !== undefined && value < rule.minimum) throw new Error(`${path} is below minimum`);
    if (rule.exclusiveMinimum !== undefined && value <= rule.exclusiveMinimum) throw new Error(`${path} is not above exclusive minimum`);
    if (rule.maximum !== undefined && value > rule.maximum) throw new Error(`${path} is above maximum`);
  }
  if (Array.isArray(value)) {
    if (rule.minItems !== undefined && value.length < rule.minItems) throw new Error(`${path} needs at least ${rule.minItems} items`);
    if (rule.items) value.forEach((item, index) => validate(item, rule.items, `${path}[${index}]`));
  }
  if (matchesType(value, "object") && rule.properties) {
    for (const required of rule.required ?? []) {
      if (!(required in value)) throw new Error(`${path}.${required} is required by the schema`);
    }
    if (rule.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in rule.properties)) throw new Error(`${path}.${key} is not declared in the schema`);
      }
    }
    for (const [key, childRule] of Object.entries(rule.properties)) {
      if (key in value) validate(value[key], childRule, `${path}.${key}`);
    }
  }
}

if (!Array.isArray(products)) throw new Error("data/products.json must contain an array");
products.forEach((product, index) => validate(product, schema, `products[${index}]`));

if (!Array.isArray(awinDrafts.products)) throw new Error("Awin draft document must contain a products array");
awinDrafts.products.forEach((product, index) => {
  validate(product, schema, `awinDrafts.products[${index}]`);
  if (product.status !== "draft") throw new Error(`awinDrafts.products[${index}] must remain a draft`);
});

const publicIds = new Set(products.map((product) => product.product_id));
if (publicIds.size !== products.length) throw new Error("Public product IDs must be unique");
const draftIds = awinDrafts.products.map((product) => product.product_id);
if (new Set(draftIds).size !== draftIds.length) throw new Error("Awin draft product IDs must be unique");

if (!Array.isArray(awinReview.decisions) || awinReview.decisions.length !== awinDrafts.products.length) {
  throw new Error("Every Awin draft needs exactly one Sol review decision");
}
if (!Array.isArray(awinInput.entries) || awinInput.entries.length !== awinDrafts.products.length) {
  throw new Error("Awin input, review and generated draft counts must match");
}
if (!Array.isArray(awinEditorial.entries) || awinEditorial.entries.length !== awinInput.entries.length) {
  throw new Error("Every Awin candidate needs an individual editorial draft");
}
const reviewedCandidates = new Set(awinReview.decisions.map((decision) => decision.candidate_id));
if (reviewedCandidates.size !== awinReview.decisions.length) throw new Error("Sol review candidate IDs must be unique");
const inputCandidates = new Set(awinInput.entries.map((entry) => entry.candidate_id));
const editorialCandidates = new Set(awinEditorial.entries.map((entry) => entry.candidate_id));
if (editorialCandidates.size !== awinEditorial.entries.length) throw new Error("Awin editorial candidate IDs must be unique");
for (const candidateId of reviewedCandidates) {
  if (!inputCandidates.has(candidateId)) throw new Error(`Sol review references unknown candidate ${candidateId}`);
  if (!editorialCandidates.has(candidateId)) throw new Error(`Luna editorial draft missing for ${candidateId}`);
}
if (awinReview.summary.data_verified + awinReview.summary.hold !== awinReview.summary.candidates) {
  throw new Error("Sol review summary counts do not add up");
}
const heldEntries = awinInput.entries.filter((entry) => entry.promotion_blocker);
const heldDecisions = awinReview.decisions.filter((decision) => decision.decision === "hold");
if (heldEntries.length !== awinReview.summary.hold || heldDecisions.length !== awinReview.summary.hold) {
  throw new Error("Awin promotion blockers and Sol hold decisions must match the review summary");
}
const manufacturerSourcedDrafts = awinDrafts.products.filter((product) =>
  product.sources.some((source) => source.type === "manufacturer"),
);
if (manufacturerSourcedDrafts.length !== awinReview.summary.manufacturer_or_own_brand_sources) {
  throw new Error("Awin manufacturer-source count does not match the Sol review summary");
}

if (awinPublication.schema_version !== 1 || awinPublication.review_model !== "sol") {
  throw new Error("Awin publication manifest needs a Sol-reviewed schema");
}
if (!Array.isArray(awinPublication.entries)) throw new Error("Awin publication manifest needs entries");
if (awinPublication.summary?.released_candidates !== awinPublication.entries.length
  || awinPublication.summary?.new_products + awinPublication.summary?.enriched_existing_products !== awinPublication.entries.length
  || awinPublication.summary?.held_candidates !== heldDecisions.length) {
  throw new Error("Awin publication summary is inconsistent");
}
const publicationCandidates = new Set(awinPublication.entries.map((entry) => entry.candidate_id));
const publicationProductIds = new Set(awinPublication.entries.map((entry) => entry.product_id));
if (publicationCandidates.size !== awinPublication.entries.length || publicationProductIds.size !== awinPublication.entries.length) {
  throw new Error("Awin publication candidate and product IDs must be unique");
}
const verifiedDecisions = awinReview.decisions.filter((decision) => decision.decision === "data-verified");
if (awinPublication.entries.length !== verifiedDecisions.length) {
  throw new Error("Awin publication manifest must contain every data-verified decision");
}

const draftById = new Map(awinDrafts.products.map((product) => [product.product_id, product]));
const editorialByCandidate = new Map(awinEditorial.entries.map((entry) => [entry.candidate_id, entry]));
const publicationDetails = new Set();
for (const entry of awinPublication.entries) {
  const decision = awinReview.decisions.find((candidate) => candidate.candidate_id === entry.candidate_id);
  const draft = draftById.get(entry.product_id);
  const editorial = editorialByCandidate.get(entry.candidate_id);
  const override = productEditorialOverrides.entries[entry.product_id];
  if (decision?.decision !== "data-verified") throw new Error(`${entry.candidate_id} is not cleared for publication`);
  if (!draft) throw new Error(`${entry.candidate_id} references missing draft ${entry.product_id}`);
  if (!publicIds.has(entry.product_id)) throw new Error(`${entry.product_id} is cleared but missing from the public catalog`);
  if (typeof entry.detail !== "string" || entry.detail.length < 180) throw new Error(`${entry.product_id} needs substantial individual detail copy`);
  if (publicationDetails.has(entry.detail)) throw new Error(`${entry.product_id} repeats another publication detail`);
  publicationDetails.add(entry.detail);
  if (!editorial?.summary || editorial.summary.length < 100) throw new Error(`${entry.product_id} needs an individual editorial summary`);
  if (override?.intro !== editorial.summary || override?.detail !== entry.detail) {
    throw new Error(`${entry.product_id} public editorial override does not match the reviewed publication copy`);
  }
}

for (const held of heldDecisions) {
  const candidate = awinInput.entries.find((entry) => entry.candidate_id === held.candidate_id);
  const leakedDraft = awinDrafts.products.find((product) => product.brand === candidate?.brand && product.model === candidate?.model);
  if (leakedDraft && publicIds.has(leakedDraft.product_id)) throw new Error(`Held candidate ${held.candidate_id} leaked into the public catalog`);
}
for (const productId of draftIds) {
  if (publicIds.has(productId) && !publicationProductIds.has(productId)) {
    throw new Error(`Unreleased Awin draft ${productId} exists in the public catalog`);
  }
}
for (const duplicateId of awinPublication.removed_duplicate_product_ids ?? []) {
  if (publicIds.has(duplicateId) || productEditorialOverrides.entries[duplicateId]) {
    throw new Error(`Removed duplicate ${duplicateId} still exists in public data`);
  }
}
if (awinReview.publication_gate.status !== "published"
  || awinReview.summary.public_catalog_change !== awinPublication.summary.new_products) {
  throw new Error("Awin publication gate and published product count are inconsistent");
}

console.log(`Product schema check passed: ${products.length} public records, ${awinPublication.entries.length} released Awin products and ${heldDecisions.length} held drafts`);
