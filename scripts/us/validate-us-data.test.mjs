import assert from "node:assert/strict";
import test from "node:test";
import { loadUsBundle, validateUsBundle } from "./validate-us-data.mjs";

const unknown = (reason = "Not documented in the reviewed sources") => ({ status: "unknown", reason });
const documented = (value, evidenceId = "evidence-product") => ({ status: "documented", value, evidence_ids: [evidenceId] });

function validBundle() {
  return {
    publication: {
      schema_version: 1,
      market: "US",
      updated_at: "2026-09-13",
      routes_enabled: false,
      indexing_enabled: false,
      affiliate_links_enabled: false,
      feed_sync_enabled: false,
    },
    sources: {
      schema_version: 1,
      market: "US",
      sources: [
        {
          id: "source-product",
          type: "manufacturer-page",
          url: "https://example.com/sauna-a",
          title: "Sauna A",
          publisher: "Example Manufacturer",
          market: "US",
          checked_at: "2026-09-13",
        },
        {
          id: "source-program",
          type: "program-terms",
          url: "https://example.com/affiliate-terms",
          title: "Program terms",
          publisher: "Example Merchant",
          market: "US",
          checked_at: "2026-09-13",
        },
        {
          id: "source-account-approval",
          type: "account-approval",
          url: "https://ui.awin.com/",
          title: "Redacted publisher account approval check",
          publisher: "Awin",
          market: "US",
          checked_at: "2026-09-13",
        },
      ],
      evidence: [
        {
          id: "evidence-product",
          entity_id: "sauna-a",
          field_path: "product_type",
          source_id: "source-product",
          raw_value: "Indoor sauna cabin",
        },
      ],
    },
    products: {
      schema_version: 1,
      market: "US",
      products: [
        {
          id: "sauna-a",
          market: "US",
          slug: "sauna-a",
          brand_name: "Example",
          model: "Sauna A",
          product_type: documented("sauna-cabin"),
          heat_type: documented("traditional"),
          energy_sources: documented(["electric"]),
          placements: documented(["indoor"]),
          form: documented("cabin"),
          configuration_ids: ["sauna-a-standard"],
          source_ids: ["source-product"],
          publication_status: "draft",
          change_reason: "Non-public validator fixture",
        },
      ],
    },
    configurations: {
      schema_version: 1,
      market: "US",
      configurations: [
        {
          id: "sauna-a-standard",
          market: "US",
          product_id: "sauna-a",
          label: "Standard package",
          manufacturer_sku: unknown(),
          capacity: { seated: unknown(), reclining: unknown() },
          dimensions: {
            exterior: unknown(),
            interior: unknown(),
            shipping: unknown(),
            minimum_clearances: unknown(),
          },
          net_weight: unknown(),
          shipping_weight: unknown(),
          materials: unknown(),
          components: [],
          electrical_supply_options: [],
          certification_ids: [],
          warranty_ids: [],
          source_ids: ["source-product"],
          publication_status: "draft",
        },
      ],
      certifications: [],
      warranties: [],
    },
    merchants: {
      schema_version: 1,
      market: "US",
      merchants: [
        {
          id: "example-merchant",
          market: "US",
          name: "Example Merchant",
          kind: "retailer",
          allowed_hosts: ["example.com"],
          status: "active",
        },
      ],
    },
    programs: {
      schema_version: 1,
      market: "US",
      programs: [
        {
          id: "awin-example-us",
          market: "US",
          merchant_id: "example-merchant",
          network: "Awin",
          advertiser_id: "12345",
          relationship_status: "approved",
          allowed_promotion_types: ["content"],
          tracking_hosts: ["awin1.com"],
          deeplink_capable: "yes",
          feed_capable: "unknown",
          terms_checked_at: "2026-09-13",
          source_ids: ["source-program", "source-account-approval"],
        },
      ],
    },
    offers: {
      schema_version: 1,
      market: "US",
      offers: [
        {
          id: "offer-sauna-a",
          market: "US",
          market_product_id: "sauna-a",
          configuration_id: "sauna-a-standard",
          merchant_id: "example-merchant",
          program_id: "awin-example-us",
          destination_url: "https://example.com/sauna-a",
          affiliate_url: "https://www.awin1.com/cread.php?awinmid=12345&awinaffid=3037577&ued=https%3A%2F%2Fexample.com%2Fsauna-a",
          offer_type: "fixed-price",
          price: { amount_minor: 499900, currency: "USD" },
          price_scope: "sauna-kit",
          included_component_ids: [],
          excluded_required_components: [],
          completeness: "unknown",
          condition: "new",
          availability: "in-stock",
          tax_treatment: "calculated-by-merchant",
          delivery_region_ids: [],
          shipping_evidence_ids: [],
          last_successfully_checked_at: "2026-09-13",
          verification_method: "manual",
          promotion_status: "eligible",
        },
      ],
    },
    mappings: {
      schema_version: 1,
      market: "US",
      mappings: [],
    },
    content: {
      navigation: { schema_version: 1, market: "US", status: "draft", items: [] },
      home: {
        schema_version: 1,
        market: "US",
        status: "draft",
        title: "US sauna research",
        description: "Source-based sauna research.",
        eyebrow: "Research preview",
        heading: "Sauna research for US homes.",
        introduction: ["Fixture introduction."],
        sections: [{ id: "scope", heading: "Scope", paragraphs: ["Fixture paragraph."] }],
        source_ids: ["source-product"],
        related_paths: ["/us/saunas/"],
      },
      affiliate: { schema_version: 1, market: "US", status: "draft", disclosure: "", principles: [] },
      legal: { schema_version: 1, market: "US", status: "draft", pages: [] },
      pagePresentations: { schema_version: 1, market: "US", status: "draft", entries: [] },
      editorial: { schema_version: 1, market: "US", status: "draft", entries: [] },
    },
  };
}

