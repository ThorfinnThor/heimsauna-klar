import assert from "node:assert/strict";
import test from "node:test";
import { classifyOffer, isOfferPurchaseEligible } from "../lib/offer-policy.ts";

const asOf = "2026-08-30";

test("offers remain eligible through the 30-day boundary", () => {
  assert.equal(isOfferPurchaseEligible({ availability: "in-stock", last_checked: "2026-07-31" }, asOf), true);
  assert.equal(classifyOffer({ availability: "in-stock", last_checked: "2026-07-30" }, asOf).reason, "stale");
});

test("recent unavailable offers are not misclassified as stale", () => {
  assert.deepEqual(
    classifyOffer({ availability: "out-of-stock-listed", last_checked: "2026-08-29" }, asOf),
    { eligible: false, reason: "unavailable", ageDays: null },
  );
});

test("future and malformed check dates cannot become purchase offers", () => {
  assert.equal(classifyOffer({ availability: "in-stock", last_checked: "2026-08-31" }, asOf).reason, "future");
  assert.equal(classifyOffer({ availability: "in-stock", last_checked: "unknown" }, asOf).reason, "invalid-date");
});
