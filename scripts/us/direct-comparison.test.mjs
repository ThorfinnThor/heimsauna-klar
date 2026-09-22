import assert from "node:assert/strict";
import test from "node:test";

import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import {
  buildUsDirectComparisonOptions,
  normalizeUsDirectComparisonSelection,
  readUsDirectComparisonSelection,
  serializeUsDirectComparisonSelection,
} from "../../lib/us/direct-comparison.ts";

const options = buildUsDirectComparisonOptions(productsDocument.products, configurationsDocument.configurations);
const optionIds = options.map((option) => option.configurationId);

test("the direct comparison exposes every pilot configuration once", () => {
  assert.equal(options.length, 289);
  assert.equal(new Set(optionIds).size, 289);
  for (const option of options) {
    const configuration = configurationsDocument.configurations.find((entry) => entry.id === option.configurationId);
    assert.equal(option.productId, configuration?.product_id);
    assert.notEqual(option.configurationLabel, "Not documented");
  }
});

test("the direct comparison rejects cross-market and mismatched records", () => {
  const foreignProduct = { ...productsDocument.products[0], id: "fixture-foreign", market: "DE", configuration_ids: ["fixture-foreign-config"] };
  const foreignConfiguration = { ...configurationsDocument.configurations[0], id: "fixture-foreign-config", market: "DE", product_id: "fixture-foreign" };
  const mismatchedConfiguration = { ...configurationsDocument.configurations[0], id: "fixture-mismatch" };
  assert.deepEqual(buildUsDirectComparisonOptions([foreignProduct], [foreignConfiguration]), []);
  assert.deepEqual(buildUsDirectComparisonOptions(productsDocument.products, [mismatchedConfiguration]), []);
});

test("URL selections keep known unique configurations and stop at four", () => {
  const input = [optionIds[0], "unknown", optionIds[0], ...optionIds.slice(1, 6)];
  assert.deepEqual(normalizeUsDirectComparisonSelection(input, optionIds), optionIds.slice(0, 4));
});

test("a two-to-four model selection survives a URL round trip", () => {
  const selected = [optionIds[3], optionIds[1], optionIds[7]];
  const serialized = serializeUsDirectComparisonSelection(selected);
  assert.deepEqual(serialized.getAll("model"), selected);
  assert.deepEqual(readUsDirectComparisonSelection(serialized, optionIds), selected);
});
