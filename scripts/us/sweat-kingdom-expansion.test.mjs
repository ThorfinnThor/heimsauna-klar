import assert from "node:assert/strict";
import test from "node:test";

import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import mappingsDocument from "../../data/us/mappings.json" with { type: "json" };
import offersDocument from "../../data/us/offers.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import programsDocument from "../../data/us/programs.json" with { type: "json" };
import sourcesDocument from "../../data/us/sources.json" with { type: "json" };
import editorialDocument from "../../content/us/product-editorial.json" with { type: "json" };

const sweatProducts = productsDocument.products.filter((product) => product.brand_name === "Sweat Kingdom");
const publishedSweatProducts = sweatProducts.filter((product) => product.publication_status === "published");
const candidateSweatProducts = sweatProducts.filter((product) => product.publication_status === "candidate");
const sweatOffers = offersDocument.offers.filter((offer) => offer.merchant_id === "sweat-kingdom");
const configurationById = new Map(configurationsDocument.configurations.map((entry) => [entry.id, entry]));
const sourceIds = new Set(sourcesDocument.sources.map((entry) => entry.id));
const editorialByProductId = new Map(editorialDocument.entries.map((entry) => [entry.product_id, entry]));
const mappingByConfigurationId = new Map(mappingsDocument.mappings.filter((entry) => entry.merchant_id === "sweat-kingdom").map((entry) => [entry.configuration_id, entry]));

test("all reviewed Sweat Kingdom products have exact source, editorial and configuration records", () => {
  assert.equal(publishedSweatProducts.length, 17);
  assert.equal(candidateSweatProducts.length, 2);
  for (const product of publishedSweatProducts) {
    assert.equal(product.publication_status, "published");
    assert.equal(product.source_ids.length, 1);
    assert.equal(sourceIds.has(product.source_ids[0]), true, `${product.id} source is missing`);
    assert.equal(product.configuration_ids.length, 1);
    const configuration = configurationById.get(product.configuration_ids[0]);
    assert.equal(configuration?.product_id, product.id);
    assert.equal(configuration?.publication_status, "published");
    assert.equal(editorialByProductId.get(product.id)?.status, "published");
  }
});

test("each Sweat Kingdom offer keeps its Awin IDs and exact merchant destination", () => {
  const program = programsDocument.programs.find((entry) => entry.id === "awin-sweat-kingdom-us");
  assert.equal(program?.relationship_status, "approved");
  assert.equal(sweatOffers.length, 17);

  for (const offer of sweatOffers) {
    assert.equal(offer.program_id, program.id);
    assert.equal(offer.promotion_status, "eligible");
    const tracking = new URL(offer.affiliate_url);
    assert.equal(tracking.hostname, "www.awin1.com");
    assert.equal(tracking.searchParams.get("awinmid"), "125462");
    assert.equal(tracking.searchParams.get("awinaffid"), "3037577");
    assert.equal(tracking.searchParams.get("ued"), offer.destination_url);
    assert.equal(new URL(offer.destination_url).hostname, "sweatkingdom.com");
    assert.equal(mappingByConfigurationId.get(offer.configuration_id)?.external_product_id, offer.external_product_id);
  }
});

test("the reviewed affiliate links use distinct click references", () => {
  const clickrefs = sweatOffers.map((offer) => new URL(offer.affiliate_url).searchParams.get("clickref"));
  assert.equal(new Set(clickrefs).size, 17);
  assert(clickrefs.every((value) => value?.startsWith("us-") && value.length <= 30));
});
