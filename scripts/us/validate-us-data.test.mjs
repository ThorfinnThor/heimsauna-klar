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
          affiliate_url: "https://www.awin1.com/example",
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
      home: { schema_version: 1, market: "US", status: "draft", modules: [] },
      affiliate: { schema_version: 1, market: "US", status: "draft", disclosure: "", principles: [] },
      legal: { schema_version: 1, market: "US", status: "draft", pages: [] },
      pagePresentations: { schema_version: 1, market: "US", status: "draft", entries: [] },
    },
  };
}

test("the checked-in disabled US templates are valid and empty", async () => {
  const bundle = await loadUsBundle();
  assert.doesNotThrow(() => validateUsBundle(bundle));
  assert.equal(bundle.products.products.length, 0);
  assert.equal(bundle.publication.routes_enabled, false);
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
