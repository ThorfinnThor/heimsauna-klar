import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const DATA_FILES = {
  publication: "../../data/us/publication.json",
  products: "../../data/us/products.json",
  configurations: "../../data/us/configurations.json",
  sources: "../../data/us/sources.json",
  merchants: "../../data/us/merchants.json",
  programs: "../../data/us/programs.json",
  offers: "../../data/us/offers.json",
  mappings: "../../data/us/mappings.json",
};

const CONTENT_FILES = {
  navigation: "../../content/us/navigation.json",
  home: "../../content/us/home.json",
  affiliate: "../../content/us/affiliate.json",
  legal: "../../content/us/legal.json",
  pagePresentations: "../../content/us/page-presentations.json",
  editorial: "../../content/us/editorial.json",
  productEditorial: "../../content/us/product-editorial.json",
};

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PUBLICATION_STATUSES = new Set(["candidate", "draft", "reviewed", "published", "retired"]);
const SOURCE_TYPES = new Set([
  "manufacturer-page",
  "manual",
  "spec-sheet",
  "retailer-page",
  "affiliate-feed",
  "program-terms",
  "account-approval",
  "certification-record",
  "other",
]);
const AUTHORITATIVE_PRODUCT_SOURCE_TYPES = new Set(["manufacturer-page", "manual", "spec-sheet"]);
const EDITORIAL_PAGE_TYPES = new Set(["comparison", "brand", "guide"]);
const EDITORIAL_MODULES = new Set(["selection", "catalog", "sections", "sources", "related"]);
const TRUST_PAGE_SLUGS = new Set(["contact", "about", "methodology", "affiliate-disclosure", "privacy"]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function issue(issues, severity, path, message) {
  issues.push({ severity, path, message });
}

function requireObject(value, path, issues) {
  if (!isObject(value)) {
    issue(issues, "error", path, "must be an object");
    return false;
  }
  return true;
}

function requireArray(value, path, issues) {
  if (!Array.isArray(value)) {
    issue(issues, "error", path, "must be an array");
    return false;
  }
  return true;
}

function requireString(value, path, issues, { allowEmpty = false } = {}) {
  if (typeof value !== "string" || (!allowEmpty && value.trim().length === 0)) {
    issue(issues, "error", path, allowEmpty ? "must be a string" : "must be a non-empty string");
    return false;
  }
  return true;
}

function requireId(value, path, issues) {
  if (requireString(value, path, issues) && !ID_PATTERN.test(value)) {
    issue(issues, "error", path, "must use lowercase kebab-case");
    return false;
  }
  return typeof value === "string" && ID_PATTERN.test(value);
}

function requireDate(value, path, issues, { optional = false } = {}) {
  if (optional && value === undefined) return true;
  const parsed = typeof value === "string" && ISO_DATE_PATTERN.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : null;
  if (!parsed || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    issue(issues, "error", path, "must be a valid ISO date (YYYY-MM-DD)");
    return false;
  }
  return true;
}

function parseHttpsUrl(value, path, issues) {
  if (!requireString(value, path, issues)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      issue(issues, "error", path, "must use HTTPS");
      return null;
    }
    return url;
  } catch {
    issue(issues, "error", path, "must be an absolute URL");
    return null;
  }
}

function hostMatches(hostname, allowedHosts) {
  const normalized = hostname.toLowerCase();
  return allowedHosts.some((host) => {
    const allowed = String(host).toLowerCase();
    return normalized === allowed || normalized.endsWith(`.${allowed}`);
  });
}

function validateEnvelope(document, key, path, issues) {
  if (!requireObject(document, path, issues)) return [];
  if (document.schema_version !== 1) issue(issues, "error", `${path}.schema_version`, "must equal 1");
  if (document.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
  return requireArray(document[key], `${path}.${key}`, issues) ? document[key] : [];
}

function ensureUniqueIds(entries, path, issues) {
  const seen = new Set();
  for (const [index, entry] of entries.entries()) {
    const idPath = `${path}[${index}].id`;
    if (!requireObject(entry, `${path}[${index}]`, issues) || !requireId(entry.id, idPath, issues)) continue;
    if (seen.has(entry.id)) issue(issues, "error", idPath, `duplicates ${entry.id}`);
    seen.add(entry.id);
  }
  return seen;
}

function validateIdArray(value, path, issues) {
  if (!requireArray(value, path, issues)) return [];
  const result = [];
  const seen = new Set();
  for (const [index, id] of value.entries()) {
    if (requireId(id, `${path}[${index}]`, issues)) {
      if (seen.has(id)) issue(issues, "error", `${path}[${index}]`, `duplicates ${id}`);
      seen.add(id);
      result.push(id);
    }
  }
  return result;
}

function requireReferences(ids, knownIds, path, issues) {
  for (const [index, id] of ids.entries()) {
    if (!knownIds.has(id)) issue(issues, "error", `${path}[${index}]`, `references unknown ID ${id}`);
  }
}

function validateMeasurement(measurement, path, issues) {
  if (!requireObject(measurement, path, issues)) return;
  if (typeof measurement.value !== "number" || !Number.isFinite(measurement.value) || measurement.value <= 0) {
    issue(issues, "error", `${path}.value`, "must be a positive finite number");
  }
  if (!["in", "ft", "mm", "cm"].includes(measurement.unit)) {
    issue(issues, "error", `${path}.unit`, "must be in, ft, mm, or cm");
  }
}

function validateDimensions(dimensions, path, issues) {
  if (!requireObject(dimensions, path, issues)) return;
  for (const axis of ["width", "depth", "height"]) {
    validateMeasurement(dimensions[axis], `${path}.${axis}`, issues);
  }
}

function validateWeight(weight, path, issues) {
  if (!requireObject(weight, path, issues)) return;
  if (typeof weight.value !== "number" || !Number.isFinite(weight.value) || weight.value <= 0) {
    issue(issues, "error", `${path}.value`, "must be a positive finite number");
  }
  if (!["lb", "kg"].includes(weight.unit)) issue(issues, "error", `${path}.unit`, "must be lb or kg");
}

function validateFact(fact, path, evidenceIds, issues, validateValue = () => {}) {
  if (!requireObject(fact, path, issues)) return;
  if (fact.status === "documented") {
    const factEvidenceIds = validateIdArray(fact.evidence_ids, `${path}.evidence_ids`, issues);
    if (factEvidenceIds.length === 0) issue(issues, "error", `${path}.evidence_ids`, "needs at least one evidence reference");
    requireReferences(factEvidenceIds, evidenceIds, `${path}.evidence_ids`, issues);
    if (!("value" in fact)) issue(issues, "error", `${path}.value`, "is required for a documented fact");
    else validateValue(fact.value, `${path}.value`, issues);
    return;
  }
  if (fact.status === "unknown" || fact.status === "not-applicable") {
    requireString(fact.reason, `${path}.reason`, issues);
    return;
  }
  if (fact.status === "conflict") {
    const factEvidenceIds = validateIdArray(fact.evidence_ids, `${path}.evidence_ids`, issues);
    if (factEvidenceIds.length < 2) issue(issues, "error", `${path}.evidence_ids`, "needs at least two conflicting evidence references");
    requireReferences(factEvidenceIds, evidenceIds, `${path}.evidence_ids`, issues);
    requireString(fact.note, `${path}.note`, issues);
    return;
  }
  issue(issues, "error", `${path}.status`, "must be documented, unknown, not-applicable, or conflict");
}

function validateDocumentedEnum(values) {
  const allowed = new Set(values);
  return (value, path, issues) => {
    if (!allowed.has(value)) issue(issues, "error", path, `must be one of ${values.join(", ")}`);
  };
}

function validatePositiveNumber(value, path, issues) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    issue(issues, "error", path, "must be a positive finite number");
  }
}