test("the checked-in US bundle exposes only the published first wave", async () => {
  const bundle = await loadUsBundle();
  assert.doesNotThrow(() => validateUsBundle(bundle));
  assert.equal(bundle.products.products.length, 285);
  assert.equal(bundle.products.products.filter((product) => product.publication_status === "published").length, 28);
  assert.equal(bundle.products.products.filter((product) => product.publication_status === "candidate").length, 257);
  assert.equal(bundle.offers.offers.length, 17);
  assert.equal(bundle.publication.routes_enabled, true);
  assert.equal(bundle.publication.indexing_enabled, true);
  assert.equal(bundle.publication.affiliate_links_enabled, true);
  assert.equal(bundle.publication.feed_sync_enabled, false);
});

test("a complete non-public pilot-shaped bundle passes", () => {
  assert.doesNotThrow(() => validateUsBundle(validBundle()));
});

test("documented facts without evidence are blocked", () => {
  const bundle = validBundle();
  bundle.products.products[0].heat_type.evidence_ids = [];
  assert.throws(() => validateUsBundle(bundle), /needs at least one evidence reference/);
});

test("US offers in EUR are blocked", () => {
  const bundle = validBundle();
  bundle.offers.offers[0].price.currency = "EUR";
  assert.throws(() => validateUsBundle(bundle), /US offers must use USD/);
});

test("eligible affiliate offers need an approved merchant relationship", () => {
  const bundle = validBundle();
  bundle.programs.programs[0].relationship_status = "pending";
  assert.throws(() => validateUsBundle(bundle), /eligible offers need an approved program relationship/);
});

test("public program terms alone do not prove publisher account approval", () => {
  const bundle = validBundle();
  bundle.programs.programs[0].source_ids = ["source-program"];
  assert.throws(() => validateUsBundle(bundle), /needs account-approval evidence/);
});

test("an offer cannot point to a configuration from another product", () => {
  const bundle = validBundle();
  bundle.offers.offers[0].market_product_id = "missing-product";
  assert.throws(() => validateUsBundle(bundle), /references unknown ID missing-product/);
});

test("an approved program needs an active merchant", () => {
  const bundle = validBundle();
  bundle.merchants.merchants[0].status = "candidate";
  assert.throws(() => validateUsBundle(bundle), /approved relationship needs an active merchant/);
});

test("an eligible offer needs a complete Awin tracking link", () => {
  const bundle = validBundle();
  delete bundle.offers.offers[0].affiliate_url;
  assert.throws(() => validateUsBundle(bundle), /is required for an eligible offer/);

  bundle.offers.offers[0].affiliate_url = "https://www.awin1.com/cread.php?awinmid=99999&awinaffid=3037577";
  assert.throws(() => validateUsBundle(bundle), /approved Awin advertiser ID/);

  bundle.offers.offers[0].affiliate_url = "https://www.awin1.com/cread.php?awinmid=12345";
  assert.throws(() => validateUsBundle(bundle), /Awin publisher ID/);
});

test("affiliate publication needs approved disclosure and program state", () => {
  const bundle = validBundle();
  bundle.publication.routes_enabled = true;
  bundle.publication.affiliate_links_enabled = true;
  assert.throws(() => validateUsBundle(bundle), /published non-empty affiliate disclosure/);

  bundle.content.affiliate.status = "published";
  bundle.content.affiliate.disclosure = "We may earn a commission from marked links.";
  bundle.programs.programs[0].relationship_status = "pending";
  assert.throws(() => validateUsBundle(bundle), /needs at least one approved affiliate program/);
});

test("reviewed editorial pages cannot pass with thin unsourced content", () => {
  const bundle = validBundle();
  bundle.content.pagePresentations.entries = [{
    id: "comparison-matrix",
    page_type: "comparison",
    layout: "matrix",
    module_order: ["selection", "sections", "sources"],
  }];
  bundle.content.editorial.entries = [{
    id: "indoor-saunas",
    page_type: "comparison",
    slug: "indoor-saunas",
    publication_status: "reviewed",
    title: "Indoor saunas",
    description: "Documented indoor sauna configurations.",
    eyebrow: "Comparison",
    heading: "Indoor sauna configurations",
    introduction: [],
    sections: [],
    source_ids: [],
    related_paths: [],
    presentation_id: "comparison-matrix",
    selection: { placements: ["indoor"] },
  }];
  assert.throws(() => validateUsBundle(bundle), /reviewed content needs an introduction/);
});

test("US home content cannot remain an empty module shell", () => {
  const bundle = validBundle();
  bundle.content.home.sections = [];
  assert.throws(() => validateUsBundle(bundle), /content\.home\.sections.*substantive section/);
});

test("editorial product links must resolve to known US records", () => {
  const bundle = validBundle();
  bundle.content.pagePresentations.entries = [{
    id: "guide-briefing",
    page_type: "guide",
    layout: "briefing",
    module_order: ["sections", "catalog", "sources"],
  }];
  bundle.content.editorial.entries = [{
    id: "electrical-guide",
    page_type: "guide",
    slug: "electrical-guide",
    publication_status: "draft",
    title: "Electrical guide",
    description: "A source-based guide to documented electrical requirements.",
    eyebrow: "Guide",
    heading: "Electrical requirements",
    introduction: ["Fixture copy."],
    sections: [{ id: "requirements", heading: "Requirements", paragraphs: ["Fixture copy."] }],
    source_ids: ["source-product"],
    related_paths: [],
    presentation_id: "guide-briefing",
    linked_product_ids: ["missing-product"],
  }];
  assert.throws(() => validateUsBundle(bundle), /references unknown ID missing-product/);
});
