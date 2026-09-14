import assert from "node:assert/strict";
import test from "node:test";

import {
  getUsAffiliateOffersForConfiguration,
  resolveUsAffiliateLink,
  resolveUsOfferPresentations,
} from "../../lib/us/affiliate.ts";

function approvedFixture() {
  const affiliateUrl = "https://www.awin1.com/cread.php?awinmid=12345&awinaffid=3037577&clickref=us-product&ued=https%3A%2F%2Fexample.com%2Fsauna-a%3Fvariant%3Dcedar";
  return {
    offer: {
      id: "offer-sauna-a",
      market: "US",
      market_product_id: "sauna-a",
      configuration_id: "sauna-a-standard",
      merchant_id: "example-merchant",
      program_id: "awin-example-us",
      destination_url: "https://example.com/sauna-a?variant=cedar",
      affiliate_url: affiliateUrl,
      offer_type: "fixed-price",
      price: { amount_minor: 499900, currency: "USD" },
      price_scope: "sauna-kit",
      included_component_ids: [],
      excluded_required_components: [],
      completeness: "documented",
      condition: "new",
      availability: "in-stock",
      tax_treatment: "calculated-by-merchant",
      delivery_region_ids: [],
      shipping_evidence_ids: [],
      last_successfully_checked_at: "2026-09-13",
      verification_method: "manual",
      promotion_status: "eligible",
    },
    merchant: {
      id: "example-merchant",
      market: "US",
      name: "Example Merchant",
      kind: "retailer",
      allowed_hosts: ["example.com"],
      status: "active",
    },
    program: {
      id: "awin-example-us",
      market: "US",
      merchant_id: "example-merchant",
      network: "Awin",
      advertiser_id: "12345",
      relationship_status: "approved",
      allowed_promotion_types: ["content"],
      tracking_hosts: ["awin1.com"],
      deeplink_capable: "yes",
      feed_capable: "yes",
      terms_checked_at: "2026-09-13",
      source_ids: ["program-terms", "account-approval"],
    },
    placement: "product-detail",
    publicationEnabled: true,
    emergencyDisabled: false,
    disclosureApproved: true,
    productPublished: true,
    configurationPublished: true,
    asOf: "2026-09-14",
    affiliateUrl,
  };
}

test("the checked-in US pilot exposes no affiliate links", () => {
  assert.deepEqual(getUsAffiliateOffersForConfiguration("peak-shasta-standard"), []);
});

test("a fully approved link retains its destination and tracking parameters", () => {
  const fixture = approvedFixture();
  const result = resolveUsAffiliateLink(fixture);
  assert.equal(result.eligible, true);
  if (!result.eligible) return;
  assert.equal(result.href, fixture.affiliateUrl);
  assert.equal(new URL(result.href).searchParams.get("clickref"), "us-product");
  assert.equal(new URL(result.href).searchParams.get("ued"), "https://example.com/sauna-a?variant=cedar");
  assert.equal(result.rel, "sponsored nofollow noopener noreferrer");
  assert.equal(result.target, "_blank");
  assert.equal(result.prefetch, false);
});