function validatePositiveInteger(value, path, issues) {
  if (!Number.isInteger(value) || value <= 0) issue(issues, "error", path, "must be a positive integer");
}

function validateStringArray(value, path, issues, allowedValues) {
  if (!requireArray(value, path, issues)) return;
  if (value.length === 0) issue(issues, "error", path, "must not be empty");
  const seen = new Set();
  for (const [index, entry] of value.entries()) {
    if (!requireString(entry, `${path}[${index}]`, issues)) continue;
    if (allowedValues && !allowedValues.has(entry)) issue(issues, "error", `${path}[${index}]`, "has an unsupported value");
    if (seen.has(entry)) issue(issues, "error", `${path}[${index}]`, `duplicates ${entry}`);
    seen.add(entry);
  }
}

function validateEditorialSection(section, path, issues) {
  if (!requireObject(section, path, issues)) return;
  requireId(section.id, `${path}.id`, issues);
  requireString(section.heading, `${path}.heading`, issues);
  const paragraphs = requireArray(section.paragraphs, `${path}.paragraphs`, issues) ? section.paragraphs : [];
  for (const [index, paragraph] of paragraphs.entries()) requireString(paragraph, `${path}.paragraphs[${index}]`, issues);
  if (section.points !== undefined) validateStringArray(section.points, `${path}.points`, issues);
}

