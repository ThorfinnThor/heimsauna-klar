import assert from "node:assert/strict";
import test from "node:test";

import {
  confirmedUsLanguageAlternates,
  evaluateUsSeoDecision,
  getUsSeoDecision,
  getUsSitemapEntries,
} from "../../lib/us/seo.ts";
import {
  usBreadcrumbJsonLd,
  usEditorialJsonLd,
  usProductJsonLd,
} from "../../lib/us/structured-data.ts";
import productsDocument from "../../data/us/products.json" with { type: "json" };
import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import editorialDocument from "../../content/us/editorial.json" with { type: "json" };

const openRelease = { routesEnabled: true, indexingEnabled: true };

test("the checked-in US release exposes no indexable or sitemap routes", () => {
  assert.equal(getUsSeoDecision({ path: "/us/", pageClass: "overview" }).indexable, false);
  assert.deepEqual(getUsSitemapEntries(), []);
});

test("only published substantive pages become indexable in an open release", () => {
  assert.equal(evaluateUsSeoDecision({ path: "/us/saunas/example/", pageClass: "detail", publicationStatus: "published" }, openRelease).indexable, true);
  assert.equal(evaluateUsSeoDecision({ path: "/us/saunas/example/", pageClass: "detail", publicationStatus: "draft" }, openRelease).indexable, false);
  assert.equal(evaluateUsSeoDecision({ path: "/us/saunas/example/", pageClass: "detail", publicationStatus: "published", hasPublishedContent: false }, openRelease).indexable, false);
});

test("finder and other tool routes stay noindex follow after launch", () => {
  const decision = evaluateUsSeoDecision({ path: "/us/sauna-finder/", pageClass: "tool" }, openRelease);
  assert.equal(decision.indexable, false);
  assert.equal(decision.follow, true);
  assert.equal(decision.sitemap, false);
});

test("US canonicals remain self-referential and never fall back to DE", () => {
  const decision = evaluateUsSeoDecision({ path: "/us/guides/electrical/", pageClass: "detail" }, openRelease);
  assert.equal(decision.canonicalPath, "/us/guides/electrical/");
  assert(!decision.canonicalPath.startsWith("/de/"));
});

test("hreflang remains empty until reciprocal equivalence is reviewed", () => {
  assert.deepEqual(confirmedUsLanguageAlternates, {});
  assert.deepEqual(evaluateUsSeoDecision({ path: "/us/", pageClass: "overview" }, openRelease).languageAlternates, {});
});

test("US JSON-LD uses factual records without ratings, reviews or fabricated offers", () => {
  const product = productsDocument.products[0];
  const configuration = configurationsDocument.configurations[0];
  const schema = usProductJsonLd(product, configuration);
  assert.equal(schema["@type"], "Product");
  assert.equal(schema.brand.name, product.brand_name);
  assert.equal("offers" in schema, false);
  assert.equal("aggregateRating" in schema, false);
  assert.equal("review" in schema, false);
  assert.equal("gtin" in schema, false);
});

test("comparison schema is an ItemList and breadcrumb URLs remain in the US section", () => {
  const page = editorialDocument.entries.find((entry) => entry.page_type === "comparison");
  const item = { product: productsDocument.products[0], configuration: configurationsDocument.configurations[0] };
  const schema = usEditorialJsonLd(page, [item], []);
  const breadcrumbs = usBreadcrumbJsonLd([
    { name: "US home", path: "/us/" },
    { name: "Comparison", path: `/us/compare/${page.slug}/` },
  ]);
  assert.equal(schema["@type"], "ItemList");
  assert.equal(schema.numberOfItems, 1);
  assert(breadcrumbs.itemListElement.every((entry) => entry.item.includes("/us/")));
});
