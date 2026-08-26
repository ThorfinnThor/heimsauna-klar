import { readFile } from "node:fs/promises";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const archetypes = JSON.parse(await readFile(new URL("../data/sauna-archetypes.json", import.meta.url), "utf8"));
const collections = JSON.parse(await readFile(new URL("../content/de/collections.json", import.meta.url), "utf8"));
const voltageGuide = JSON.parse(await readFile(new URL("../content/de/guides/230-v-sauna.json", import.meta.url), "utf8"));
const legal = JSON.parse(await readFile(new URL("../content/de/legal.json", import.meta.url), "utf8"));
const affiliatePolicy = JSON.parse(await readFile(new URL("../content/de/affiliate.json", import.meta.url), "utf8"));
const merchants = JSON.parse(await readFile(new URL("../data/merchants.json", import.meta.url), "utf8"));
const launchReadiness = JSON.parse(await readFile(new URL("../data/launch-readiness.json", import.meta.url), "utf8"));
const planningGuides = JSON.parse(await readFile(new URL("../content/de/planning-guides.json", import.meta.url), "utf8"));
const planningNavigation = JSON.parse(await readFile(new URL("../content/de/planning-navigation.json", import.meta.url), "utf8"));
const pagePresentations = JSON.parse(await readFile(new URL("../content/de/page-presentations.json", import.meta.url), "utf8"));
const sourceQueue = JSON.parse(await readFile(new URL("../data/source-queue.json", import.meta.url), "utf8"));
const powerEvidence = JSON.parse(await readFile(new URL("../data/power-evidence.json", import.meta.url), "utf8"));
const voltageReviewBatch = JSON.parse(await readFile(new URL("../data/voltage-review-batch.json", import.meta.url), "utf8"));
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(value, label) {
  if (typeof value !== "string" || !isoDatePattern.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${label} must be a valid ISO date`);
  }
  if (value > today) throw new Error(`${label} cannot be in the future`);
}

function assertHttpsUrl(value, label) {
  if (typeof value !== "string" || !value.startsWith("https://")) {
    throw new Error(`${label} must use HTTPS`);
  }
}

if (!Array.isArray(products)) throw new Error("data/products.json must contain an array");
if (!Array.isArray(archetypes) || archetypes.length === 0) {
  throw new Error("data/sauna-archetypes.json must contain at least one entry");
}
if (!Array.isArray(sourceQueue) || sourceQueue.length === 0) throw new Error("data/source-queue.json must contain queued sources");
if (powerEvidence.scope !== "data/products.json" || powerEvidence.schema_version !== 1) {
  throw new Error("data/power-evidence.json has an invalid scope or schema version");
}
assertIsoDate(powerEvidence.updated_at, "Power evidence updated_at");
if (!Array.isArray(powerEvidence.assignment_rules) || powerEvidence.assignment_rules.length < 4) {
  throw new Error("Power evidence needs explicit assignment rules");
}
if (!Array.isArray(powerEvidence.official_reference_sources) || powerEvidence.official_reference_sources.length < 3) {
  throw new Error("Power evidence needs official reference sources");
}
for (const source of powerEvidence.official_reference_sources) assertHttpsUrl(source.url, "Power evidence source URL");
if (voltageReviewBatch.schema_version !== 1 || voltageReviewBatch.scope !== "data/products.json") {
  throw new Error("Voltage review batch has an invalid schema or scope");
}
assertIsoDate(voltageReviewBatch.updated_at, "Voltage review batch updated_at");
if (!voltageReviewBatch.batch_id || !voltageReviewBatch.method || !Array.isArray(voltageReviewBatch.entries) || voltageReviewBatch.entries.length === 0) {
  throw new Error("Voltage review batch needs an id, method, and entries");
}
if (!voltageReviewBatch.decision_legend
  || typeof voltageReviewBatch.decision_legend.keep_neutral !== "string"
  || typeof voltageReviewBatch.decision_legend.assign !== "string") {
  throw new Error("Voltage review batch needs a decision legend");
}
if (!voltageReviewBatch.summary || typeof voltageReviewBatch.summary !== "object") {
  throw new Error("Voltage review batch needs a summary");
}

if (!Array.isArray(merchants) || merchants.length === 0) throw new Error("data/merchants.json must contain merchants");
if (!affiliatePolicy.title || !Array.isArray(affiliatePolicy.principles) || affiliatePolicy.principles.length < 4) {
  throw new Error("content/de/affiliate.json must contain the public affiliate policy");
}
if (!Array.isArray(affiliatePolicy.launch_gates) || affiliatePolicy.launch_gates.length < 5) {
  throw new Error("Affiliate policy needs at least five launch gates");
}
if (!["inactive", "active"].includes(affiliatePolicy.current_status)) throw new Error("Affiliate policy has an invalid current status");
assertIsoDate(affiliatePolicy.updated_at, "Affiliate policy updated_at");

if (!launchReadiness.title || launchReadiness.market !== "Deutschland" || !Array.isArray(launchReadiness.gates)) {
  throw new Error("data/launch-readiness.json must contain the German launch gate registry");
}
assertIsoDate(launchReadiness.updated_at, "Launch readiness updated_at");
if (!["prototype", "launch-ready"].includes(launchReadiness.publication_status)) {
  throw new Error("Launch readiness has an invalid publication status");
}
const launchGateIds = new Set();
for (const gate of launchReadiness.gates) {
  for (const key of ["id", "title", "status", "detail"]) {
    if (typeof gate[key] !== "string" || gate[key].trim() === "") throw new Error(`Launch gate is missing ${key}`);
  }
  if (launchGateIds.has(gate.id)) throw new Error(`Duplicate launch gate id: ${gate.id}`);
  launchGateIds.add(gate.id);
  if (!["ready", "blocked", "planned"].includes(gate.status)) throw new Error(`${gate.id} has an invalid launch status`);
  if (typeof gate.required_for_indexing !== "boolean") throw new Error(`${gate.id} needs required_for_indexing`);
  if (gate.required_for_indexing && gate.status === "planned") throw new Error(`${gate.id} cannot be planned when required for indexing`);
}
const requiredLaunchGates = launchReadiness.gates.filter((gate) => gate.required_for_indexing);
const blockingLaunchGates = requiredLaunchGates.filter((gate) => gate.status !== "ready");
if (requiredLaunchGates.length === 0) throw new Error("Launch readiness needs indexing gates");
if ((blockingLaunchGates.length === 0) !== (launchReadiness.publication_status === "launch-ready")) {
  throw new Error("Launch publication status does not match the required gate states");
}

const affiliatePrograms = affiliatePolicy.programs;
if (!Array.isArray(affiliatePrograms) || affiliatePrograms.length === 0) throw new Error("Affiliate policy must contain program candidates");
const affiliateProgramIds = new Set();
for (const program of affiliatePrograms) {
  for (const key of ["id", "name", "network", "program_id", "status", "focus", "commission_snapshot", "url", "checked_at"]) {
    if (typeof program[key] !== "string" || program[key].trim() === "") throw new Error(`Affiliate program is missing ${key}`);
  }
  if (affiliateProgramIds.has(program.id)) throw new Error(`Duplicate affiliate program id: ${program.id}`);
  affiliateProgramIds.add(program.id);
  if (!["candidate", "applied", "approved", "rejected"].includes(program.status)) throw new Error(`${program.id} has an invalid status`);
  if (!(program.cookie_days > 0) || typeof program.direct_linking !== "boolean") throw new Error(`${program.id} has invalid conditions`);
  if (!Array.isArray(program.tracking_hosts)
    || !program.tracking_hosts.every((host) => typeof host === "string" && host !== "" && !host.includes("/"))) {
    throw new Error(`${program.id} has invalid tracking hosts`);
  }
  if (!Array.isArray(program.advertiser_merchant_ids)) throw new Error(`${program.id} needs advertiser merchant ids`);
  assertHttpsUrl(program.url, `Affiliate program URL for ${program.id}`);
  assertIsoDate(program.checked_at, `Affiliate program check date for ${program.id}`);
}

const merchantIds = new Set();
const merchantNames = new Set();
const merchantsByName = new Map();
for (const merchant of merchants) {
  for (const key of ["id", "name", "kind", "allowed_hosts", "affiliate", "candidate_program_ids"]) {
    if (merchant[key] === undefined) throw new Error(`Merchant is missing ${key}`);
  }
  if (merchantIds.has(merchant.id) || merchantNames.has(merchant.name)) throw new Error(`Duplicate merchant: ${merchant.name}`);
  merchantIds.add(merchant.id);
  merchantNames.add(merchant.name);
  merchantsByName.set(merchant.name, merchant);
  if (!["manufacturer", "retailer"].includes(merchant.kind)) throw new Error(`${merchant.id} has an invalid kind`);
  if (!Array.isArray(merchant.allowed_hosts) || merchant.allowed_hosts.length === 0) throw new Error(`${merchant.id} needs allowed hosts`);
  if (!merchant.allowed_hosts.every((host) => typeof host === "string" && host !== "" && !host.includes("/"))) throw new Error(`${merchant.id} has an invalid host`);
  if (!["inactive", "active"].includes(merchant.affiliate?.status)) throw new Error(`${merchant.id} has an invalid affiliate status`);
  if (merchant.affiliate.status === "inactive" && merchant.affiliate.program_id !== null) throw new Error(`${merchant.id} has an inactive affiliate program id`);
  if (!Array.isArray(merchant.candidate_program_ids)) throw new Error(`${merchant.id} needs candidate program ids`);
  if (merchant.affiliate.status === "active" && !merchant.candidate_program_ids.includes(merchant.affiliate.program_id)) {
    throw new Error(`${merchant.id} activates a program that is not registered as a candidate`);
  }
  if (merchant.affiliate.status === "active") {
    const activeProgram = affiliatePrograms.find((program) => program.id === merchant.affiliate.program_id);
    if (activeProgram?.status !== "approved") throw new Error(`${merchant.id} activates an unapproved affiliate program`);
  }
  for (const programId of merchant.candidate_program_ids) {
    if (!affiliateProgramIds.has(programId)) throw new Error(`${merchant.id} references unknown candidate program ${programId}`);
  }
}
for (const program of affiliatePrograms) {
  for (const merchantId of program.advertiser_merchant_ids) {
    if (!merchantIds.has(merchantId)) throw new Error(`${program.id} references unknown merchant ${merchantId}`);
    const merchant = merchants.find((item) => item.id === merchantId);
    if (!merchant.candidate_program_ids.includes(program.id)) {
      throw new Error(`${program.id} and ${merchantId} need a bidirectional candidate mapping`);
    }
  }
}
for (const merchant of merchants) {
  for (const programId of merchant.candidate_program_ids) {
    const program = affiliatePrograms.find((item) => item.id === programId);
    if (!program.advertiser_merchant_ids.includes(merchant.id)) {
      throw new Error(`${merchant.id} and ${programId} need a bidirectional candidate mapping`);
    }
  }
}

if (!Array.isArray(planningGuides) || planningGuides.length === 0) throw new Error("content/de/planning-guides.json must contain planning guides");
const planningSlugs = new Set();
for (const guide of planningGuides) {
  for (const key of ["slug", "eyebrow", "title", "accent", "description", "updated_at", "summary"]) {
    if (typeof guide[key] !== "string" || guide[key].trim() === "") throw new Error(`Planning guide is missing ${key}`);
  }
  if (planningSlugs.has(guide.slug)) throw new Error(`Duplicate planning guide slug: ${guide.slug}`);
  planningSlugs.add(guide.slug);
  assertIsoDate(guide.updated_at, `Planning guide date for ${guide.slug}`);
  if (!Array.isArray(guide.sections) || guide.sections.length < 3) throw new Error(`${guide.slug} needs at least three sections`);
  for (const section of guide.sections) {
    if (!section.title || !section.copy || !Array.isArray(section.points) || section.points.length < 3) throw new Error(`${guide.slug} has an incomplete section`);
  }
  if (!Array.isArray(guide.checklist) || guide.checklist.length < 5) throw new Error(`${guide.slug} needs at least five checklist items`);
  if (!Array.isArray(guide.sources) || guide.sources.length < 2) throw new Error(`${guide.slug} needs at least two sources`);
  for (const source of guide.sources) {
    if (!source.title) throw new Error(`${guide.slug} has a source without a title`);
    assertHttpsUrl(source.url, `Planning guide source for ${guide.slug}`);
    assertIsoDate(source.checked_at, `Planning guide source date for ${guide.slug}`);
  }
}

if (!Array.isArray(planningNavigation.groups) || planningNavigation.groups.length === 0) {
  throw new Error("content/de/planning-navigation.json must contain planning groups");
}
if (!planningNavigation.guide_paths || typeof planningNavigation.guide_paths !== "object") {
  throw new Error("content/de/planning-navigation.json must contain guide paths");
}
const groupedPlanningSlugs = new Set();
for (const group of planningNavigation.groups) {
  for (const key of ["id", "number", "eyebrow", "title", "description"]) {
    if (typeof group[key] !== "string" || group[key].trim() === "") throw new Error(`Planning group is missing ${key}`);
  }
  if (!Array.isArray(group.guide_slugs) || group.guide_slugs.length === 0) throw new Error(`${group.id} needs guide slugs`);
  for (const slug of group.guide_slugs) {
    if (!planningSlugs.has(slug)) throw new Error(`${group.id} references unknown planning guide ${slug}`);
    if (groupedPlanningSlugs.has(slug)) throw new Error(`Planning guide ${slug} appears in more than one group`);
    groupedPlanningSlugs.add(slug);
  }
}
for (const slug of planningSlugs) {
  if (!groupedPlanningSlugs.has(slug)) throw new Error(`Planning guide ${slug} is missing from the planning groups`);
  const journey = planningNavigation.guide_paths[slug];
  if (!journey) throw new Error(`Planning guide ${slug} is missing a journey`);
  if (!Array.isArray(journey.related_slugs) || journey.related_slugs.length !== 3) throw new Error(`${slug} needs exactly three related guides`);
  if (new Set(journey.related_slugs).size !== journey.related_slugs.length) throw new Error(`${slug} repeats a related guide`);
  for (const relatedSlug of journey.related_slugs) {
    if (relatedSlug === slug || !planningSlugs.has(relatedSlug)) throw new Error(`${slug} references invalid related guide ${relatedSlug}`);
  }
  if (typeof journey.product_href !== "string" || !journey.product_href.startsWith("/de/")) throw new Error(`${slug} needs an internal product href`);
  if (typeof journey.product_label !== "string" || journey.product_label.trim() === "") throw new Error(`${slug} needs a product label`);
}
for (const slug of Object.keys(planningNavigation.guide_paths)) {
  if (!planningSlugs.has(slug)) throw new Error(`Planning journey references unknown guide ${slug}`);
}

if (!Array.isArray(collections) || collections.length === 0) throw new Error("content/de/collections.json must contain collections");
const collectionRoutes = new Set();
const collectionMatchers = {
  mini_indoor: (product) => ["indoor", "infrared"].includes(product.category) && product.dimensions_cm.width * product.dimensions_cm.depth <= 30_000,
  one_person_indoor: (product) => ["indoor", "infrared"].includes(product.category) && product.people.max === 1,
  small_garden: (product) => product.category === "outdoor" && product.dimensions_cm.width * product.dimensions_cm.depth <= 50_000,
  price_under_2500: (product) => product.commercial.offers.some((offer) => offer.price <= 2_500),
  two_person_indoor: (product) => ["indoor", "infrared"].includes(product.category) && product.people.max === 2,
  infrared: (product) => product.category === "infrared",
  bio_sauna: (product) => product.sauna.type === "Bio-Sauna",
  barrel_sauna: (product) => product.category === "outdoor" && product.model.toLowerCase().includes("fasssauna"),
  price_under_4000: (product) => product.commercial.offers.some((offer) => offer.price <= 4_000),
  four_person: (product) => product.people.max === 4,
  three_person_indoor: (product) => ["indoor", "infrared"].includes(product.category) && product.people.max === 3,
  finnish: (product) => product.sauna.type === "Finnische Sauna",
  area_under_6: (product) => product.dimensions_cm.width * product.dimensions_cm.depth <= 60_000,
};
for (const collection of collections) {
  for (const key of ["id", "section", "slug", "kind", "eyebrow", "title", "accent", "description", "intro", "layout", "rule", "sort"]) {
    if (typeof collection[key] !== "string" || collection[key].trim() === "") throw new Error(`Collection is missing ${key}`);
  }
  if (!["indoor-sauna", "outdoor-sauna", "vergleiche"].includes(collection.section)) {
    throw new Error(`Unsupported collection section: ${collection.id}`);
  }
  if (!["mini_indoor", "one_person_indoor", "small_garden", "price_under_2500", "two_person_indoor", "infrared", "bio_sauna", "barrel_sauna", "price_under_4000", "four_person", "three_person_indoor", "finnish", "area_under_6"].includes(collection.rule)) {
    throw new Error(`Unsupported collection rule: ${collection.id}`);
  }
  if (!["footprint", "price"].includes(collection.sort)) throw new Error(`Unsupported collection sort: ${collection.id}`);
  if (!["space", "outdoor", "budget", "heat", "capacity", "technical", "tradeoff"].includes(collection.layout)) throw new Error(`Unsupported collection layout: ${collection.id}`);
  if (!Array.isArray(collection.related_ids) || collection.related_ids.length < 3 || collection.related_ids.length > 4) throw new Error(`${collection.id} needs three or four related collections`);
  if (new Set(collection.related_ids).size !== collection.related_ids.length || collection.related_ids.includes(collection.id)) throw new Error(`${collection.id} repeats or self-links related collections`);
  for (const relatedId of collection.related_ids) {
    if (!collections.some((item) => item.id === relatedId)) throw new Error(`${collection.id} references unknown related collection ${relatedId}`);
  }
  if (!collection.planning || typeof collection.planning !== "object") throw new Error(`${collection.id} needs planning links`);
  for (const key of ["kicker", "intro"]) {
    if (typeof collection.planning[key] !== "string" || collection.planning[key].trim() === "") throw new Error(`${collection.id} planning is missing ${key}`);
  }
  if (!Array.isArray(collection.planning.guide_ids) || collection.planning.guide_ids.length !== 2) throw new Error(`${collection.id} needs exactly two planning links`);
  if (new Set(collection.planning.guide_ids).size !== collection.planning.guide_ids.length) throw new Error(`${collection.id} repeats planning links`);
  for (const guideSlug of collection.planning.guide_ids) {
    if (!planningSlugs.has(guideSlug)) throw new Error(`${collection.id} references unknown planning guide ${guideSlug}`);
  }
  if (!collection.editorial || typeof collection.editorial !== "object") throw new Error(`${collection.id} needs editorial copy`);
  for (const key of ["kicker", "title", "pointsTitle", "callout"]) {
    if (typeof collection.editorial[key] !== "string" || collection.editorial[key].trim() === "") {
      throw new Error(`${collection.id} editorial is missing ${key}`);
    }
  }
  if (!Array.isArray(collection.editorial.paragraphs) || collection.editorial.paragraphs.length < 2 || collection.editorial.paragraphs.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${collection.id} editorial needs at least two paragraphs`);
  }
  if (!Array.isArray(collection.editorial.points) || collection.editorial.points.length < 3 || collection.editorial.points.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${collection.id} editorial needs at least three points`);
  }
  if (!Array.isArray(collection.criteria) || collection.criteria.length < 3) throw new Error(`${collection.id} needs at least three criteria`);
  if (!Array.isArray(collection.checks) || collection.checks.length < 3) throw new Error(`${collection.id} needs at least three checks`);
  const route = `${collection.section}/${collection.slug}`;
  if (collectionRoutes.has(route)) throw new Error(`Duplicate collection route: ${route}`);
  collectionRoutes.add(route);
  if (!products.some((product) => product.status === "verified" && collectionMatchers[collection.rule](product))) {
    throw new Error(`${collection.id} has no matching verified products`);
  }
}

if (pagePresentations.schema_version !== 1) throw new Error("Page presentations have an unsupported schema version");
assertIsoDate(pagePresentations.updated_at, "Page presentations updated_at");
if (!pagePresentations.collections || !pagePresentations.planning_guides) {
  throw new Error("Page presentations need collection and planning guide profiles");
}

const collectionModules = ["insight", "editorial", "method", "results", "checks"];
const planningModules = ["insight", "sections", "checks", "sources"];

function validateInsight(insight, label, minimumCopyLength) {
  if (!insight || typeof insight !== "object") throw new Error(`${label} needs an editorial insight`);
  for (const key of ["kicker", "title"]) {
    if (typeof insight[key] !== "string" || insight[key].trim() === "") throw new Error(`${label} insight is missing ${key}`);
  }
  if (!Array.isArray(insight.copy) || insight.copy.length < 2 || insight.copy.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${label} insight needs at least two paragraphs`);
  }
  if (insight.copy.join(" ").length < minimumCopyLength) throw new Error(`${label} insight copy is too thin`);
  if (!Array.isArray(insight.points) || insight.points.length < 3 || insight.points.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${label} insight needs at least three decision points`);
  }
}

function validateExactKeys(actual, expected, label) {
  const actualSet = new Set(Object.keys(actual));
  for (const id of expected) if (!actualSet.has(id)) throw new Error(`${label} is missing ${id}`);
  for (const id of actualSet) if (!expected.has(id)) throw new Error(`${label} references unknown page ${id}`);
}

const collectionIds = new Set(collections.map((collection) => collection.id));
const planningGuideSlugs = new Set(planningGuides.map((guide) => guide.slug));
validateExactKeys(pagePresentations.collections, collectionIds, "Collection presentations");
validateExactKeys(pagePresentations.planning_guides, planningGuideSlugs, "Planning presentations");

const collectionProfiles = new Map();
for (const [id, presentation] of Object.entries(pagePresentations.collections)) {
  if (!["editorial", "compact", "index", "split"].includes(presentation.hero)) throw new Error(`${id} has an invalid collection hero`);
  if (!["table", "cards", "ledger"].includes(presentation.results)) throw new Error(`${id} has an invalid results view`);
  if (!["split", "panel", "steps"].includes(presentation.method)) throw new Error(`${id} has an invalid method view`);
  if (!Array.isArray(presentation.flow) || presentation.flow.length !== collectionModules.length || new Set(presentation.flow).size !== collectionModules.length || collectionModules.some((module) => !presentation.flow.includes(module))) {
    throw new Error(`${id} must use every collection module exactly once`);
  }
  validateInsight(presentation.insight, id, 400);
  const profile = [presentation.hero, presentation.results, presentation.method, presentation.flow.join("-")].join("|");
  if (collectionProfiles.has(profile)) throw new Error(`${id} duplicates the presentation profile of ${collectionProfiles.get(profile)}`);
  collectionProfiles.set(profile, id);
}

const planningProfiles = new Map();
for (const [slug, presentation] of Object.entries(pagePresentations.planning_guides)) {
  const guide = planningGuides.find((item) => item.slug === slug);
  if (!["summary", "split", "briefing", "question", "compact"].includes(presentation.hero)) throw new Error(`${slug} has an invalid planning hero`);
  if (!["staggered", "technical", "timeline", "cards", "ledger", "alternating"].includes(presentation.sections)) throw new Error(`${slug} has an invalid section view`);
  if (!["callout", "matrix", "brief"].includes(presentation.insight_style)) throw new Error(`${slug} has an invalid insight view`);
  const requiredModules = guide.catalog_snapshot === "product_prices" ? [...planningModules, "snapshot"] : planningModules;
  if (!Array.isArray(presentation.flow) || presentation.flow.length !== requiredModules.length || new Set(presentation.flow).size !== requiredModules.length || requiredModules.some((module) => !presentation.flow.includes(module))) {
    throw new Error(`${slug} must use every applicable planning module exactly once`);
  }
  validateInsight(presentation.insight, slug, 280);
  const profile = [presentation.hero, presentation.sections, presentation.insight_style, presentation.flow.join("-")].join("|");
  if (planningProfiles.has(profile)) throw new Error(`${slug} duplicates the presentation profile of ${planningProfiles.get(profile)}`);
  planningProfiles.set(profile, slug);
}

const queueIds = new Set();
for (const source of sourceQueue) {
  for (const key of ["queue_id", "manufacturer", "url", "target_category", "status", "notes"]) {
    if (typeof source[key] !== "string" || source[key].trim() === "") throw new Error(`Source queue entry is missing ${key}`);
  }
  assertHttpsUrl(source.url, `Source queue URL for ${source.queue_id}`);
  if (!["queued", "verified", "skipped"].includes(source.status)) {
    throw new Error(`Unsupported source queue status: ${source.queue_id}`);
  }
  if (!["indoor", "outdoor", "infrared", "portable", "tent"].includes(source.target_category)) {
    throw new Error(`Unsupported source queue category: ${source.queue_id}`);
  }
  if (![120, 230, 400, "wood", "none"].includes(source.target_voltage)) {
    throw new Error(`Unsupported source queue voltage: ${source.queue_id}`);
  }
  if (queueIds.has(source.queue_id)) throw new Error(`Duplicate source queue id: ${source.queue_id}`);
  queueIds.add(source.queue_id);
}

const archetypeIds = new Set();
for (const item of archetypes) {
  for (const key of ["id", "label", "title", "summary", "space", "power", "idealFor", "status"]) {
    if (typeof item[key] !== "string" || item[key].trim() === "") {
      throw new Error(`Archetype ${item.id ?? "<unknown>"} is missing ${key}`);
    }
  }
  if (archetypeIds.has(item.id)) throw new Error(`Duplicate archetype id: ${item.id}`);
  archetypeIds.add(item.id);
}

const productIds = new Set();
const productDisplayNames = new Set();
let affiliateOfferCount = 0;
for (const product of products) {
  const required = ["product_id", "brand", "model", "family", "category", "status", "dimensions_cm", "people", "power", "sauna", "commercial", "editorial", "sources", "updated_at"];
  const missing = required.filter((key) => product[key] === undefined);
  if (missing.length) throw new Error(`${product.product_id ?? "<unknown>"} is missing: ${missing.join(", ")}`);
  if (productIds.has(product.product_id)) throw new Error(`Duplicate product_id: ${product.product_id}`);
  const displayName = `${product.brand}|${product.model}`;
  if (productDisplayNames.has(displayName)) throw new Error(`Duplicate product display name: ${displayName}`);
  productDisplayNames.add(displayName);
  if (!["draft", "verified", "archived"].includes(product.status)) {
    throw new Error(`${product.product_id} has an unsupported status`);
  }
  if (!["indoor", "outdoor", "infrared", "portable", "tent"].includes(product.category)) {
    throw new Error(`${product.product_id} has an unsupported category`);
  }
  if (!["indoor", "outdoor"].includes(product.sauna.indoor_outdoor)) {
    throw new Error(`${product.product_id} has an unsupported installation location`);
  }
  if (["indoor", "outdoor"].includes(product.category) && product.sauna.indoor_outdoor !== product.category) {
    throw new Error(`${product.product_id} category and installation location do not match`);
  }
  if (product.category === "infrared" && product.sauna.indoor_outdoor !== "indoor") {
    throw new Error(`${product.product_id} infrared products must use an indoor installation location`);
  }
  if (product.family !== null) {
    for (const key of ["id", "name", "variant"]) {
      if (typeof product.family[key] !== "string" || product.family[key].trim() === "") {
        throw new Error(`${product.product_id} has an invalid family ${key}`);
      }
    }
    if (!/^[a-z0-9-]+$/.test(product.family.id)) {
      throw new Error(`${product.product_id} has an invalid family id`);
    }
  }
  for (const dimension of ["width", "depth", "height"]) {
    if (!(product.dimensions_cm[dimension] > 0)) throw new Error(`${product.product_id} has an invalid ${dimension}`);
  }
  if (!(product.people.min >= 1) || product.people.max < product.people.min) {
    throw new Error(`${product.product_id} has an invalid people range`);
  }
  if (!Number.isInteger(product.people.seats) || product.people.seats < 0 || product.people.seats > product.people.max) {
    throw new Error(`${product.product_id} has an invalid seat count`);
  }
  if (!Number.isInteger(product.people.lying_places) || product.people.lying_places < 0 || product.people.lying_places > product.people.max) {
    throw new Error(`${product.product_id} has an invalid lying-place count`);
  }
  if (![120, 230, 400, "wood", "none"].includes(product.power.voltage)) {
    throw new Error(`${product.product_id} has an unsupported voltage`);
  }
  if (product.power.kw !== null && !(product.power.kw > 0)) {
    throw new Error(`${product.product_id} has an invalid power rating`);
  }
  if (product.power.plug_type !== null && (typeof product.power.plug_type !== "string" || product.power.plug_type.trim() === "")) {
    throw new Error(`${product.product_id} has an invalid plug type`);
  }
  if (typeof product.power.electrician_required !== "boolean") {
    throw new Error(`${product.product_id} has an invalid electrician requirement`);
  }
  if (typeof product.power.notes !== "string" || product.power.notes.trim() === "") {
    throw new Error(`${product.product_id} needs a power evidence note`);
  }
  if (product.power.voltage === "none" && product.power.kw !== null && !product.power.electrician_required) {
    throw new Error(`${product.product_id} has an unrated connection without an electrician check`);
  }
  if (!Array.isArray(product.commercial.offers)) throw new Error(`${product.product_id} offers must be an array`);
  if (!["from", "current", "unavailable"].includes(product.commercial.price_status)) {
    throw new Error(`${product.product_id} has an unsupported price status`);
  }
  if (product.status === "verified" && product.commercial.price_status !== "unavailable" && product.commercial.offers.length === 0) {
    throw new Error(`${product.product_id} needs a checked offer for its published price`);
  }
  if (product.status === "verified" && product.sources.length === 0) {
    throw new Error(`${product.product_id} cannot be verified without sources`);
  }
  const offerKeys = new Set();
  for (const offer of product.commercial.offers) {
    if (typeof offer.merchant !== "string" || offer.merchant.trim() === "") {
      throw new Error(`${product.product_id} has an offer without a merchant`);
    }
    if (!(offer.price >= 0)) throw new Error(`${product.product_id} has an invalid offer price`);
    assertHttpsUrl(offer.url, `Offer URL for ${product.product_id}`);
    assertIsoDate(offer.last_checked, `Offer check date for ${product.product_id}`);
    if (typeof offer.affiliate !== "boolean") throw new Error(`${product.product_id} has an invalid affiliate flag`);
    if (offer.configuration !== undefined && (typeof offer.configuration !== "string" || offer.configuration.trim() === "")) {
      throw new Error(`${product.product_id} has an invalid offer configuration`);
    }
    if (offer.selection_required !== undefined && typeof offer.selection_required !== "boolean") {
      throw new Error(`${product.product_id} has an invalid offer selection requirement`);
    }
    if (offer.selection_required && !offer.configuration) {
      throw new Error(`${product.product_id} requires an offer configuration when shop selection is required`);
    }
    const registeredMerchant = merchantsByName.get(offer.merchant);
    if (!registeredMerchant) throw new Error(`${product.product_id} uses unregistered merchant ${offer.merchant}`);
    const offerHost = new URL(offer.url).hostname.replace(/^www\./, "");
    if (!registeredMerchant.allowed_hosts.includes(offerHost)) {
      throw new Error(`${product.product_id} uses unapproved host ${offerHost} for ${offer.merchant}`);
    }
    if (offer.affiliate) {
      const program = affiliatePrograms.find((item) => item.id === registeredMerchant.affiliate.program_id);
      if (registeredMerchant.affiliate.status !== "active" || program?.status !== "approved") {
        throw new Error(`${product.product_id} enables an affiliate offer without an approved merchant program`);
      }
      if (offer.affiliate_program_id !== program.id) {
        throw new Error(`${product.product_id} has an affiliate offer without the active program id`);
      }
      assertHttpsUrl(offer.affiliate_url, `Affiliate URL for ${product.product_id}`);
      const trackingHost = new URL(offer.affiliate_url).hostname.replace(/^www\./, "");
      if (!program.tracking_hosts.includes(trackingHost)) {
        throw new Error(`${product.product_id} uses unapproved affiliate tracking host ${trackingHost}`);
      }
    } else if (offer.affiliate_url !== undefined || offer.affiliate_program_id !== undefined) {
      throw new Error(`${product.product_id} has tracking fields on a non-affiliate offer`);
    }
    if (offer.affiliate) affiliateOfferCount += 1;
    const offerKey = `${offer.merchant}|${offer.url}`;
    if (offerKeys.has(offerKey)) throw new Error(`${product.product_id} has a duplicate offer`);
    offerKeys.add(offerKey);
  }
  if (!Array.isArray(product.sources)) throw new Error(`${product.product_id} sources must be an array`);
  const sourceUrls = new Set();
  for (const source of product.sources) {
    assertHttpsUrl(source.url, `Source URL for ${product.product_id}`);
    assertIsoDate(source.checked_at, `Source check date for ${product.product_id}`);
    if (!["manufacturer", "manual", "merchant", "test"].includes(source.type)) {
      throw new Error(`${product.product_id} has an unsupported source type`);
    }
    if (sourceUrls.has(source.url)) throw new Error(`${product.product_id} has a duplicate source URL`);
    sourceUrls.add(source.url);
  }
  for (const offer of product.commercial.offers) {
    if (!sourceUrls.has(offer.url)) {
      throw new Error(`${product.product_id} has an offer URL without a matching published source`);
    }
  }
  if (product.status === "verified" && !product.sources.some((source) => ["manufacturer", "manual"].includes(source.type))) {
    throw new Error(`${product.product_id} needs an official manufacturer or manual source`);
  }
  assertIsoDate(product.updated_at, `Updated date for ${product.product_id}`);
  const latestEvidenceDate = [...product.sources.map((source) => source.checked_at), ...product.commercial.offers.map((offer) => offer.last_checked)].sort((a, b) => b.localeCompare(a))[0];
  if (latestEvidenceDate && product.updated_at < latestEvidenceDate) {
    throw new Error(`${product.product_id} updated_at predates its latest evidence`);
  }
  productIds.add(product.product_id);
}

const verifiedProducts = products.filter((product) => product.status === "verified");
const finderCoverageChecks = [
  ["indoor placement", (product) => product.sauna.indoor_outdoor === "indoor"],
  ["outdoor placement", (product) => product.sauna.indoor_outdoor === "outdoor"],
  ["mobile placement", (product) => ["portable", "tent"].includes(product.category)],
  ["one-person capacity", (product) => product.people.max >= 1],
  ["two-person capacity", (product) => product.people.max >= 2],
  ["four-person capacity", (product) => product.people.max >= 4],
  ["compact footprint", (product) => product.dimensions_cm.width * product.dimensions_cm.depth <= 30_000],
  ["standard footprint", (product) => product.dimensions_cm.width * product.dimensions_cm.depth <= 60_000],
  ["230-V connection", (product) => product.power.voltage === 230],
  ["400-V connection", (product) => product.power.voltage === 400],
  ["lean budget", (product) => product.commercial.offers.some((offer) => offer.price <= 2500)],
  ["mid budget", (product) => product.commercial.offers.some((offer) => offer.price <= 6000)],
  ["traditional heat", (product) => product.category !== "infrared"],
  ["infrared heat", (product) => product.category === "infrared"],
  ["indoor 400-V combination", (product) => product.sauna.indoor_outdoor === "indoor" && product.power.voltage === 400],
  ["outdoor 400-V combination", (product) => product.sauna.indoor_outdoor === "outdoor" && product.power.voltage === 400],
  ["priced mobile combination", (product) => ["portable", "tent"].includes(product.category) && product.commercial.offers.length > 0],
];
for (const [label, matcher] of finderCoverageChecks) {
  if (!verifiedProducts.some(matcher)) throw new Error(`Finder coverage is missing: ${label}`);
}

const productsByPrimaryManufacturerUrl = new Map();
for (const product of products) {
  const primaryManufacturerSource = product.sources.find((source) => source.type === "manufacturer");
  if (!primaryManufacturerSource) continue;
  const existingProduct = productsByPrimaryManufacturerUrl.get(primaryManufacturerSource.url);
  if (existingProduct) {
    throw new Error(`Duplicate primary manufacturer source: ${existingProduct} and ${product.product_id}`);
  }
  productsByPrimaryManufacturerUrl.set(primaryManufacturerSource.url, product.product_id);
}

const families = new Map();
for (const product of products.filter((item) => item.family !== null)) {
  const familyProducts = families.get(product.family.id) ?? [];
  familyProducts.push(product);
  families.set(product.family.id, familyProducts);
}
for (const [familyId, familyProducts] of families) {
  if (familyProducts.length < 2) throw new Error(`${familyId} must contain at least two products`);
  if (new Set(familyProducts.map((product) => product.family.name)).size !== 1) {
    throw new Error(`${familyId} has inconsistent family names`);
  }
  if (new Set(familyProducts.map((product) => product.brand)).size !== 1) {
    throw new Error(`${familyId} cannot span multiple brands`);
  }
  if (new Set(familyProducts.map((product) => product.category)).size !== 1) {
    throw new Error(`${familyId} cannot span multiple categories`);
  }
  if (new Set(familyProducts.map((product) => product.family.variant)).size !== familyProducts.length) {
    throw new Error(`${familyId} has duplicate variant labels`);
  }
}

const publishedSourceUrls = new Set(products.flatMap((product) => product.sources.map((source) => source.url)));
for (const source of sourceQueue) {
  if (source.status === "verified" && !publishedSourceUrls.has(source.url)) {
    throw new Error(`Verified queue entry has no published product source: ${source.queue_id}`);
  }
  if (source.status === "verified") {
    const linkedProducts = products.filter((product) => product.sources.some((item) => item.url === source.url));
    if (linkedProducts.some((product) => product.category !== source.target_category)) {
      throw new Error(`Verified queue category does not match published product: ${source.queue_id}`);
    }
  }
}

const reviewBatchProductIds = new Set();
for (const entry of voltageReviewBatch.entries) {
  for (const key of ["product_id", "source_queue_id", "review_url", "decision", "reason"]) {
    if (typeof entry[key] !== "string" || entry[key].trim() === "") throw new Error(`Voltage review entry is missing ${key}`);
  }
  if (reviewBatchProductIds.has(entry.product_id)) throw new Error(`Voltage review batch repeats ${entry.product_id}`);
  reviewBatchProductIds.add(entry.product_id);
  const product = products.find((item) => item.product_id === entry.product_id);
  if (!product) throw new Error(`Voltage review batch references unknown product: ${entry.product_id}`);
  if (product.power.voltage !== "none") throw new Error(`Voltage review batch product is no longer neutral: ${entry.product_id}`);
  if (entry.decision !== "keep_neutral") throw new Error(`Unsupported voltage review decision: ${entry.product_id}`);
  if (entry.observed_power_kw !== product.power.kw) throw new Error(`Voltage review kW is out of sync: ${entry.product_id}`);
  assertHttpsUrl(entry.review_url, `Voltage review URL for ${entry.product_id}`);
  if (!product.sources.some((source) => source.url === entry.review_url)) {
    throw new Error(`Voltage review URL is not a published product source: ${entry.product_id}`);
  }
  const queueEntry = sourceQueue.find((source) => source.queue_id === entry.source_queue_id);
  if (!queueEntry || queueEntry.url !== entry.review_url) throw new Error(`Voltage review queue link is out of sync: ${entry.product_id}`);
  if (queueEntry.status !== "verified" || queueEntry.target_voltage !== "none") {
    throw new Error(`Voltage review queue entry must be verified and voltage-neutral: ${entry.product_id}`);
  }
}

const reviewBatchAssigned = voltageReviewBatch.entries.filter((entry) => entry.decision === "assign").length;
const reviewBatchKeptNeutral = voltageReviewBatch.entries.filter((entry) => entry.decision === "keep_neutral").length;
if (voltageReviewBatch.summary.reviewed !== voltageReviewBatch.entries.length
  || voltageReviewBatch.summary.assigned !== reviewBatchAssigned
  || voltageReviewBatch.summary.kept_neutral !== reviewBatchKeptNeutral) {
  throw new Error("Voltage review batch summary is out of sync");
}
if (!Array.isArray(powerEvidence.review_batches)) throw new Error("Power evidence needs review batch references");
const evidenceBatch = powerEvidence.review_batches.find((batch) => batch.batch_id === voltageReviewBatch.batch_id);
if (!evidenceBatch
  || evidenceBatch.path !== "data/voltage-review-batch.json"
  || evidenceBatch.reviewed !== voltageReviewBatch.summary.reviewed
  || evidenceBatch.assigned !== voltageReviewBatch.summary.assigned
  || evidenceBatch.kept_neutral !== voltageReviewBatch.summary.kept_neutral) {
  throw new Error("Power evidence review batch reference is out of sync");
}
if (powerEvidence.updated_at < voltageReviewBatch.updated_at) {
  throw new Error("Power evidence cannot predate its latest review batch");
}

const explicitVoltageProducts = products.filter((product) => typeof product.power.voltage === "number");
const voltageNeutralProducts = products.filter((product) => product.power.voltage === "none");
const noOvenOrUnconfiguredProducts = voltageNeutralProducts.filter((product) => product.power.kw === null);
const electricVoltageUnstatedProducts = voltageNeutralProducts.filter((product) => product.power.kw !== null);
if (powerEvidence.snapshot.products !== products.length
  || powerEvidence.snapshot.voltage_not_assigned !== voltageNeutralProducts.length
  || powerEvidence.snapshot.no_oven_or_unconfigured !== noOvenOrUnconfiguredProducts.length
  || powerEvidence.snapshot.electric_heater_voltage_unstated !== electricVoltageUnstatedProducts.length
  || powerEvidence.snapshot.explicit_voltage["230"] !== products.filter((product) => product.power.voltage === 230).length
  || powerEvidence.snapshot.explicit_voltage["400"] !== products.filter((product) => product.power.voltage === 400).length
  || powerEvidence.snapshot.explicit_voltage["120"] !== products.filter((product) => product.power.voltage === 120).length) {
  throw new Error("Power evidence snapshot is out of sync with data/products.json");
}

if (!voltageGuide.title || !Array.isArray(voltageGuide.sources) || voltageGuide.sources.length === 0) {
  throw new Error("230-V guide must have a title and at least one source");
}
for (const source of voltageGuide.sources) {
  assertHttpsUrl(source.url, "230-V guide source URL");
}
assertIsoDate(voltageGuide.updated_at, "230-V guide updated_at");

const legalText = JSON.stringify(legal);
assertIsoDate(legal.updated_at, "Legal content updated_at");
if (!legalText.includes("Schayan Yousefian") || !legalText.includes("Erminger Weg 88") || !legalText.includes("89077 Ulm")) {
  throw new Error("Legal content is missing the confirmed operator name or address");
}
if (!Array.isArray(legal.references) || legal.references.length < 4) throw new Error("Legal content needs official references");
for (const reference of legal.references) {
  if (typeof reference.title !== "string" || reference.title.trim() === "") throw new Error("Legal reference is missing a title");
  assertHttpsUrl(reference.url, `Legal reference URL for ${reference.title}`);
  assertIsoDate(reference.checked_at, `Legal reference date for ${reference.title}`);
}
if (process.env.SITE_INDEXABLE === "true" && blockingLaunchGates.length > 0) {
  throw new Error(`SITE_INDEXABLE cannot be enabled while launch gates are open: ${blockingLaunchGates.map((gate) => gate.id).join(", ")}`);
}
if (process.env.SITE_INDEXABLE === "true" && (legalText.includes("[ergänzen]") || legal.notice?.startsWith("Vorab-Entwurf"))) {
  throw new Error("SITE_INDEXABLE cannot be enabled while the legal pages still contain draft placeholders");
}
if (affiliateOfferCount > 0 && legal.affiliate?.intro?.includes("nicht affiliiert")) {
  throw new Error("Affiliate offers are enabled, but the legal disclosure still says that all links are non-affiliate");
}
if ((affiliateOfferCount > 0) !== (affiliatePolicy.current_status === "active")) {
  throw new Error("Affiliate policy status does not match active product offers");
}

console.log(`Data check passed: ${products.length} products in ${families.size} families, ${collections.length} collections, ${archetypes.length} sauna types, ${planningGuides.length + 1} sourced guides, ${merchants.length} merchants, ${affiliatePrograms.length} affiliate candidates, ${affiliateOfferCount} active affiliate links, ${requiredLaunchGates.length - blockingLaunchGates.length}/${requiredLaunchGates.length} launch gates ready, ${sourceQueue.length} queued sources, ${explicitVoltageProducts.length} explicit voltage records, ${voltageNeutralProducts.length} voltage-neutral records.`);