function validateEditorialContent(bundle, sourceIds, productIds, issues) {
  const presentations = requireArray(bundle.content?.pagePresentations?.entries, "content.pagePresentations.entries", issues)
    ? bundle.content.pagePresentations.entries
    : [];
  const presentationIds = ensureUniqueIds(presentations, "content.pagePresentations.entries", issues);
  const presentationById = new Map(presentations.map((entry) => [entry.id, entry]));
  for (const [index, presentation] of presentations.entries()) {
    const path = `content.pagePresentations.entries[${index}]`;
    if (!isObject(presentation)) continue;
    if (!EDITORIAL_PAGE_TYPES.has(presentation.page_type)) issue(issues, "error", `${path}.page_type`, "has an unsupported value");
    if (!['matrix', 'profile', 'briefing'].includes(presentation.layout)) issue(issues, "error", `${path}.layout`, "has an unsupported value");
    validateStringArray(presentation.module_order, `${path}.module_order`, issues, EDITORIAL_MODULES);
    if (new Set(presentation.module_order ?? []).size !== (presentation.module_order ?? []).length) {
      issue(issues, "error", `${path}.module_order`, "must not repeat a module");
    }
  }

  const entries = requireArray(bundle.content?.editorial?.entries, "content.editorial.entries", issues)
    ? bundle.content.editorial.entries
    : [];
  ensureUniqueIds(entries, "content.editorial.entries", issues);
  const routeKeys = new Set();
  for (const [index, page] of entries.entries()) {
    const path = `content.editorial.entries[${index}]`;
    if (!isObject(page)) continue;
    if (!EDITORIAL_PAGE_TYPES.has(page.page_type)) issue(issues, "error", `${path}.page_type`, "has an unsupported value");
    requireId(page.slug, `${path}.slug`, issues);
    const routeKey = `${page.page_type}:${page.slug}`;
    if (routeKeys.has(routeKey)) issue(issues, "error", `${path}.slug`, `duplicates route ${routeKey}`);
    routeKeys.add(routeKey);
    if (!PUBLICATION_STATUSES.has(page.publication_status)) issue(issues, "error", `${path}.publication_status`, "has an unsupported value");
    for (const field of ["title", "description", "eyebrow", "heading"]) requireString(page[field], `${path}.${field}`, issues);
    const introduction = requireArray(page.introduction, `${path}.introduction`, issues) ? page.introduction : [];
    for (const [paragraphIndex, paragraph] of introduction.entries()) requireString(paragraph, `${path}.introduction[${paragraphIndex}]`, issues);
    const sections = requireArray(page.sections, `${path}.sections`, issues) ? page.sections : [];
    ensureUniqueIds(sections, `${path}.sections`, issues);
    for (const [sectionIndex, section] of sections.entries()) validateEditorialSection(section, `${path}.sections[${sectionIndex}]`, issues);
    const pageSourceIds = validateIdArray(page.source_ids, `${path}.source_ids`, issues);
    requireReferences(pageSourceIds, sourceIds, `${path}.source_ids`, issues);
    const relatedPaths = requireArray(page.related_paths, `${path}.related_paths`, issues) ? page.related_paths : [];
    for (const [relatedIndex, relatedPath] of relatedPaths.entries()) {
      if (!requireString(relatedPath, `${path}.related_paths[${relatedIndex}]`, issues)) continue;
      if (!/^\/us\/(?:[a-z0-9-]+\/)+$/.test(relatedPath)) issue(issues, "error", `${path}.related_paths[${relatedIndex}]`, "must be a clean trailing-slash US path");
    }
    if (!requireId(page.presentation_id, `${path}.presentation_id`, issues) || !presentationIds.has(page.presentation_id)) {
      issue(issues, "error", `${path}.presentation_id`, "references an unknown presentation");
    } else if (presentationById.get(page.presentation_id)?.page_type !== page.page_type) {
      issue(issues, "error", `${path}.presentation_id`, "belongs to another page type");
    }

    if (page.page_type === "comparison") {
      if (!requireObject(page.selection, `${path}.selection`, issues)) continue;
      const productSelection = page.selection.product_ids === undefined ? [] : validateIdArray(page.selection.product_ids, `${path}.selection.product_ids`, issues);
      requireReferences(productSelection, productIds, `${path}.selection.product_ids`, issues);
      if (page.selection.product_types !== undefined) validateStringArray(page.selection.product_types, `${path}.selection.product_types`, issues, new Set(["sauna-cabin", "sauna-kit", "sauna-tent", "sauna-blanket", "heater", "accessory"]));
      if (page.selection.heat_types !== undefined) validateStringArray(page.selection.heat_types, `${path}.selection.heat_types`, issues, new Set(["traditional", "infrared", "hybrid", "not-applicable"]));
      if (page.selection.placements !== undefined) validateStringArray(page.selection.placements, `${path}.selection.placements`, issues, new Set(["indoor", "outdoor"]));
      if (page.selection.brands !== undefined) validateStringArray(page.selection.brands, `${path}.selection.brands`, issues);
      if (page.selection.voltages_v !== undefined && requireArray(page.selection.voltages_v, `${path}.selection.voltages_v`, issues)) {
        for (const [voltageIndex, voltage] of page.selection.voltages_v.entries()) {
          if (typeof voltage !== "number" || !Number.isFinite(voltage) || voltage <= 0) issue(issues, "error", `${path}.selection.voltages_v[${voltageIndex}]`, "must be a positive finite number");
        }
      }
      if (page.selection.minimum_seated_capacity !== undefined && (!Number.isInteger(page.selection.minimum_seated_capacity) || page.selection.minimum_seated_capacity <= 0)) {
        issue(issues, "error", `${path}.selection.minimum_seated_capacity`, "must be a positive integer");
      }
      const criteria = ["product_ids", "product_types", "heat_types", "placements", "brands", "voltages_v"]
        .some((field) => Array.isArray(page.selection[field]) && page.selection[field].length > 0)
        || page.selection.minimum_seated_capacity !== undefined;
      if (!criteria) issue(issues, "error", `${path}.selection`, "needs at least one explicit comparison criterion");
    } else if (page.page_type === "brand") {
      requireString(page.brand_name, `${path}.brand_name`, issues);
    } else if (page.page_type === "guide" && page.linked_product_ids !== undefined) {
      const linked = validateIdArray(page.linked_product_ids, `${path}.linked_product_ids`, issues);
      requireReferences(linked, productIds, `${path}.linked_product_ids`, issues);
    }

    if (["reviewed", "published"].includes(page.publication_status)) {
      if (introduction.length === 0) issue(issues, "error", `${path}.introduction`, "reviewed content needs an introduction");
      if (sections.length === 0) issue(issues, "error", `${path}.sections`, "reviewed content needs at least one substantive section");
      if (pageSourceIds.length === 0) issue(issues, "error", `${path}.source_ids`, "reviewed content needs at least one source");
    }
  }

  const productEditorialDocument = bundle.content?.productEditorial;
  const productEditorial = productEditorialDocument === undefined
    ? []
    : requireArray(productEditorialDocument.entries, "content.productEditorial.entries", issues)
      ? productEditorialDocument.entries
      : [];
  ensureUniqueIds(productEditorial, "content.productEditorial.entries", issues);
  const productEditorialProductIds = new Set();
  for (const [index, entry] of productEditorial.entries()) {
    const path = `content.productEditorial.entries[${index}]`;
    if (!isObject(entry)) continue;
    if (!PUBLICATION_STATUSES.has(entry.status)) issue(issues, "error", `${path}.status`, "has an unsupported value");
    requireId(entry.product_id, `${path}.product_id`, issues);
    if (!productIds.has(entry.product_id)) issue(issues, "error", `${path}.product_id`, `references unknown ID ${entry.product_id}`);
    if (productEditorialProductIds.has(entry.product_id)) issue(issues, "error", `${path}.product_id`, `duplicates ${entry.product_id}`);
    productEditorialProductIds.add(entry.product_id);
    for (const field of ["eyebrow", "heading", "summary"]) requireString(entry[field], `${path}.${field}`, issues);
    if (typeof entry.summary === "string" && entry.summary.length > 160) issue(issues, "error", `${path}.summary`, "must not exceed 160 characters");
    for (const field of ["paragraphs", "decision_points", "limitations"]) {
      const values = requireArray(entry[field], `${path}.${field}`, issues) ? entry[field] : [];
      if (values.length === 0) issue(issues, "error", `${path}.${field}`, "must not be empty");
      for (const [valueIndex, value] of values.entries()) requireString(value, `${path}.${field}[${valueIndex}]`, issues);
    }
    const entrySourceIds = validateIdArray(entry.source_ids, `${path}.source_ids`, issues);
    requireReferences(entrySourceIds, sourceIds, `${path}.source_ids`, issues);
    if (entrySourceIds.length === 0) issue(issues, "error", `${path}.source_ids`, "needs at least one source");
  }

  const home = bundle.content?.home;
  const homePath = "content.home";
  if (!isObject(home)) {
    issue(issues, "error", homePath, "must be an object");
  } else {
    for (const field of ["title", "description", "eyebrow", "heading"]) requireString(home[field], `${homePath}.${field}`, issues);
    const introduction = requireArray(home.introduction, `${homePath}.introduction`, issues) ? home.introduction : [];
    for (const [index, paragraph] of introduction.entries()) requireString(paragraph, `${homePath}.introduction[${index}]`, issues);
    const sections = requireArray(home.sections, `${homePath}.sections`, issues) ? home.sections : [];
    if (sections.length === 0) issue(issues, "error", `${homePath}.sections`, "needs at least one substantive section");
    ensureUniqueIds(sections, `${homePath}.sections`, issues);
    for (const [index, section] of sections.entries()) validateEditorialSection(section, `${homePath}.sections[${index}]`, issues);
    const homeSourceIds = validateIdArray(home.source_ids, `${homePath}.source_ids`, issues);
    requireReferences(homeSourceIds, sourceIds, `${homePath}.source_ids`, issues);
    if (homeSourceIds.length === 0) issue(issues, "error", `${homePath}.source_ids`, "needs at least one source");
    const relatedPaths = requireArray(home.related_paths, `${homePath}.related_paths`, issues) ? home.related_paths : [];
    for (const [index, relatedPath] of relatedPaths.entries()) {
      if (!requireString(relatedPath, `${homePath}.related_paths[${index}]`, issues)) continue;
      if (!/^\/us\/(?:[a-z0-9-]+\/)+$/.test(relatedPath)) issue(issues, "error", `${homePath}.related_paths[${index}]`, "must be a clean trailing-slash US path");
    }
  }

  const trustPages = requireArray(bundle.content?.legal?.pages, "content.legal.pages", issues) ? bundle.content.legal.pages : [];
  ensureUniqueIds(trustPages, "content.legal.pages", issues);
  const trustSlugs = new Set();
  for (const [index, page] of trustPages.entries()) {
    const path = `content.legal.pages[${index}]`;
    if (!isObject(page)) continue;
    if (!TRUST_PAGE_SLUGS.has(page.slug)) issue(issues, "error", `${path}.slug`, "has an unsupported trust-page slug");
    if (trustSlugs.has(page.slug)) issue(issues, "error", `${path}.slug`, `duplicates ${page.slug}`);
    trustSlugs.add(page.slug);
    if (!PUBLICATION_STATUSES.has(page.publication_status)) issue(issues, "error", `${path}.publication_status`, "has an unsupported value");
    for (const field of ["title", "description", "eyebrow", "heading"]) requireString(page[field], `${path}.${field}`, issues);
    const introduction = requireArray(page.introduction, `${path}.introduction`, issues) ? page.introduction : [];
    for (const [paragraphIndex, paragraph] of introduction.entries()) requireString(paragraph, `${path}.introduction[${paragraphIndex}]`, issues);
    const sections = requireArray(page.sections, `${path}.sections`, issues) ? page.sections : [];
    ensureUniqueIds(sections, `${path}.sections`, issues);
    for (const [sectionIndex, section] of sections.entries()) validateEditorialSection(section, `${path}.sections[${sectionIndex}]`, issues);
    if (page.contact_email !== undefined && (typeof page.contact_email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(page.contact_email))) {
      issue(issues, "error", `${path}.contact_email`, "must be a valid email address");
    }
    if (["reviewed", "published"].includes(page.publication_status) && (introduction.length === 0 || sections.length === 0)) {
      issue(issues, "error", path, "reviewed trust content needs an introduction and at least one section");
    }
  }
}

