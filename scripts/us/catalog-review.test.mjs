import assert from "node:assert/strict";
import test from "node:test";

import policy from "../../data/us/catalog-review-policy.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import sourcesDocument from "../../data/us/sources.json" with { type: "json" };
import programsDocument from "../../data/us/programs.json" with { type: "json" };
import rightsDocument from "../../docs/us/rights-register.json" with { type: "json" };
import publication from "../../data/us/publication.json" with { type: "json" };
import { reviewUsCatalog } from "../../lib/us/catalog-review.ts";

test("the current indexed first-wave catalog has a reproducible review report", () => {
  const report = reviewUsCatalog({
    asOf: "2026-09-16",
    products: productsDocument.products,
    sources: sourcesDocument.sources,
    programs: programsDocument.programs,
    rights: rightsDocument.assets,
    publication,
    policy,
  });
  assert.equal(report.summary.products, 263);
  assert.equal(report.summary.candidatesAwaitingReview, 235);
  assert.equal(report.summary.sourceStale, 0);
  assert.equal(report.summary.sourceReferencesMissing, 0);
  assert.equal(report.summary.reviewsDue, 0);
  assert.equal(report.summary.reviewSchedulesInvalid, 0);
  assert.equal(report.summary.approvedPrograms, 1);
  assert.equal(report.summary.rightsReady, 0);
  assert.equal(report.summary.publicationProtected, true);
  assert(report.blockers.includes("235 candidate or draft products still require their first technical review."));
  assert(!report.blockers.some((blocker) => blocker.includes("publisher approval")));
});

test("a reviewed product without a future review date is not silently current", () => {
  const report = reviewUsCatalog({
    asOf: "2026-09-14",
    products: [{ id: "fixture-product", publication_status: "reviewed", source_ids: ["fixture-source"], spec_checked_at: "2026-09-14" }],
    sources: [{ id: "fixture-source", checked_at: "2026-09-14" }],
    programs: [{ relationship_status: "approved" }],
    rights: [{ rights_status: "approved" }],
    publication: { routes_enabled: true, indexing_enabled: true, affiliate_links_enabled: true, feed_sync_enabled: true },
    policy,
  });
  assert.equal(report.products[0].reviewState, "schedule-missing");
  assert(report.blockers.includes("fixture-product: next_review_at is required after technical review"));
});

test("a source older than the technical cadence is reported as stale", () => {
  const report = reviewUsCatalog({
    asOf: "2026-09-14",
    products: [{ id: "fixture-product", publication_status: "candidate", source_ids: ["fixture-source"] }],
    sources: [{ id: "fixture-source", checked_at: "2026-01-01" }],
    programs: [],
    rights: [],
    publication: { routes_enabled: false, indexing_enabled: false, affiliate_links_enabled: false, feed_sync_enabled: false },
    policy,
  });
  assert.equal(report.products[0].reviewState, "stale-source");
  assert(report.blockers.includes("fixture-product: technical source review is stale for fixture-source"));
});

test("every referenced source must be current rather than only the newest one", () => {
  const report = reviewUsCatalog({
    asOf: "2026-09-14",
    products: [{ id: "fixture-product", publication_status: "candidate", source_ids: ["current-source", "old-source"] }],
    sources: [
      { id: "current-source", checked_at: "2026-09-14" },
      { id: "old-source", checked_at: "2026-01-01" },
    ],
    programs: [],
    rights: [],
    publication: { routes_enabled: false, indexing_enabled: false, affiliate_links_enabled: false, feed_sync_enabled: false },
    policy,
  });
  assert.deepEqual(report.products[0].staleSourceIds, ["old-source"]);
  assert.equal(report.products[0].oldestSourceDate, "2026-01-01");
  assert.equal(report.summary.sourceStale, 1);
});

test("a review schedule cannot silently exceed the technical cadence", () => {
  const report = reviewUsCatalog({
    asOf: "2026-09-14",
    products: [{
      id: "fixture-product",
      publication_status: "reviewed",
      source_ids: ["fixture-source"],
      spec_checked_at: "2026-09-14",
      next_review_at: "2027-09-14",
    }],
    sources: [{ id: "fixture-source", checked_at: "2026-09-14" }],
    programs: [{ relationship_status: "approved" }],
    rights: [{ rights_status: "approved" }],
    publication: { routes_enabled: true, indexing_enabled: true, affiliate_links_enabled: true, feed_sync_enabled: true },
    policy,
  });
  assert.equal(report.products[0].reviewState, "schedule-invalid");
  assert.equal(report.summary.reviewSchedulesInvalid, 1);
  assert(report.blockers.includes("fixture-product: next_review_at must be within 90 days after spec_checked_at"));
});

test("the report date must be a real ISO calendar date", () => {
  assert.throws(() => reviewUsCatalog({
    asOf: "2026-02-31",
    products: [],
    sources: [],
    programs: [],
    rights: [],
    publication: { routes_enabled: false, indexing_enabled: false, affiliate_links_enabled: false, feed_sync_enabled: false },
    policy,
  }), /Invalid review date/);
});
