import assert from "node:assert/strict";
import test from "node:test";

import {
  getUsConfigurationsForProduct,
  getUsProductBySlug,
  getUsResearchProducts,
  getUsSources,
} from "../../lib/us/catalog.ts";

test("every research product resolves to its own configuration and source", () => {
  for (const product of getUsResearchProducts()) {
    assert.equal(getUsProductBySlug(product.slug, { includeNonPublic: true })?.id, product.id);
    const configurations = getUsConfigurationsForProduct(product.id);
    assert(configurations.length > 0, `${product.id} has no configuration`);
    assert(configurations.every((configuration) => configuration.product_id === product.id));
    assert(configurations.some((configuration) => configuration.electrical_supply_options.length > 0));
    const sourceIds = [...new Set([...product.source_ids, ...configurations.flatMap((entry) => entry.source_ids)])];
    assert.equal(getUsSources(sourceIds).length, sourceIds.length);
  }
});

test("candidate products never resolve through the public product lookup", () => {
  for (const product of getUsResearchProducts()) {
    assert.equal(product.publication_status, "candidate");
    assert.equal(getUsProductBySlug(product.slug), undefined);
  }
});
