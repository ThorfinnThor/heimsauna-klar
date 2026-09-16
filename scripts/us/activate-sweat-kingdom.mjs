import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");

const [products, configurations, sources, merchants, programs, offers, mappings, affiliate, legal, publication] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("data/us/merchants.json"),
  readJson("data/us/programs.json"),
  readJson("data/us/offers.json"),
  readJson("data/us/mappings.json"),
  readJson("content/us/affiliate.json"),
  readJson("content/us/legal.json"),
  readJson("data/us/publication.json"),
]);

const productId = "sweat-kingdom-sweat-cabin";
const configurationId = `${productId}-standard`;
const merchantId = "sweat-kingdom";
const programId = "awin-sweat-kingdom-us";
const sourceIds = {
  product: "sweat-cabin-product",
  profile: "awin-sweat-kingdom-profile",
  terms: "awin-sweat-kingdom-terms",
  approval: "awin-sweat-kingdom-account-approval",
};
const evidenceIds = {
  product: "evidence-sweat-cabin-product",
  configuration: "evidence-sweat-cabin-configuration",
  electrical: "evidence-sweat-cabin-electrical",
};

const destinationUrl = "https://sweatkingdom.com/products/the-sweat-cabin";
const affiliateUrl = "https://www.awin1.com/cread.php?awinmid=125462&awinaffid=3037577&clickref=us-sweat-cabin&ued=https%3A%2F%2Fsweatkingdom.com%2Fproducts%2Fthe-sweat-cabin";

function upsert(entries, id, value) {
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) entries.push(value);
  else entries[index] = { ...entries[index], ...value };
}

upsert(sources.sources, sourceIds.terms, {
  id: sourceIds.terms,
  type: "program-terms",
  url: "https://ui.awin.com/merchant-profile-terms/125462",
  title: "Sweat Kingdom Saunas Awin program terms",
  publisher: "Awin",
  market: "US",
  checked_at: today,
  locator: "Commission schedule and publisher terms",
});
upsert(sources.sources, sourceIds.approval, {
  id: sourceIds.approval,
  type: "account-approval",
  url: "https://ui.awin.com/merchant-profile/125462",
  title: "Sweat Kingdom Saunas publisher account approval",
  publisher: "Awin publisher account",
  market: "US",
  checked_at: today,
  notes: "The site owner confirmed acceptance of the publisher application on 2026-09-16. The public profile identifies the advertiser; account status is not exposed in the public profile.",
});

upsert(sources.evidence, evidenceIds.product, {
  id: evidenceIds.product,
  entity_id: productId,
  source_id: sourceIds.product,
  field_path: "product_identity",
  raw_value: "The Sweat Cabin (4 Person), traditional sauna for indoor and outdoor use.",
});
upsert(sources.evidence, evidenceIds.configuration, {
  id: evidenceIds.configuration,
  entity_id: configurationId,
  source_id: sourceIds.product,
  field_path: "configuration.capacity_dimensions_materials",
  raw_value: "4-person cabin; 6-foot wall exterior 72 × 72.5 × 77 inches; premium red cedar.",
});
upsert(sources.evidence, evidenceIds.electrical, {
  id: evidenceIds.electrical,
  entity_id: configurationId,
  source_id: sourceIds.product,
  field_path: "electrical_supply_options",
  raw_value: "Homecraft Revive 9 kW, 50 A dedicated hardwired connection; voltage is not stated on the reviewed page.",
});

const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });

upsert(products.products, productId, {
  id: productId,
  market: "US",
  slug: productId,
  brand_name: "Sweat Kingdom",
  model: "The Sweat Cabin (4 Person)",
  product_type: documented("sauna-cabin", evidenceIds.product),
  heat_type: documented("traditional", evidenceIds.product),
  energy_sources: documented(["electric"], evidenceIds.electrical),
  placements: documented(["indoor", "outdoor"], evidenceIds.product),
  form: documented("Freestanding red cedar sauna cabin", evidenceIds.product),
  configuration_ids: [configurationId],
  source_ids: [sourceIds.product],
  publication_status: "published",
  spec_checked_at: today,
  next_review_at: "2026-12-15",
  change_reason: "Added after the site owner confirmed the US Awin publisher acceptance; product facts are taken from the official Sweat Kingdom product page.",
});

upsert(configurations.configurations, configurationId, {
  id: configurationId,
  market: "US",
  product_id: productId,
  label: "6-foot wall height · Homecraft Revive 9 kW package",
  manufacturer_sku: unknown("A manufacturer SKU is not stated on the reviewed product page."),
  capacity: {
    seated: documented(4, evidenceIds.configuration),
    reclining: unknown("A reclining capacity is not stated on the reviewed product page."),
  },
  dimensions: {
    exterior: documented({ width: { value: 72, unit: "in" }, depth: { value: 72.5, unit: "in" }, height: { value: 77, unit: "in" } }, evidenceIds.configuration),
    interior: unknown("Interior dimensions are not stated on the reviewed product page."),
    shipping: unknown("Shipping dimensions are not stated on the reviewed product page."),
    minimum_clearances: unknown("Installation clearances require the manufacturer's instructions and site review."),
  },
  net_weight: unknown("Net weight is not stated on the reviewed product page."),
  shipping_weight: unknown("Shipping weight is not stated on the reviewed product page."),
  materials: documented(["Premium red cedar"], evidenceIds.configuration),
  components: [
    { id: `${configurationId}-heater`, component_type: "heater", name: "Homecraft Revive 9 kW heater", inclusion: "included", evidence_ids: [evidenceIds.electrical] },
    { id: `${configurationId}-stones`, component_type: "stones", name: "Sauna stones", inclusion: "included", evidence_ids: [evidenceIds.product] },
  ],
  electrical_supply_options: [{
    id: `${configurationId}-electrical`,
    requirements: [{
      component: "heater",
      voltage_v: unknown("Voltage is not stated on the reviewed product page."),
      frequency_hz: unknown("Frequency is not stated on the reviewed product page."),
      phase: unknown("Phase is not stated on the reviewed product page."),
      rated_power_w: documented(9000, evidenceIds.electrical),
      rated_current_a: documented(50, evidenceIds.electrical),
      required_circuit_a: documented(50, evidenceIds.electrical),
      specified_breaker_a: documented(50, evidenceIds.electrical),
      connection: documented("hardwired", evidenceIds.electrical),
      plug_type: unknown("A plug type does not apply to the stated hardwired connection."),
      dedicated_circuit: documented(true, evidenceIds.electrical),
    }],
    evidence_ids: [evidenceIds.electrical],
  }],
  certification_ids: [],
  warranty_ids: [],
  source_ids: [sourceIds.product],
  publication_status: "published",
});

