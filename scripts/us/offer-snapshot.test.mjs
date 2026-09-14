import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { applyUsOfferSnapshot, reviewUsOfferSnapshot } from "./offer-snapshot.mjs";
import { loadUsBundle } from "./validate-us-data.mjs";

const current = await loadUsBundle();

function snapshot(overrides = {}) {
  return {
    schema_version: 1,
    market: "US",
    snapshot: {
      attempt_id: "fixture-success-2026-09-14",
      attempted_at: "2026-09-14",
      source_status: "succeeded",
      complete: true,
    },
    offers: structuredClone(current.offers.offers),
    ...overrides,
  };
}

function validOffer(overrides = {}) {
  const product = current.products.products[0];
  const configuration = current.configurations.configurations.find((entry) => entry.product_id === product.id);
  const merchant = current.merchants.merchants[0];
  return {
    id: "fixture-safe-offer",
    market: "US",
    market_product_id: product.id,
    configuration_id: configuration.id,
    merchant_id: merchant.id,
    destination_url: `https://${merchant.allowed_hosts[0]}/fixture-safe-offer`,
    offer_type: "quote-only",
    price_scope: "sauna-kit",
    included_component_ids: [],
    excluded_required_components: [],
    completeness: "unknown",
    condition: "new",
    availability: "unknown",
    tax_treatment: "unknown",
    delivery_region_ids: [],
    shipping_evidence_ids: [],
    last_successfully_checked_at: "2026-09-14",
    last_attempted_at: "2026-09-14",
    verification_method: "manual",
    promotion_status: "inactive",
    ...overrides,
  };
}

test("a failed or incomplete source cannot reset the checked-in offer snapshot", () => {
  for (const metadata of [
    { source_status: "failed", complete: false },
    { source_status: "succeeded", complete: false },
  ]) {
    const candidate = snapshot();
    Object.assign(candidate.snapshot, metadata);
    const report = reviewUsOfferSnapshot(current, candidate);
    assert.equal(report.status, "rejected");
  }
});

test("a successful unchanged snapshot is idempotent", () => {
  const report = reviewUsOfferSnapshot(current, snapshot());
  assert.equal(report.status, "no-changes");
  assert.deepEqual(report.summary, { before: 0, after: 0, added: [], updated: [], removed: [], errors: 0 });
});

test("a partial successful response cannot remove an existing offer", () => {
  const currentWithOffer = structuredClone(current);
  currentWithOffer.offers.offers.push(validOffer());
  const report = reviewUsOfferSnapshot(currentWithOffer, snapshot());
  assert.equal(report.status, "rejected");
  assert.deepEqual(report.summary.removed, ["fixture-safe-offer"]);
});

test("a future successful-check date is rejected", () => {
  const candidate = snapshot({ offers: [validOffer({ last_successfully_checked_at: "2026-09-15", last_attempted_at: "2026-09-15" })] });
  const report = reviewUsOfferSnapshot(current, candidate);
  assert.equal(report.status, "rejected");
  assert(report.issues.some((issue) => issue.path.endsWith("last_successfully_checked_at")));
});

test("a validated additive snapshot is written atomically without changing other US documents", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "selectyoursauna-offer-snapshot-"));
  const offersPath = resolve(root, "data", "offers.json");
  await mkdir(resolve(root, "data"));
  await writeFile(offersPath, `${JSON.stringify(current.offers, null, 2)}\n`, "utf8");
  const candidate = snapshot();
  candidate.offers.push(validOffer());

  try {
    const report = reviewUsOfferSnapshot(current, candidate);
    assert.equal(report.status, "ready");
    const result = await applyUsOfferSnapshot({ report, offersPath });
    assert.equal(result.applied, true);
    const written = JSON.parse(await readFile(offersPath, "utf8"));
    assert.equal(written.offers.length, 1);
    assert.equal(written.snapshot, undefined);
    const backup = JSON.parse(await readFile(result.backup_path, "utf8"));
    assert.deepEqual(backup, current.offers);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
