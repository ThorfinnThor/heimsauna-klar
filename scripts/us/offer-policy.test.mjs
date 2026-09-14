import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyUsOffer,
  classifyUsOfferPrice,
  US_OFFER_FRESHNESS_DAYS,
  usOfferStatusLabel,
} from "../../lib/us/offer-policy.ts";

function offer(overrides = {}) {
  return {
    offer_type: "fixed-price",
    price: { amount_minor: 499900, currency: "USD" },
    completeness: "documented",
    excluded_required_components: [],
    availability: "in-stock",
    last_successfully_checked_at: "2026-09-14",
    ...overrides,
  };
}

test("the US policy keeps the shared inclusive 30-day boundary", () => {
  assert.equal(US_OFFER_FRESHNESS_DAYS, 30);
  assert.deepEqual(classifyUsOffer(offer({ last_successfully_checked_at: "2026-08-15" }), "2026-09-14"), {
    eligible: true,
    reason: "eligible",
    ageDays: 30,
  });
  assert.equal(classifyUsOffer(offer({ last_successfully_checked_at: "2026-08-14" }), "2026-09-14").reason, "stale");
});

test("stale, unavailable and unverified offers expose neither links nor prices", () => {
  for (const candidate of [
    offer({ last_successfully_checked_at: "2026-08-01" }),
    offer({ availability: "out-of-stock" }),
    offer({ availability: "unknown" }),
  ]) {
    const policy = classifyUsOfferPrice(candidate, "2026-09-14");
    assert.equal(policy.eligible, false);
    assert.equal(policy.priceVisible, false);
  }
});

test("quote-only and incomplete offers may be current without exposing a comparable price", () => {
  assert.deepEqual(classifyUsOfferPrice(offer({ offer_type: "quote-only", price: undefined }), "2026-09-14").priceReason, "quote-only");
  assert.deepEqual(classifyUsOfferPrice(offer({ completeness: "incomplete" }), "2026-09-14").priceReason, "price-incomplete");
});

test("a stale offer uses the required status copy without retaining its historical price", () => {
  const policy = classifyUsOfferPrice(offer({ last_successfully_checked_at: "2026-08-01" }), "2026-09-14");
  assert.equal(policy.priceVisible, false);
  assert.equal(usOfferStatusLabel(policy.reason), "Check current price");
});