const merchant = merchants.merchants.find((entry) => entry.id === merchantId);
if (!merchant) throw new Error(`Missing merchant ${merchantId}`);
merchant.status = "active";

const program = programs.programs.find((entry) => entry.id === programId);
if (!program) throw new Error(`Missing program ${programId}`);
Object.assign(program, {
  relationship_status: "approved",
  allowed_promotion_types: ["content", "content-site", "product-detail", "product-comparison", "seo"],
  tracking_hosts: ["awin1.com"],
  deeplink_capable: "yes",
  feed_capable: "unknown",
  terms_checked_at: today,
  source_ids: [sourceIds.profile, sourceIds.terms, sourceIds.approval],
});

upsert(offers.offers, `offer-${productId}`, {
  id: `offer-${productId}`,
  market: "US",
  market_product_id: productId,
  configuration_id: configurationId,
  merchant_id: merchantId,
  program_id: programId,
  external_product_id: "the-sweat-cabin",
  destination_url: destinationUrl,
  affiliate_url: affiliateUrl,
  offer_type: "fixed-price",
  price: { amount_minor: 744500, currency: "USD" },
  price_scope: "sauna-kit",
  included_component_ids: [`${configurationId}-heater`, `${configurationId}-stones`],
  excluded_required_components: [],
  completeness: "incomplete",
  condition: "new",
  availability: "made-to-order",
  tax_treatment: "calculated-by-merchant",
  shipping_summary: "Shipping is calculated at checkout; the product page lists a five-week lead time.",
  delivery_region_ids: [],
  shipping_evidence_ids: [],
  delivery_mode: "curbside-freight",
  last_successfully_checked_at: today,
  last_attempted_at: today,
  verification_method: "manual",
  promotion_status: "eligible",
});

upsert(mappings.mappings, `mapping-${productId}`, {
  id: `mapping-${productId}`,
  market: "US",
  merchant_id: merchantId,
  external_product_id: "the-sweat-cabin",
  configuration_id: configurationId,
  matching_method: "manual",
  reviewer_role: "research",
  reviewed_at: today,
  status: "approved",
  note: "Exact destination URL and product handle match the official Sweat Kingdom product page.",
});

publication.updated_at = today;
publication.affiliate_links_enabled = true;
affiliate.status = "published";
affiliate.disclosure = "Some US product links are affiliate links. When you open a link marked Affiliate link, Select Your Sauna may receive a commission from a qualifying action. The merchant's price does not change.";
affiliate.principles = [
  { title: "Clear labeling", copy: "Affiliate links are marked next to the affected merchant offer before the visitor leaves Select Your Sauna." },
  { title: "Independent comparisons", copy: "Product inclusion, technical facts, filters and ordering are based on documented records, not commission rates." },
  { title: "Exact offer review", copy: "Each active link is checked against the approved program, merchant, configuration, destination and current offer record." },
];

const affiliatePage = legal.pages.find((page) => page.id === "affiliate-disclosure");
if (affiliatePage) {
  affiliatePage.introduction = ["Some US product offers use Awin affiliate links. A qualifying action after a clearly marked click may result in a commission for SeitenHafen361, without changing the price shown by the merchant."];
  affiliatePage.sections = [
    { id: "labeling", heading: "A marked link is the point of attribution", paragraphs: ["A link labelled Affiliate link opens the Awin redirect and then the merchant's product page. No tracking request is loaded in the background."] },
    { id: "editorial-independence", heading: "Commission does not set the comparison result", paragraphs: ["Product inclusion, comparison scope and Finder logic follow the documented product and configuration records. There are no paid rankings or first-hand testing claims."] },
    { id: "scope-and-status", heading: "Offers remain configuration-specific", paragraphs: ["Prices, availability and included components are checked for the exact offer. The merchant's current product page and terms govern the purchase."] },
  ];
}
const trackingSection = legal.pages.find((page) => page.id === "privacy")?.sections.find((section) => section.id === "tracking-and-links");
if (trackingSection) trackingSection.paragraphs = ["The checked-in public client contains no first-party advertising pixel or marketing cookie. External merchant pages open only after a visitor follows a link. A link marked Affiliate link passes through Awin, which can process attribution and request metadata under its own privacy and retention rules."];

await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
  writeJson("data/us/merchants.json", merchants),
  writeJson("data/us/programs.json", programs),
  writeJson("data/us/offers.json", offers),
  writeJson("data/us/mappings.json", mappings),
  writeJson("content/us/affiliate.json", affiliate),
  writeJson("content/us/legal.json", legal),
  writeJson("data/us/publication.json", publication),
]);

console.log(`Activated Sweat Kingdom: ${productId}, ${configurationId}, offer-${productId}.`);
