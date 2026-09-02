import { readFile, writeFile } from "node:fs/promises";

const paths = {
  products: new URL("../data/products.json", import.meta.url),
  overrides: new URL("../data/product-editorial-overrides.json", import.meta.url),
  input: new URL("../data/awin-expansion-import-26.json", import.meta.url),
  drafts: new URL("../data/awin-expansion-product-drafts-26.json", import.meta.url),
  review: new URL("../data/awin-expansion-sol-review-26.json", import.meta.url),
  editorial: new URL("../data/awin-expansion-editorial-26.json", import.meta.url),
  publication: new URL("../data/awin-expansion-publication-21.json", import.meta.url),
  readiness: new URL("../data/launch-readiness.json", import.meta.url),
  powerEvidence: new URL("../data/power-evidence.json", import.meta.url),
};

const [products, overrides, input, drafts, review, editorial, publication, readiness, powerEvidence] = await Promise.all(
  Object.values(paths).map(async (path) => JSON.parse(await readFile(path, "utf8"))),
);

for (const duplicateId of publication.removed_duplicate_product_ids ?? []) {
  const index = products.findIndex((product) => product.product_id === duplicateId);
  if (index !== -1) products.splice(index, 1);
  delete overrides.entries[duplicateId];
}

const decisionsByCandidate = new Map(review.decisions.map((entry) => [entry.candidate_id, entry]));
const inputByCandidate = new Map(input.entries.map((entry) => [entry.candidate_id, entry]));
const editorialByCandidate = new Map(editorial.entries.map((entry) => [entry.candidate_id, entry]));
const draftsById = new Map(drafts.products.map((product) => [product.product_id, product]));
const publishedById = new Map(products.map((product) => [product.product_id, product]));

const verifiedCandidates = review.decisions
  .filter((entry) => entry.decision === "data-verified")
  .map((entry) => entry.candidate_id)
  .sort();
const publicationCandidates = publication.entries.map((entry) => entry.candidate_id).sort();

if (JSON.stringify(verifiedCandidates) !== JSON.stringify(publicationCandidates)) {
  throw new Error("Publication manifest must contain every data-verified candidate and no held candidate");
}

let added = 0;
let enriched = 0;
for (const entry of publication.entries) {
  const decision = decisionsByCandidate.get(entry.candidate_id);
  const candidate = inputByCandidate.get(entry.candidate_id);
  const editorialEntry = editorialByCandidate.get(entry.candidate_id);
  const draft = draftsById.get(entry.product_id);

  if (!decision || decision.decision !== "data-verified") throw new Error(`${entry.candidate_id} is not data-verified`);
  if (!candidate || candidate.promotion_blocker) throw new Error(`${entry.candidate_id} still has a promotion blocker`);
  if (!editorialEntry?.summary || !entry.detail) throw new Error(`${entry.candidate_id} lacks individual product copy`);
  if (!draft) throw new Error(`${entry.candidate_id} references missing draft ${entry.product_id}`);
  if (!draft.sources.some((source) => source.type === "manufacturer")) {
    throw new Error(`${entry.candidate_id} lacks a manufacturer or own-brand source`);
  }

  const existing = publishedById.get(entry.product_id);
  if (!existing) {
    const promoted = structuredClone(draft);
    promoted.status = "verified";
    products.push(promoted);
    publishedById.set(entry.product_id, promoted);
    added += 1;
  } else {
    assertSameCoreProduct(existing, draft, entry.candidate_id);
    for (const offer of draft.commercial.offers) {
      if (!existing.commercial.offers.some((current) => normalizeUrl(current.url) === normalizeUrl(offer.url))) {
        existing.commercial.offers.push(structuredClone(offer));
      }
    }
    for (const source of draft.sources) {
      if (!existing.sources.some((current) => normalizeUrl(current.url) === normalizeUrl(source.url))) {
        existing.sources.push(structuredClone(source));
      }
    }
    existing.updated_at = publication.created_at;
    enriched += 1;
  }

  overrides.entries[entry.product_id] = {
    intro: editorialEntry.summary,
    detail: entry.detail,
  };
}

overrides.updated_at = publication.created_at;
input.publication_status = "partially-published";
input.published_candidate_ids = publication.entries.map((entry) => entry.candidate_id);
review.summary.public_catalog_change = publication.summary.new_products;
review.publication_gate = {
  status: "published",
  reason: `${publication.entries.length} datenfachlich bestätigte Modelle wurden mit individuellen Produkttexten freigegeben. Die fünf Varianten mit offenen Zuordnungs- oder Quellenfragen bleiben intern gesperrt.`,
};
drafts.publication_status = "reference-snapshot";
drafts.note = "Interner Prüfsnapshot aller 26 Kandidaten. Die im Publikationsmanifest genannten 21 Modelle sind freigegeben; fünf gesperrte Varianten bleiben ausschließlich in diesem Entwurf erhalten.";
drafts.review_summary = review.summary;
readiness.updated_at = publication.created_at;
const catalogQualityGate = readiness.gates.find((gate) => gate.id === "catalog_quality");
if (!catalogQualityGate) throw new Error("Launch readiness lacks the catalog quality gate");
catalogQualityGate.detail = `${products.filter((product) => product.status === "verified").length} eindeutige Produktdatensätze werden bei jedem Build gegen Quellen-, Preis-, Händler- und Schemakriterien geprüft.`;
const voltageNeutralProducts = products.filter((product) => product.power.voltage === "none");
powerEvidence.updated_at = publication.created_at;
powerEvidence.snapshot = {
  products: products.length,
  explicit_voltage: {
    "120": products.filter((product) => product.power.voltage === 120).length,
    "230": products.filter((product) => product.power.voltage === 230).length,
    "400": products.filter((product) => product.power.voltage === 400).length,
  },
  voltage_not_assigned: voltageNeutralProducts.length,
  no_oven_or_unconfigured: voltageNeutralProducts.filter((product) => product.power.kw === null).length,
  electric_heater_voltage_unstated: voltageNeutralProducts.filter((product) => product.power.kw !== null).length,
};

await Promise.all([
  writeJson(paths.products, products),
  writeJson(paths.overrides, overrides),
  writeJson(paths.input, input),
  writeJson(paths.review, review),
  writeJson(paths.drafts, drafts),
  writeJson(paths.readiness, readiness),
  writeJson(paths.powerEvidence, powerEvidence),
]);

console.log(`Awin expansion promotion complete: ${added} products added, ${enriched} existing products checked or enriched, ${publication.entries.length} individual overrides present.`);

function normalizeUrl(value) {
  const url = new URL(value);
  url.hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}

function assertSameCoreProduct(existing, draft, candidateId) {
  const comparable = (product) => ({
    category: product.category,
    dimensions_cm: product.dimensions_cm,
    maximum_people: product.people.max,
    voltage: product.power.voltage,
    kw: product.power.kw,
    indoor_outdoor: product.sauna.indoor_outdoor,
  });
  if (JSON.stringify(comparable(existing)) !== JSON.stringify(comparable(draft))) {
    throw new Error(`${candidateId} conflicts with the existing public product ${existing.product_id}`);
  }
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
