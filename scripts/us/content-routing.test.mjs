import assert from "node:assert/strict";
import test from "node:test";

import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import {
  getUsEditorialPages,
  getUsPresentation,
  getUsTrustPage,
  selectUsBrandConfigurations,
  selectUsComparisonConfigurations,
  selectUsGuideConfigurations,
  usEditorialPath,
} from "../../lib/us/content.ts";
import affiliateDocument from "../../content/us/affiliate.json" with { type: "json" };

const basePage = {
  id: "fixture-page",
  slug: "fixture-page",
  publication_status: "draft",
  title: "Fixture page",
  description: "A fixture used only by the content-routing tests.",
  eyebrow: "Fixture",
  heading: "Fixture heading",
  introduction: ["Fixture introduction."],
  sections: [{ id: "fixture-section", heading: "Fixture section", paragraphs: ["Fixture paragraph."] }],
  source_ids: ["peak-shasta-product"],
  related_paths: [],
  presentation_id: "us-comparison-matrix",
};

test("the checked-in editorial manifest creates no public SEO pages", () => {
  assert.deepEqual(getUsEditorialPages(), []);
  const comparisonPages = getUsEditorialPages("comparison", { includeNonPublic: true });
  assert.deepEqual(comparisonPages.map((page) => page.slug), ["indoor-infrared-saunas"]);
  assert(comparisonPages.every((page) => page.publication_status === "reviewed"));
});

test("trust-page and affiliate drafts are complete without becoming public", () => {
  const slugs = ["contact", "methodology", "affiliate-disclosure", "privacy"];
  assert(slugs.every((slug) => getUsTrustPage(slug) === undefined));
  for (const slug of slugs) {
    const page = getUsTrustPage(slug, { includeNonPublic: true });
    assert(page);
    assert.equal(page.publication_status, "draft");
    assert(page.introduction.length > 0);
    assert(page.sections.length > 0);
    assert.equal(page.contact_email, "info@selectyoursauna.com");
  }
  assert.equal(affiliateDocument.status, "draft");
  assert(affiliateDocument.disclosure.length > 0);
});

test("editorial paths are derived from the page type and stable slug", () => {
  assert.equal(usEditorialPath({ page_type: "comparison", slug: "indoor-infrared-saunas" }), "/us/compare/indoor-infrared-saunas/");
  assert.equal(usEditorialPath({ page_type: "brand", slug: "jnh-lifestyles" }), "/us/brands/jnh-lifestyles/");
  assert.equal(usEditorialPath({ page_type: "guide", slug: "sauna-electrical-requirements" }), "/us/guides/sauna-electrical-requirements/");
});

test("a structured comparison deterministically selects the seven documented indoor two-seat 120 V pilot configurations", () => {
  const page = {
    ...basePage,
    page_type: "comparison",
    selection: {
      product_types: ["sauna-cabin"],
      heat_types: ["infrared"],
      placements: ["indoor"],
      minimum_seated_capacity: 2,
      voltages_v: [120],
    },
  };
  const selected = selectUsComparisonConfigurations(page, {
    includeNonPublic: true,
    products: [...productsDocument.products].reverse(),
    configurations: [...configurationsDocument.configurations].reverse(),
  });
  assert.deepEqual(selected.map((entry) => entry.product.id), ["jnh-tosi-2", "jnh-tosi-4", "peak-crown", "peak-everest", "peak-fuji", "sun-home-eclipse-2", "sun-home-equinox"]);
});

test("candidate records cannot appear in a public comparison", () => {
  const page = { ...basePage, page_type: "comparison", selection: { placements: ["indoor"] } };
  assert.deepEqual(selectUsComparisonConfigurations(page, {
    products: productsDocument.products,
    configurations: configurationsDocument.configurations,
  }), []);
});

test("brand pages use exact brand identity rather than a partial name", () => {
  const page = { ...basePage, page_type: "brand", presentation_id: "us-brand-profile", brand_name: "JNH Lifestyles" };
  const selected = selectUsBrandConfigurations(page, {
    includeNonPublic: true,
    products: productsDocument.products,
    configurations: configurationsDocument.configurations,
  });
  assert.equal(selected.length, 4);
  assert(selected.every((entry) => entry.product.brand_name === "JNH Lifestyles"));
});

test("guide product modules require explicit product IDs", () => {
  const withoutProducts = { ...basePage, page_type: "guide", presentation_id: "us-guide-briefing" };
  assert.deepEqual(selectUsGuideConfigurations(withoutProducts, { includeNonPublic: true }), []);
  const withProducts = { ...withoutProducts, linked_product_ids: ["peak-everest"] };
  assert.deepEqual(
    selectUsGuideConfigurations(withProducts, {
      includeNonPublic: true,
      products: productsDocument.products,
      configurations: configurationsDocument.configurations,
    }).map((entry) => entry.product.id),
    ["peak-everest"],
  );
});

test("comparison, brand and guide presentations have distinct layouts and module orders", () => {
  const comparison = getUsPresentation("us-comparison-matrix", "comparison");
  const brand = getUsPresentation("us-brand-profile", "brand");
  const guide = getUsPresentation("us-guide-briefing", "guide");
  assert.equal(comparison?.layout, "matrix");
  assert.equal(brand?.layout, "profile");
  assert.equal(guide?.layout, "briefing");
  assert.equal(new Set([comparison?.module_order.join(","), brand?.module_order.join(","), guide?.module_order.join(",")]).size, 3);
});
