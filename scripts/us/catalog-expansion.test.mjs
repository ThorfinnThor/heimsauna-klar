import assert from "node:assert/strict";
import test from "node:test";

import backlog from "../../docs/us/catalog-expansion-backlog.json" with { type: "json" };
import solGate from "../../docs/us/sol-acceptance-gate.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import offersDocument from "../../data/us/offers.json" with { type: "json" };
import sourcesDocument from "../../data/us/sources.json" with { type: "json" };

test("the US expansion backlog is research-only and source-addressable", () => {
  assert.equal(backlog.schema_version, 1);
  assert.equal(backlog.market, "US");
  assert.equal(backlog.autopublish, false);
  assert.equal(backlog.current_catalog.candidate_product_count, productsDocument.products.length);
  assert.equal(backlog.current_catalog.candidate_product_count, productsDocument.products.length);
  assert.equal(backlog.current_catalog.published_product_count, productsDocument.products.filter((product) => product.publication_status === "published").length);
  assert.equal(backlog.current_catalog.active_offer_count, offersDocument.offers.filter((offer) => offer.promotion_status === "eligible").length);
  assert.equal(backlog.current_catalog.minimum_before_sol_acceptance, 100);
  assert.equal(backlog.current_catalog.products_remaining_before_sol_acceptance, Math.max(0, 100 - productsDocument.products.length));
  assert.equal(solGate.acceptance.minimum_candidate_products, 100);
  assert.equal(solGate.acceptance.minimum_candidate_configurations, 100);
  assert.equal(solGate.current_snapshot.status, "accepted-third-wave");
  assert.ok(backlog.entries.length >= 5);

  const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));
  const productIds = new Set(productsDocument.products.map((product) => product.id));
  const backlogIds = new Set();
  const priorities = new Set(["P1", "P2", "P3"]);
  const statuses = new Set(["source-backed-candidate", "imported-candidate", "configuration-review", "category-candidate"]);

  for (const entry of backlog.entries) {
    assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(backlogIds.has(entry.id), false, `duplicate backlog id ${entry.id}`);
    backlogIds.add(entry.id);
    assert.ok(priorities.has(entry.priority), `${entry.id} has an unsupported priority`);
    assert.ok(statuses.has(entry.status), `${entry.id} has an unsupported status`);
    assert.equal(entry.autopublish, false, `${entry.id} must remain non-publishing`);
    assert.equal(entry.merchant_id.length > 0, true);
    assert.ok(entry.source_ids.length > 0, `${entry.id} needs source IDs`);
    for (const sourceId of entry.source_ids) assert.equal(sourceIds.has(sourceId), true, `${entry.id} references ${sourceId}`);
    assert.equal(entry.required_before_import.length > 0, true, `${entry.id} needs import gates`);
    assert.equal(entry.known_unknowns.length > 0, true, `${entry.id} needs explicit unknowns`);
    if (entry.status === "imported-candidate") {
      assert.equal(productIds.has(entry.id), true, `${entry.id} is marked imported but missing from the canonical catalog`);
    } else {
      assert.equal(productIds.has(entry.id), false, `${entry.id} was auto-imported into the canonical catalog`);
    }
  }
});

test("the backlog covers the declared US gaps without changing publication state", () => {
  const categoryIds = new Set(backlog.entries.map((entry) => entry.category_id));
  assert.equal(categoryIds.has("indoor-infrared-cabins"), true);
  assert.equal(categoryIds.has("outdoor-infrared-cabins"), true);
  assert.equal(categoryIds.has("outdoor-traditional-cabins"), true);
  assert.equal(categoryIds.has("accessories-and-portable"), true);
  assert.ok(backlog.entries.filter((entry) => entry.priority === "P1").length >= 4);
});