function validateSourceDocuments(bundle, issues) {
  const sources = validateEnvelope(bundle.sources, "sources", "sources", issues);
  const evidence = requireArray(bundle.sources?.evidence, "sources.evidence", issues) ? bundle.sources.evidence : [];
  const sourceIds = ensureUniqueIds(sources, "sources.sources", issues);
  const evidenceIds = ensureUniqueIds(evidence, "sources.evidence", issues);

  for (const [index, source] of sources.entries()) {
    const path = `sources.sources[${index}]`;
    if (!isObject(source)) continue;
    if (!SOURCE_TYPES.has(source.type)) issue(issues, "error", `${path}.type`, "has an unsupported source type");
    parseHttpsUrl(source.url, `${path}.url`, issues);
    requireString(source.title, `${path}.title`, issues);
    requireString(source.publisher, `${path}.publisher`, issues);
    if (!["US", "global"].includes(source.market)) issue(issues, "error", `${path}.market`, "must be US or global");
    requireDate(source.checked_at, `${path}.checked_at`, issues);
  }

  return { sources, evidence, sourceIds, evidenceIds };
}

export function auditUsBundle(bundle) {
  const issues = [];
  if (!requireObject(bundle, "bundle", issues)) return issues;

  const { sources, evidence, sourceIds, evidenceIds } = validateSourceDocuments(bundle, issues);
  const products = validateEnvelope(bundle.products, "products", "products", issues);
  const configurations = validateEnvelope(bundle.configurations, "configurations", "configurations", issues);
  const certifications = requireArray(bundle.configurations?.certifications, "configurations.certifications", issues)
    ? bundle.configurations.certifications
    : [];
  const warranties = requireArray(bundle.configurations?.warranties, "configurations.warranties", issues)
    ? bundle.configurations.warranties
    : [];
  const merchants = validateEnvelope(bundle.merchants, "merchants", "merchants", issues);
  const programs = validateEnvelope(bundle.programs, "programs", "programs", issues);
  const offers = validateEnvelope(bundle.offers, "offers", "offers", issues);
  const mappings = validateEnvelope(bundle.mappings, "mappings", "mappings", issues);

  const productIds = ensureUniqueIds(products, "products.products", issues);
  const configurationIds = ensureUniqueIds(configurations, "configurations.configurations", issues);
  const certificationIds = ensureUniqueIds(certifications, "configurations.certifications", issues);
  const warrantyIds = ensureUniqueIds(warranties, "configurations.warranties", issues);
  const merchantIds = ensureUniqueIds(merchants, "merchants.merchants", issues);
  const programIds = ensureUniqueIds(programs, "programs.programs", issues);
  const offerIds = ensureUniqueIds(offers, "offers.offers", issues);
  const mappingIds = ensureUniqueIds(mappings, "mappings.mappings", issues);

  const allEntityIds = new Set([
    ...productIds,
    ...configurationIds,
    ...certificationIds,
    ...warrantyIds,
    ...merchantIds,
    ...programIds,
    ...offerIds,
    ...mappingIds,
  ]);
  for (const [index, entry] of evidence.entries()) {
    const path = `sources.evidence[${index}]`;
    if (!isObject(entry)) continue;
    requireId(entry.entity_id, `${path}.entity_id`, issues);
    requireId(entry.source_id, `${path}.source_id`, issues);
    requireString(entry.field_path, `${path}.field_path`, issues);
    if (!allEntityIds.has(entry.entity_id)) issue(issues, "error", `${path}.entity_id`, `references unknown entity ${entry.entity_id}`);
    if (!sourceIds.has(entry.source_id)) issue(issues, "error", `${path}.source_id`, `references unknown source ${entry.source_id}`);
  }

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const productById = new Map(products.map((product) => [product.id, product]));
  const configurationById = new Map(configurations.map((configuration) => [configuration.id, configuration]));
  const merchantById = new Map(merchants.map((merchant) => [merchant.id, merchant]));
  const programById = new Map(programs.map((program) => [program.id, program]));
  const componentIdsByConfigurationId = new Map();

  const slugs = new Set();
  for (const [index, product] of products.entries()) {
    const path = `products.products[${index}]`;
    if (!isObject(product)) continue;
    if (product.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
    if (!requireId(product.slug, `${path}.slug`, issues) || slugs.has(product.slug)) {
      if (slugs.has(product.slug)) issue(issues, "error", `${path}.slug`, `duplicates ${product.slug}`);
    }
    slugs.add(product.slug);
    requireString(product.brand_name, `${path}.brand_name`, issues);
    requireString(product.model, `${path}.model`, issues);
    validateFact(product.product_type, `${path}.product_type`, evidenceIds, issues,
      validateDocumentedEnum(["sauna-cabin", "sauna-kit", "sauna-tent", "sauna-blanket", "heater", "accessory"]));
    validateFact(product.heat_type, `${path}.heat_type`, evidenceIds, issues,
      validateDocumentedEnum(["traditional", "infrared", "hybrid", "not-applicable"]));
    validateFact(product.energy_sources, `${path}.energy_sources`, evidenceIds, issues,
      (value, valuePath, target) => validateStringArray(value, valuePath, target, new Set(["electric", "wood", "other"])));
    validateFact(product.placements, `${path}.placements`, evidenceIds, issues,
      (value, valuePath, target) => validateStringArray(value, valuePath, target, new Set(["indoor", "outdoor"])));
    validateFact(product.form, `${path}.form`, evidenceIds, issues, requireString);
    const productConfigurationIds = validateIdArray(product.configuration_ids, `${path}.configuration_ids`, issues);
    const productSourceIds = validateIdArray(product.source_ids, `${path}.source_ids`, issues);
    requireReferences(productConfigurationIds, configurationIds, `${path}.configuration_ids`, issues);
    requireReferences(productSourceIds, sourceIds, `${path}.source_ids`, issues);
    if (!PUBLICATION_STATUSES.has(product.publication_status)) issue(issues, "error", `${path}.publication_status`, "has an unsupported value");
    requireString(product.change_reason, `${path}.change_reason`, issues);
    for (const key of ["spec_checked_at", "content_updated_at", "next_review_at"]) {
      requireDate(product[key], `${path}.${key}`, issues, { optional: true });
    }
    if (["reviewed", "published"].includes(product.publication_status)) {
      if (productConfigurationIds.length === 0) issue(issues, "error", `${path}.configuration_ids`, "a reviewed product needs a configuration");
      const hasAuthoritativeSource = productSourceIds.some((id) => AUTHORITATIVE_PRODUCT_SOURCE_TYPES.has(sourceById.get(id)?.type));
      if (!hasAuthoritativeSource) issue(issues, "error", `${path}.source_ids`, "a reviewed product needs a manufacturer page, manual, or spec sheet");
    }
  }

  for (const [index, configuration] of configurations.entries()) {
    const path = `configurations.configurations[${index}]`;
    if (!isObject(configuration)) continue;
    if (configuration.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
    requireId(configuration.product_id, `${path}.product_id`, issues);
    if (!productIds.has(configuration.product_id)) issue(issues, "error", `${path}.product_id`, `references unknown product ${configuration.product_id}`);
    requireString(configuration.label, `${path}.label`, issues);
    validateFact(configuration.manufacturer_sku, `${path}.manufacturer_sku`, evidenceIds, issues, requireString);
    if (!requireObject(configuration.capacity, `${path}.capacity`, issues)) continue;
    validateFact(configuration.capacity.seated, `${path}.capacity.seated`, evidenceIds, issues, validatePositiveInteger);
    validateFact(configuration.capacity.reclining, `${path}.capacity.reclining`, evidenceIds, issues, validatePositiveInteger);
    if (requireObject(configuration.dimensions, `${path}.dimensions`, issues)) {
      validateFact(configuration.dimensions.exterior, `${path}.dimensions.exterior`, evidenceIds, issues, validateDimensions);
      validateFact(configuration.dimensions.interior, `${path}.dimensions.interior`, evidenceIds, issues, validateDimensions);
      validateFact(configuration.dimensions.shipping, `${path}.dimensions.shipping`, evidenceIds, issues, validateDimensions);
      validateFact(configuration.dimensions.minimum_clearances, `${path}.dimensions.minimum_clearances`, evidenceIds, issues,
        (value, valuePath, target) => {
          if (!requireObject(value, valuePath, target)) return;
          for (const [side, measurement] of Object.entries(value)) validateMeasurement(measurement, `${valuePath}.${side}`, target);
        });
    }
    validateFact(configuration.net_weight, `${path}.net_weight`, evidenceIds, issues, validateWeight);
    validateFact(configuration.shipping_weight, `${path}.shipping_weight`, evidenceIds, issues, validateWeight);
    validateFact(configuration.materials, `${path}.materials`, evidenceIds, issues,
      (value, valuePath, target) => validateStringArray(value, valuePath, target));

    const components = requireArray(configuration.components, `${path}.components`, issues) ? configuration.components : [];
    const componentIds = ensureUniqueIds(components, `${path}.components`, issues);
    for (const [componentIndex, component] of components.entries()) {
      const componentPath = `${path}.components[${componentIndex}]`;
      if (!isObject(component)) continue;
      if (!["cabin", "heater", "infrared-system", "controls", "lighting", "stones", "wiring", "chimney", "other"].includes(component.component_type)) {
        issue(issues, "error", `${componentPath}.component_type`, "has an unsupported value");
      }
      requireString(component.name, `${componentPath}.name`, issues);
      if (!["included", "excluded", "unknown"].includes(component.inclusion)) issue(issues, "error", `${componentPath}.inclusion`, "has an unsupported value");
      const componentEvidenceIds = validateIdArray(component.evidence_ids, `${componentPath}.evidence_ids`, issues);
      requireReferences(componentEvidenceIds, evidenceIds, `${componentPath}.evidence_ids`, issues);
      if (component.inclusion !== "unknown" && componentEvidenceIds.length === 0) issue(issues, "error", `${componentPath}.evidence_ids`, "documented inclusion needs evidence");
    }

    const supplyOptions = requireArray(configuration.electrical_supply_options, `${path}.electrical_supply_options`, issues)
      ? configuration.electrical_supply_options
      : [];
    ensureUniqueIds(supplyOptions, `${path}.electrical_supply_options`, issues);
    for (const [optionIndex, option] of supplyOptions.entries()) {
      const optionPath = `${path}.electrical_supply_options[${optionIndex}]`;
      if (!isObject(option)) continue;
      const optionEvidenceIds = validateIdArray(option.evidence_ids, `${optionPath}.evidence_ids`, issues);
      requireReferences(optionEvidenceIds, evidenceIds, `${optionPath}.evidence_ids`, issues);
      const requirements = requireArray(option.requirements, `${optionPath}.requirements`, issues) ? option.requirements : [];
      if (requirements.length === 0) issue(issues, "error", `${optionPath}.requirements`, "needs at least one requirement");
      for (const [requirementIndex, requirement] of requirements.entries()) {
        const requirementPath = `${optionPath}.requirements[${requirementIndex}]`;
        if (!requireObject(requirement, requirementPath, issues)) continue;
        if (!["heater", "infrared-system", "controls-lighting", "other"].includes(requirement.component)) {
          issue(issues, "error", `${requirementPath}.component`, "has an unsupported value");
        }
        validateFact(requirement.voltage_v, `${requirementPath}.voltage_v`, evidenceIds, issues, validatePositiveNumber);
        validateFact(requirement.frequency_hz, `${requirementPath}.frequency_hz`, evidenceIds, issues, validatePositiveNumber);
        validateFact(requirement.phase, `${requirementPath}.phase`, evidenceIds, issues, validateDocumentedEnum([1, 3]));
        validateFact(requirement.rated_power_w, `${requirementPath}.rated_power_w`, evidenceIds, issues, validatePositiveNumber);
        validateFact(requirement.rated_current_a, `${requirementPath}.rated_current_a`, evidenceIds, issues, validatePositiveNumber);
        validateFact(requirement.required_circuit_a, `${requirementPath}.required_circuit_a`, evidenceIds, issues, validatePositiveNumber);
        validateFact(requirement.specified_breaker_a, `${requirementPath}.specified_breaker_a`, evidenceIds, issues, validatePositiveNumber);
        validateFact(requirement.connection, `${requirementPath}.connection`, evidenceIds, issues, validateDocumentedEnum(["plug-in", "hardwired"]));
        validateFact(requirement.plug_type, `${requirementPath}.plug_type`, evidenceIds, issues, requireString);
        validateFact(requirement.dedicated_circuit, `${requirementPath}.dedicated_circuit`, evidenceIds, issues,
          (value, valuePath, target) => {
            if (typeof value !== "boolean") issue(target, "error", valuePath, "must be a boolean");
          });
      }
    }

    const configCertificationIds = validateIdArray(configuration.certification_ids, `${path}.certification_ids`, issues);
    const configWarrantyIds = validateIdArray(configuration.warranty_ids, `${path}.warranty_ids`, issues);
    const configSourceIds = validateIdArray(configuration.source_ids, `${path}.source_ids`, issues);
    requireReferences(configCertificationIds, certificationIds, `${path}.certification_ids`, issues);
    requireReferences(configWarrantyIds, warrantyIds, `${path}.warranty_ids`, issues);
    requireReferences(configSourceIds, sourceIds, `${path}.source_ids`, issues);
    if (!PUBLICATION_STATUSES.has(configuration.publication_status)) issue(issues, "error", `${path}.publication_status`, "has an unsupported value");

    const owningProduct = productById.get(configuration.product_id);
    if (owningProduct && !owningProduct.configuration_ids?.includes(configuration.id)) {
      issue(issues, "error", path, `product ${configuration.product_id} does not list configuration ${configuration.id}`);
    }
    if (["reviewed", "published"].includes(owningProduct?.publication_status) && !["reviewed", "published"].includes(configuration.publication_status)) {
      issue(issues, "error", `${path}.publication_status`, "must be reviewed or published when its product is reviewed or published");
    }
    componentIdsByConfigurationId.set(configuration.id, componentIds);
  }

  for (const [collectionName, entries] of [["certifications", certifications], ["warranties", warranties]]) {
    for (const [index, entry] of entries.entries()) {
      const path = `configurations.${collectionName}[${index}]`;
      if (!isObject(entry)) continue;
      if (entry.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
      requireId(entry.configuration_id, `${path}.configuration_id`, issues);
      if (!configurationIds.has(entry.configuration_id)) issue(issues, "error", `${path}.configuration_id`, `references unknown configuration ${entry.configuration_id}`);
      const entrySourceIds = validateIdArray(entry.source_ids, `${path}.source_ids`, issues);
      requireReferences(entrySourceIds, sourceIds, `${path}.source_ids`, issues);
      if (entrySourceIds.length === 0) issue(issues, "error", `${path}.source_ids`, "needs at least one source");
      if (collectionName === "certifications") {
        requireString(entry.label, `${path}.label`, issues);
        if (!["complete-product", "heater", "control", "component"].includes(entry.scope)) issue(issues, "error", `${path}.scope`, "has an unsupported value");
      } else {
        requireString(entry.provider, `${path}.provider`, issues);
        requireString(entry.summary, `${path}.summary`, issues);
      }
    }
  }

  for (const [index, merchant] of merchants.entries()) {
    const path = `merchants.merchants[${index}]`;
    if (!isObject(merchant)) continue;
    if (merchant.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
    requireString(merchant.name, `${path}.name`, issues);
    if (!["manufacturer", "retailer", "marketplace"].includes(merchant.kind)) issue(issues, "error", `${path}.kind`, "has an unsupported value");
    if (!["candidate", "active", "inactive", "retired"].includes(merchant.status)) issue(issues, "error", `${path}.status`, "has an unsupported value");
    if (requireArray(merchant.allowed_hosts, `${path}.allowed_hosts`, issues)) {
      for (const [hostIndex, host] of merchant.allowed_hosts.entries()) {
        if (!requireString(host, `${path}.allowed_hosts[${hostIndex}]`, issues)) continue;
        if (host.includes("://") || host.includes("/")) issue(issues, "error", `${path}.allowed_hosts[${hostIndex}]`, "must be a bare hostname");
      }
    }
  }

  for (const [index, program] of programs.entries()) {
    const path = `programs.programs[${index}]`;
    if (!isObject(program)) continue;
    if (program.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
    requireId(program.merchant_id, `${path}.merchant_id`, issues);
    if (!merchantIds.has(program.merchant_id)) issue(issues, "error", `${path}.merchant_id`, `references unknown merchant ${program.merchant_id}`);
    if (!["Awin", "direct", "other"].includes(program.network)) issue(issues, "error", `${path}.network`, "has an unsupported value");
    if (!["needs-account-check", "pending", "approved", "declined", "suspended"].includes(program.relationship_status)) {
      issue(issues, "error", `${path}.relationship_status`, "has an unsupported value");
    }
    const allowedPromotionTypes = requireArray(program.allowed_promotion_types, `${path}.allowed_promotion_types`, issues)
      ? program.allowed_promotion_types
      : [];
    const programTrackingHosts = requireArray(program.tracking_hosts, `${path}.tracking_hosts`, issues)
      ? program.tracking_hosts
      : [];
    for (const [hostIndex, host] of programTrackingHosts.entries()) {
      if (!requireString(host, `${path}.tracking_hosts[${hostIndex}]`, issues)) continue;
      if (host.includes("://") || host.includes("/")) issue(issues, "error", `${path}.tracking_hosts[${hostIndex}]`, "must be a bare hostname");
    }
    if (!["yes", "no", "unknown"].includes(program.deeplink_capable)) issue(issues, "error", `${path}.deeplink_capable`, "has an unsupported value");
    if (!["yes", "no", "unknown"].includes(program.feed_capable)) issue(issues, "error", `${path}.feed_capable`, "has an unsupported value");
    requireDate(program.terms_checked_at, `${path}.terms_checked_at`, issues, { optional: true });
    const programSourceIds = validateIdArray(program.source_ids, `${path}.source_ids`, issues);
    requireReferences(programSourceIds, sourceIds, `${path}.source_ids`, issues);
    if (program.relationship_status === "approved") {
      const merchant = merchantById.get(program.merchant_id);
      const hasAccountApproval = programSourceIds.some((id) => sourceById.get(id)?.type === "account-approval");
      if (!hasAccountApproval) issue(issues, "error", `${path}.source_ids`, "an approved relationship needs account-approval evidence");
      if (!program.terms_checked_at) issue(issues, "error", `${path}.terms_checked_at`, "is required for an approved relationship");
      if (allowedPromotionTypes.length === 0) issue(issues, "error", `${path}.allowed_promotion_types`, "must document at least one allowed promotion type");
      if (programTrackingHosts.length === 0) issue(issues, "error", `${path}.tracking_hosts`, "must document at least one approved tracking host");
      if (merchant?.status !== "active") issue(issues, "error", `${path}.merchant_id`, "an approved relationship needs an active merchant");
    }
  }

  for (const [index, offer] of offers.entries()) {
    const path = `offers.offers[${index}]`;
    if (!isObject(offer)) continue;
    if (offer.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
    for (const [field, knownIds] of [
      ["market_product_id", productIds],
      ["configuration_id", configurationIds],
      ["merchant_id", merchantIds],
    ]) {
      requireId(offer[field], `${path}.${field}`, issues);
      if (!knownIds.has(offer[field])) issue(issues, "error", `${path}.${field}`, `references unknown ID ${offer[field]}`);
    }
    const configuration = configurationById.get(offer.configuration_id);
    if (configuration && configuration.product_id !== offer.market_product_id) {
      issue(issues, "error", `${path}.configuration_id`, "belongs to a different product");
    }
    const merchant = merchantById.get(offer.merchant_id);
    const destinationUrl = parseHttpsUrl(offer.destination_url, `${path}.destination_url`, issues);
    if (destinationUrl && merchant && !hostMatches(destinationUrl.hostname, merchant.allowed_hosts ?? [])) {
      issue(issues, "error", `${path}.destination_url`, `host is not allowed for merchant ${merchant.id}`);
    }
    if (!["fixed-price", "from-price", "quote-only"].includes(offer.offer_type)) issue(issues, "error", `${path}.offer_type`, "has an unsupported value");
    if (offer.offer_type === "quote-only" && offer.price !== undefined) issue(issues, "error", `${path}.price`, "quote-only offers must not contain a price");
    if (["fixed-price", "from-price"].includes(offer.offer_type)) {
      if (!requireObject(offer.price, `${path}.price`, issues)) {
        // requireObject records the error.
      } else {
        if (!Number.isInteger(offer.price.amount_minor) || offer.price.amount_minor <= 0) issue(issues, "error", `${path}.price.amount_minor`, "must be a positive integer");
        if (offer.price.currency !== "USD") issue(issues, "error", `${path}.price.currency`, "US offers must use USD");
      }
    }
    if (!["sauna-kit", "configured-sauna-package", "accessory-only"].includes(offer.price_scope)) issue(issues, "error", `${path}.price_scope`, "has an unsupported value");
    const included = validateIdArray(offer.included_component_ids, `${path}.included_component_ids`, issues);
    const excluded = validateIdArray(offer.excluded_required_components, `${path}.excluded_required_components`, issues);
    const componentIds = componentIdsByConfigurationId.get(offer.configuration_id) ?? new Set();
    requireReferences(included, componentIds, `${path}.included_component_ids`, issues);
    requireReferences(excluded, componentIds, `${path}.excluded_required_components`, issues);
    if (!["documented", "incomplete", "unknown"].includes(offer.completeness)) issue(issues, "error", `${path}.completeness`, "has an unsupported value");
    if (!["new", "used", "refurbished", "unknown"].includes(offer.condition)) issue(issues, "error", `${path}.condition`, "has an unsupported value");
    if (!["in-stock", "out-of-stock", "preorder", "made-to-order", "discontinued", "unknown"].includes(offer.availability)) issue(issues, "error", `${path}.availability`, "has an unsupported value");
    if (!["included", "excluded", "calculated-by-merchant", "unknown"].includes(offer.tax_treatment)) issue(issues, "error", `${path}.tax_treatment`, "has an unsupported value");
    requireArray(offer.delivery_region_ids, `${path}.delivery_region_ids`, issues);
    const shippingEvidenceIds = validateIdArray(offer.shipping_evidence_ids, `${path}.shipping_evidence_ids`, issues);
    requireReferences(shippingEvidenceIds, evidenceIds, `${path}.shipping_evidence_ids`, issues);
    requireDate(offer.last_successfully_checked_at, `${path}.last_successfully_checked_at`, issues);
    requireDate(offer.last_attempted_at, `${path}.last_attempted_at`, issues, { optional: true });
    if (!["manual", "awin-feed", "merchant-api"].includes(offer.verification_method)) issue(issues, "error", `${path}.verification_method`, "has an unsupported value");
    if (!["inactive", "eligible", "blocked"].includes(offer.promotion_status)) issue(issues, "error", `${path}.promotion_status`, "has an unsupported value");

    const program = offer.program_id ? programById.get(offer.program_id) : undefined;
    if (offer.program_id && !program) issue(issues, "error", `${path}.program_id`, `references unknown program ${offer.program_id}`);
    if (program && program.merchant_id !== offer.merchant_id) issue(issues, "error", `${path}.program_id`, "belongs to a different merchant");
    if (offer.promotion_status === "eligible" && (!program || program.relationship_status !== "approved")) {
      issue(issues, "error", `${path}.promotion_status`, "eligible offers need an approved program relationship");
    }
    if (offer.promotion_status === "eligible" && offer.affiliate_url === undefined) {
      issue(issues, "error", `${path}.affiliate_url`, "is required for an eligible offer");
    }
    if (offer.affiliate_url !== undefined) {
      const affiliateUrl = parseHttpsUrl(offer.affiliate_url, `${path}.affiliate_url`, issues);
      if (!program || program.relationship_status !== "approved") issue(issues, "error", `${path}.affiliate_url`, "needs an approved program relationship");
      if (affiliateUrl && program && !hostMatches(affiliateUrl.hostname, program.tracking_hosts ?? [])) {
        issue(issues, "error", `${path}.affiliate_url`, `host is not allowed for program ${program.id}`);
      }
      if (affiliateUrl && program?.network === "Awin") {
        const advertiserId = affiliateUrl.searchParams.get("awinmid") ?? affiliateUrl.searchParams.get("m");
        const publisherId = affiliateUrl.searchParams.get("awinaffid") ?? affiliateUrl.searchParams.get("a");
        if (!program.advertiser_id || advertiserId !== program.advertiser_id) {
          issue(issues, "error", `${path}.affiliate_url`, "does not contain the approved Awin advertiser ID");
        }
        if (!publisherId) issue(issues, "error", `${path}.affiliate_url`, "does not contain an Awin publisher ID");
      }
    }
  }

  for (const [index, mapping] of mappings.entries()) {
    const path = `mappings.mappings[${index}]`;
    if (!isObject(mapping)) continue;
    if (mapping.market !== "US") issue(issues, "error", `${path}.market`, "must equal US");
    for (const [field, knownIds] of [["merchant_id", merchantIds], ["configuration_id", configurationIds]]) {
      requireId(mapping[field], `${path}.${field}`, issues);
      if (!knownIds.has(mapping[field])) issue(issues, "error", `${path}.${field}`, `references unknown ID ${mapping[field]}`);
    }
    requireString(mapping.external_product_id, `${path}.external_product_id`, issues);
    if (!["exact-sku", "exact-mpn", "manual"].includes(mapping.matching_method)) issue(issues, "error", `${path}.matching_method`, "has an unsupported value");
    if (!["research", "technical-review"].includes(mapping.reviewer_role)) issue(issues, "error", `${path}.reviewer_role`, "has an unsupported value");
    if (!["candidate", "approved", "rejected"].includes(mapping.status)) issue(issues, "error", `${path}.status`, "has an unsupported value");
    requireDate(mapping.reviewed_at, `${path}.reviewed_at`, issues);
  }

  const publication = bundle.publication;
  if (requireObject(publication, "publication", issues)) {
    if (publication.schema_version !== 1) issue(issues, "error", "publication.schema_version", "must equal 1");
    if (publication.market !== "US") issue(issues, "error", "publication.market", "must equal US");
    requireDate(publication.updated_at, "publication.updated_at", issues);
    for (const flag of ["routes_enabled", "indexing_enabled", "affiliate_links_enabled", "feed_sync_enabled"]) {
      if (typeof publication[flag] !== "boolean") issue(issues, "error", `publication.${flag}`, "must be a boolean");
    }
    if (publication.indexing_enabled && !publication.routes_enabled) issue(issues, "error", "publication.indexing_enabled", "cannot be enabled while routes are disabled");
    if (publication.affiliate_links_enabled && !publication.routes_enabled) issue(issues, "error", "publication.affiliate_links_enabled", "cannot be enabled while routes are disabled");
    if (publication.affiliate_links_enabled) {
      const affiliateContent = bundle.content?.affiliate;
      if (!isObject(affiliateContent) || affiliateContent.status !== "published" || typeof affiliateContent.disclosure !== "string" || affiliateContent.disclosure.trim().length === 0) {
        issue(issues, "error", "publication.affiliate_links_enabled", "needs a published non-empty affiliate disclosure");
      }
      if (!programs.some((program) => program.relationship_status === "approved")) {
        issue(issues, "error", "publication.affiliate_links_enabled", "needs at least one approved affiliate program");
      }
    }
  }

  for (const [name, document] of Object.entries(bundle.content ?? {})) {
    if (!requireObject(document, `content.${name}`, issues)) continue;
    if (document.schema_version !== 1) issue(issues, "error", `content.${name}.schema_version`, "must equal 1");
    if (document.market !== "US") issue(issues, "error", `content.${name}.market`, "must equal US");
    if (!["draft", "reviewed", "published"].includes(document.status)) issue(issues, "error", `content.${name}.status`, "has an unsupported value");
  }

  validateEditorialContent(bundle, sourceIds, productIds, issues);

  return issues;
}

export function validateUsBundle(bundle) {
  const issues = auditUsBundle(bundle);
  const errors = issues.filter((entry) => entry.severity === "error");
  if (errors.length > 0) {
    throw new Error(`US data validation failed:\n${errors.map((entry) => `- ${entry.path}: ${entry.message}`).join("\n")}`);
  }
  return issues;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
}

export async function loadUsBundle() {
  const dataEntries = await Promise.all(Object.entries(DATA_FILES).map(async ([name, path]) => [name, await readJson(path)]));
  const contentEntries = await Promise.all(Object.entries(CONTENT_FILES).map(async ([name, path]) => [name, await readJson(path)]));
  return { ...Object.fromEntries(dataEntries), content: Object.fromEntries(contentEntries) };
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isCli) {
  const bundle = await loadUsBundle();
  const issues = validateUsBundle(bundle);
  const warnings = issues.filter((entry) => entry.severity === "warning");
  const publicationState = bundle.publication.indexing_enabled ? "indexing enabled" : "indexing disabled";
  console.log(
    `US data check passed: ${bundle.products.products.length} products, `
      + `${bundle.configurations.configurations.length} configurations, `
      + `${bundle.offers.offers.length} offers, ${warnings.length} warnings; routes are ${bundle.publication.routes_enabled ? "enabled" : "disabled"}, `
      + `${publicationState}, affiliate links are ${bundle.publication.affiliate_links_enabled ? "enabled" : "disabled"} and feed sync is ${bundle.publication.feed_sync_enabled ? "enabled" : "disabled"}.`,
  );
}
