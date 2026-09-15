import assert from "node:assert/strict";
import test from "node:test";

import {
  getUsConfigurationsForProduct,
  getUsProductBySlug,
  getUsResearchProducts,
  getUsSources,
} from "../../lib/us/catalog.ts";
import { getUsProductEditorial } from "../../lib/us/content.ts";
import readinessPlan from "../../docs/us/indexing-readiness.json" with { type: "json" };

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

test("candidate products stay out of the public lookup while the first wave is public", () => {
  for (const product of getUsResearchProducts()) {
    if (product.publication_status === "candidate") assert.equal(getUsProductBySlug(product.slug), undefined);
    else assert.equal(getUsProductBySlug(product.slug)?.id, product.id);
  }
});

test("every first-wave product has distinct source-bound decision copy", () => {
  const headings = new Set();
  const summaries = new Set();
  const copyByProduct = [];
  const prohibitedPatterns = [
    /this research record describes/i,
    /is recorded as/i,
    /in summary/i,
    /first .{0,50} then /i,
  ];

  for (const productId of readinessPlan.first_wave.product_ids) {
    const product = getUsResearchProducts().find((entry) => entry.id === productId);
    assert(product, `${productId} is missing`);
    const editorial = getUsProductEditorial(productId, { includeNonPublic: true });
    assert(editorial, `${productId} has no product-specific editorial record`);
    assert(editorial.summary.length >= 80 && editorial.summary.length <= 160, `${productId} has an unsuitable meta summary length`);
    assert.equal(headings.has(editorial.heading), false, `${productId} repeats an editorial heading`);
    assert.equal(summaries.has(editorial.summary), false, `${productId} repeats a meta summary`);
    headings.add(editorial.heading);
    summaries.add(editorial.summary);

    const supportedSourceIds = new Set([
      ...product.source_ids,
      ...getUsConfigurationsForProduct(productId).flatMap((configuration) => configuration.source_ids),
    ]);
    assert(editorial.source_ids.length > 0, `${productId} has no editorial source`);
    assert(editorial.source_ids.every((sourceId) => supportedSourceIds.has(sourceId)), `${productId} cites a source outside its exact product record`);

    const copy = [editorial.summary, ...editorial.paragraphs, ...editorial.decision_points, ...editorial.limitations].join(" ");
    assert(prohibitedPatterns.every((pattern) => !pattern.test(copy)), `${productId} contains a prohibited stock phrase`);
    copyByProduct.push({ productId, copy });
  }

  const shingles = (copy) => {
    const words = copy.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/);
    return new Set(words.slice(0, -3).map((_, index) => words.slice(index, index + 4).join(" ")));
  };
  for (let leftIndex = 0; leftIndex < copyByProduct.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < copyByProduct.length; rightIndex += 1) {
      const left = shingles(copyByProduct[leftIndex].copy);
      const right = shingles(copyByProduct[rightIndex].copy);
      const intersection = [...left].filter((entry) => right.has(entry)).length;
      const similarity = intersection / new Set([...left, ...right]).size;
      assert(similarity < 0.2, `${copyByProduct[leftIndex].productId} and ${copyByProduct[rightIndex].productId} repeat too much four-word phrasing`);
    }
  }
});