test("two offers for one configuration remain separate with their own package scope", () => {
  const first = approvedFixture();
  const second = structuredClone(first);
  second.offer.id = "offer-sauna-a-complete-package";
  second.offer.price_scope = "configured-sauna-package";
  second.offer.price.amount_minor = 579900;
  second.offer.destination_url = "https://example.com/sauna-a?variant=complete";
  second.offer.affiliate_url = "https://www.awin1.com/cread.php?awinmid=12345&awinaffid=3037577&clickref=us-product-complete&ued=https%3A%2F%2Fexample.com%2Fsauna-a%3Fvariant%3Dcomplete";

  const presentations = resolveUsOfferPresentations({
    configurationId: "sauna-a-standard",
    placement: "product-detail",
    asOf: "2026-09-14",
    publicationEnabled: true,
    emergencyDisabled: false,
    disclosureApproved: true,
    products: [{
      id: "sauna-a",
      market: "US",
      slug: "sauna-a",
      brand_name: "Fixture",
      model: "Sauna A",
      product_type: { status: "unknown", reason: "Fixture" },
      heat_type: { status: "unknown", reason: "Fixture" },
      energy_sources: { status: "unknown", reason: "Fixture" },
      placements: { status: "unknown", reason: "Fixture" },
      form: { status: "unknown", reason: "Fixture" },
      configuration_ids: ["sauna-a-standard"],
      source_ids: [],
      publication_status: "published",
      change_reason: "Synthetic unit-test fixture",
    }],
    configurations: [{
      id: "sauna-a-standard",
      market: "US",
      product_id: "sauna-a",
      label: "Standard",
      manufacturer_sku: { status: "unknown", reason: "Fixture" },
      capacity: { seated: { status: "unknown", reason: "Fixture" }, reclining: { status: "unknown", reason: "Fixture" } },
      dimensions: {
        exterior: { status: "unknown", reason: "Fixture" },
        interior: { status: "unknown", reason: "Fixture" },
        shipping: { status: "unknown", reason: "Fixture" },
        minimum_clearances: { status: "unknown", reason: "Fixture" },
      },
      net_weight: { status: "unknown", reason: "Fixture" },
      shipping_weight: { status: "unknown", reason: "Fixture" },
      materials: { status: "unknown", reason: "Fixture" },
      components: [],
      electrical_supply_options: [],
      certification_ids: [],
      warranty_ids: [],
      source_ids: [],
      publication_status: "published",
    }],
    merchants: [first.merchant],
    programs: [first.program],
    offers: [first.offer, second.offer],
  });

  assert.deepEqual(presentations.map(({ offer }) => [offer.id, offer.price_scope]), [
    ["offer-sauna-a", "sauna-kit"],
    ["offer-sauna-a-complete-package", "configured-sauna-package"],
  ]);
  assert(presentations.every(({ link }) => link?.href.startsWith("https://www.awin1.com/")));
});

for (const [name, mutate, reason] of [
  ["publication switch", (fixture) => { fixture.publicationEnabled = false; }, "publication-disabled"],
  ["emergency kill switch", (fixture) => { fixture.emergencyDisabled = true; }, "emergency-disabled"],
  ["unapproved disclosure", (fixture) => { fixture.disclosureApproved = false; }, "disclosure-not-approved"],
  ["candidate product", (fixture) => { fixture.productPublished = false; }, "product-not-published"],
  ["candidate configuration", (fixture) => { fixture.configurationPublished = false; }, "configuration-not-published"],
  ["inactive offer", (fixture) => { fixture.offer.promotion_status = "inactive"; }, "offer-not-eligible"],
  ["stale offer", (fixture) => { fixture.offer.last_successfully_checked_at = "2026-08-01"; }, "offer-stale"],
  ["unavailable offer", (fixture) => { fixture.offer.availability = "out-of-stock"; }, "offer-unavailable"],
  ["unknown availability", (fixture) => { fixture.offer.availability = "unknown"; }, "offer-availability-unverified"],
  ["invalid check date", (fixture) => { fixture.offer.last_successfully_checked_at = "not-a-date"; }, "offer-date-invalid"],
  ["future check date", (fixture) => { fixture.offer.last_successfully_checked_at = "2026-09-15"; }, "offer-check-in-future"],
  ["inactive merchant", (fixture) => { fixture.merchant.status = "inactive"; }, "merchant-not-active"],
  ["pending program", (fixture) => { fixture.program.relationship_status = "pending"; }, "program-not-approved"],
  ["wrong merchant", (fixture) => { fixture.program.merchant_id = "another-merchant"; }, "program-merchant-mismatch"],
  ["disallowed promotion", (fixture) => { fixture.program.allowed_promotion_types = ["email"]; }, "promotion-not-allowed"],
  ["foreign destination", (fixture) => { fixture.offer.destination_url = "https://lookalike.example/sauna-a"; }, "destination-not-allowed"],
  ["missing affiliate URL", (fixture) => { delete fixture.offer.affiliate_url; }, "affiliate-url-missing"],
  ["foreign tracking host", (fixture) => { fixture.offer.affiliate_url = fixture.offer.affiliate_url.replace("awin1.com", "example.net"); }, "tracking-host-not-allowed"],
  ["wrong Awin advertiser", (fixture) => { fixture.offer.affiliate_url = fixture.offer.affiliate_url.replace("awinmid=12345", "awinmid=99999"); }, "awin-tracking-invalid"],
]) {
  test(`${name} blocks affiliate output`, () => {
    const fixture = approvedFixture();
    mutate(fixture);
    const result = resolveUsAffiliateLink(fixture);
    assert.deepEqual(result, { eligible: false, href: null, reason });
  });
}
