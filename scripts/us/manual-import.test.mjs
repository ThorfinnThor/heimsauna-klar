import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { loadUsBundle } from "./validate-us-data.mjs";
import { applyManualImport, IMPORT_FILES, loadCandidateBundle, reviewManualImport } from "./manual-import.mjs";

const current = await loadUsBundle();

function candidate() {
  return structuredClone(current);
}

test("an unchanged full snapshot is idempotent", () => {
  const report = reviewManualImport(current, candidate());
  assert.equal(report.status, "no-changes");
  assert.equal(report.summary.changed_records, 0);
  assert.equal(report.summary.errors, 0);
});

test("a non-US document is rejected", () => {
  const next = candidate();
  next.products.market = "DE";
  const report = reviewManualImport(current, next);
  assert.equal(report.status, "rejected");
  assert(report.issues.some((entry) => entry.path === "products.market"));
});

test("unknown configuration IDs are rejected", () => {
  const next = candidate();
  next.products.products[0].configuration_ids = ["missing-configuration"];
  const report = reviewManualImport(current, next);
  assert.equal(report.status, "rejected");
  assert(report.issues.some((entry) => entry.path.includes("configuration_ids")));
});

test("duplicate stable IDs are rejected", () => {
  const next = candidate();
  next.products.products.push(structuredClone(next.products.products[0]));
  const report = reviewManualImport(current, next);
  assert.equal(report.status, "rejected");
  assert(report.issues.some((entry) => entry.message.includes("duplicates")));
});

test("manual imports cannot remove existing records", () => {
  const next = candidate();
  const removed = next.products.products.pop();
  next.configurations.configurations = next.configurations.configurations.filter((entry) => entry.product_id !== removed.id);
  const report = reviewManualImport(current, next);
  assert.equal(report.status, "rejected");
  assert(report.issues.some((entry) => entry.origin === "import-policy" && entry.message.includes(removed.id)));
});

test("US offers using a non-USD price are rejected", () => {
  const next = candidate();
  const product = next.products.products[0];
  const configuration = next.configurations.configurations.find((entry) => entry.product_id === product.id);
  const merchant = next.merchants.merchants[0];
  next.offers.offers.push({
    id: "invalid-euro-offer",
    market: "US",
    market_product_id: product.id,
    configuration_id: configuration.id,
    merchant_id: merchant.id,
    destination_url: `https://${merchant.allowed_hosts[0]}/example`,
    offer_type: "fixed-price",
    price: { amount_minor: 299900, currency: "EUR" },
    price_scope: "sauna-kit",
    included_component_ids: [],
    excluded_required_components: [],
    completeness: "unknown",
    condition: "new",
    availability: "unknown",
    tax_treatment: "unknown",
    delivery_region_ids: [],
    shipping_evidence_ids: [],
    last_successfully_checked_at: "2026-09-13",
    verification_method: "manual",
    promotion_status: "inactive",
  });
  const report = reviewManualImport(current, next);
  assert.equal(report.status, "rejected");
  assert(report.issues.some((entry) => entry.path.endsWith("price.currency") && entry.message.includes("USD")));
});

test("an additive, valid source record is ready and reported", () => {
  const next = candidate();
  next.sources.sources.push({
    id: "manual-import-test-source",
    type: "other",
    url: "https://example.com/us-sauna-source",
    title: "Manual import test source",
    publisher: "Example",
    market: "US",
    checked_at: "2026-09-13",
  });
  const report = reviewManualImport(current, next);
  assert.equal(report.status, "ready");
  assert.deepEqual(report.collections["sources.sources"].added, ["manual-import-test-source"]);
  assert.equal(report.summary.changed_urls, 1);
});

test("an approved snapshot is applied from regular files with a recovery backup", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "selectyoursauna-import-test-"));
  const candidateRoot = resolve(root, "candidate");
  const dataRoot = resolve(root, "data");
  await mkdir(candidateRoot);
  await mkdir(dataRoot);

  try {
    for (const fileName of IMPORT_FILES) {
      const source = new URL(`../../data/us/${fileName}`, import.meta.url);
      await copyFile(source, resolve(candidateRoot, fileName));
      await copyFile(source, resolve(dataRoot, fileName));
    }
    const sourcePath = resolve(candidateRoot, "sources.json");
    const sourceDocument = JSON.parse(await readFile(sourcePath, "utf8"));
    sourceDocument.sources.push({
      id: "applied-import-test-source",
      type: "other",
      url: "https://example.com/applied-us-source",
      title: "Applied import test source",
      publisher: "Example",
      market: "US",
      checked_at: "2026-09-13",
    });
    await writeFile(sourcePath, `${JSON.stringify(sourceDocument, null, 2)}\n`, "utf8");

    const loaded = await loadCandidateBundle(candidateRoot, current);
    const report = reviewManualImport(current, loaded.candidate);
    assert.equal(report.status, "ready");
    const applied = await applyManualImport({ files: loaded.files, dataRoot, report });
    assert.equal(applied.applied, true);
    assert.match(applied.backup_directory, /^\/.*selectyoursauna-us-import-/);
    const imported = JSON.parse(await readFile(resolve(dataRoot, "sources.json"), "utf8"));
    assert(imported.sources.some((entry) => entry.id === "applied-import-test-source"));
    const backup = JSON.parse(await readFile(resolve(applied.backup_directory, "sources.json"), "utf8"));
    assert(!backup.sources.some((entry) => entry.id === "applied-import-test-source"));
    await rm(applied.backup_directory, { recursive: true, force: true });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
