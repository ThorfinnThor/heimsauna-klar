import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultUsCatalogFilters,
  filterUsCatalogItems,
  normalizeUsCatalogFilters,
} from "../../lib/us/catalog-filter.ts";
import { getUsPublicCatalogItems, getUsResearchCatalogItems } from "../../lib/us/catalog-index.ts";

const researchItems = getUsResearchCatalogItems();

test("the catalog index normalizes all six real pilot products", () => {
  assert.equal(researchItems.length, 6);
  assert(researchItems.every((item) => item.slug && item.brand && item.model));
  assert.deepEqual(researchItems, [...researchItems].sort((a, b) => a.brand.localeCompare(b.brand, "en-US") || a.model.localeCompare(b.model, "en-US")));
});

test("the public catalog excludes all candidate pilot products", () => {
  assert.equal(getUsPublicCatalogItems().length, 0);
});

test("catalog filters keep documented matches deterministic", () => {
  assert.equal(filterUsCatalogItems(researchItems, { ...defaultUsCatalogFilters, placement: "outdoor" }).length, 1);
  assert.equal(filterUsCatalogItems(researchItems, { ...defaultUsCatalogFilters, capacity: "4-plus" }).length, 1);
  assert.equal(filterUsCatalogItems(researchItems, { ...defaultUsCatalogFilters, query: "peak" }).length, 2);
  assert.equal(filterUsCatalogItems(researchItems, { ...defaultUsCatalogFilters, voltage: "120" }).length, 6);
});

test("unknown technical values remain visible without filters and never become hard matches", () => {
  const unknown = {
    id: "unknown-pilot",
    slug: "unknown-pilot",
    brand: "Example",
    model: "Unknown pilot",
    form: null,
    heatType: null,
    placements: null,
    seatedCapacity: null,
    voltages: null,
    exteriorDimensions: null,
  };
  assert.deepEqual(filterUsCatalogItems([unknown], defaultUsCatalogFilters), [unknown]);
  assert.equal(filterUsCatalogItems([unknown], { ...defaultUsCatalogFilters, voltage: "120" }).length, 0);
  assert.equal(filterUsCatalogItems([unknown], { ...defaultUsCatalogFilters, placement: "indoor" }).length, 0);
});

test("unsupported and oversized URL filter values are constrained", () => {
  const normalized = normalizeUsCatalogFilters({
    query: "x".repeat(120),
    placement: "garage",
    capacity: "12",
    voltage: "400",
    brand: "b".repeat(120),
  });
  assert.equal(normalized.query.length, 80);
  assert.equal(normalized.brand.length, 80);
  assert.equal(normalized.placement, "all");
  assert.equal(normalized.capacity, "all");
  assert.equal(normalized.voltage, "all");
});
