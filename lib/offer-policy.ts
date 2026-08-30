export const OFFER_FRESHNESS_DAYS = 30;

export type OfferPolicyInput = {
  availability: string;
  last_checked: string;
};

export type OfferPolicyReason = "eligible" | "unavailable" | "stale" | "future" | "invalid-date";

export type OfferPolicyResult = {
  eligible: boolean;
  reason: OfferPolicyReason;
  ageDays: number | null;
};

const unavailablePattern = /out[- ]of[- ]stock|unavailable|discontinued|nicht\s+(?:verfügbar|lieferbar)/i;

function parseIsoDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function classifyOffer(offer: OfferPolicyInput, asOf: string): OfferPolicyResult {
  if (unavailablePattern.test(offer.availability)) {
    return { eligible: false, reason: "unavailable", ageDays: null };
  }

  const checkedAt = parseIsoDay(offer.last_checked);
  const policyDate = parseIsoDay(asOf);
  if (checkedAt === null || policyDate === null) {
    return { eligible: false, reason: "invalid-date", ageDays: null };
  }

  const ageDays = Math.floor((policyDate - checkedAt) / 86_400_000);
  if (ageDays < 0) return { eligible: false, reason: "future", ageDays };
  if (ageDays > OFFER_FRESHNESS_DAYS) return { eligible: false, reason: "stale", ageDays };
  return { eligible: true, reason: "eligible", ageDays };
}

export function isOfferPurchaseEligible(offer: OfferPolicyInput, asOf: string) {
  return classifyOffer(offer, asOf).eligible;
}
