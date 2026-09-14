import { classifyOffer, OFFER_FRESHNESS_DAYS } from "../offer-policy.ts";

import type { UsOffer } from "./types.ts";

export { OFFER_FRESHNESS_DAYS as US_OFFER_FRESHNESS_DAYS };

export type UsOfferFreshnessReason =
  | "eligible"
  | "unavailable"
  | "availability-unverified"
  | "stale"
  | "future"
  | "invalid-date";

export type UsOfferPriceReason =
  | UsOfferFreshnessReason
  | "quote-only"
  | "price-missing"
  | "price-incomplete";

export type UsOfferFreshness = {
  eligible: boolean;
  reason: UsOfferFreshnessReason;
  ageDays: number | null;
};

export type UsOfferPricePolicy = UsOfferFreshness & {
  priceVisible: boolean;
  priceReason: UsOfferPriceReason;
};

export function classifyUsOffer(offer: UsOffer, asOf: string): UsOfferFreshness {
  if (offer.availability === "unknown") {
    return { eligible: false, reason: "availability-unverified", ageDays: null };
  }
  return classifyOffer({
    availability: offer.availability,
    last_checked: offer.last_successfully_checked_at,
  }, asOf);
}

export function classifyUsOfferPrice(offer: UsOffer, asOf: string): UsOfferPricePolicy {
  const freshness = classifyUsOffer(offer, asOf);
  if (!freshness.eligible) {
    return { ...freshness, priceVisible: false, priceReason: freshness.reason };
  }
  if (offer.offer_type === "quote-only") {
    return { ...freshness, priceVisible: false, priceReason: "quote-only" };
  }
  if (!offer.price) {
    return { ...freshness, priceVisible: false, priceReason: "price-missing" };
  }
  if (offer.completeness !== "documented" || offer.excluded_required_components.length > 0) {
    return { ...freshness, priceVisible: false, priceReason: "price-incomplete" };
  }
  return { ...freshness, priceVisible: true, priceReason: "eligible" };
}

export function usOfferStatusLabel(reason: UsOfferFreshnessReason) {
  if (reason === "stale") return "Check current price";
  if (reason === "unavailable") return "Currently unavailable";
  if (reason === "availability-unverified") return "Availability needs verification";
  if (reason === "future" || reason === "invalid-date") return "Offer date needs verification";
  return "Current offer";
}
