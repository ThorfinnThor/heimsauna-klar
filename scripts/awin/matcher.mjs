const AWIN_TRACKING_HOSTS = new Set(["awin1.com", "awin1.net"]);

function normalizedKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function field(row, ...names) {
  const wanted = new Set(names.map(normalizedKey));
  const key = Object.keys(row).find((candidate) => wanted.has(normalizedKey(candidate)));
  const value = key ? row[key] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function normalizeMerchantUrl(raw) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return undefined;
    url.hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch {
    return undefined;
  }
}

export function normalizeAffiliateUrl(raw) {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || url.port || !AWIN_TRACKING_HOSTS.has(host)) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

function feedMerchantUrl(row) {
  return field(
    row,
    "merchant_deep_link",
    "merchant deep link",
    "merchant_product_url",
    "merchant product url",
    "merchant_product_link",
    "merchant product link",
    "product_url",
    "product url",
  );
}

function feedAffiliateUrl(row) {
  return field(row, "aw_deep_link", "aw deep link", "affiliate_url", "affiliate url", "tracking_url", "tracking url");
}

export function matchExactOffers(products, { merchantName, merchantId, programId }, rows) {
  const offersByUrl = new Map();
  for (const product of products) {
    for (const [offerIndex, offer] of product.commercial.offers.entries()) {
      if (offer.merchant !== merchantName) continue;
      const normalized = normalizeMerchantUrl(offer.url);
      if (!normalized) throw new Error(`${product.product_id} contains an invalid ${merchantName} offer URL`);
      if (offersByUrl.has(normalized)) throw new Error(`${merchantName} offer URL is assigned to more than one product: ${normalized}`);
      offersByUrl.set(normalized, { productId: product.product_id, offerIndex });
    }
  }

  const validRows = new Map();
  let invalidTrackingLinks = 0;
  for (const row of rows) {
    const merchantUrl = normalizeMerchantUrl(feedMerchantUrl(row));
    if (!merchantUrl || !offersByUrl.has(merchantUrl)) continue;
    const affiliateUrl = normalizeAffiliateUrl(feedAffiliateUrl(row));
    if (!affiliateUrl) {
      invalidTrackingLinks += 1;
      continue;
    }
    if (!validRows.has(merchantUrl)) validRows.set(merchantUrl, affiliateUrl);
  }

  const matches = [];
  for (const [merchantUrl, affiliateUrl] of validRows) {
    const offer = offersByUrl.get(merchantUrl);
    matches.push({
      merchantId,
      programId,
      productId: offer.productId,
      offerIndex: offer.offerIndex,
      affiliateUrl,
    });
  }
  matches.sort((left, right) => left.productId.localeCompare(right.productId));
  const matchedProductIds = new Set(matches.map((match) => match.productId));
  return {
    matches,
    catalogOfferCount: offersByUrl.size,
    invalidTrackingLinks,
    unmatchedProductIds: [...offersByUrl.values()]
      .map((offer) => offer.productId)
      .filter((productId) => !matchedProductIds.has(productId))
      .sort(),
  };
}

export function applyMatches(products, matches) {
  const updated = structuredClone(products);
  const productsById = new Map(updated.map((product) => [product.product_id, product]));
  for (const match of matches) {
    const product = productsById.get(match.productId);
    const offer = product?.commercial.offers[match.offerIndex];
    if (!offer) throw new Error(`Affiliate match references missing offer: ${match.productId}`);
    offer.affiliate = true;
    offer.affiliate_url = match.affiliateUrl;
    offer.affiliate_program_id = match.programId;
  }
  return updated;
}

export function trackingHosts(matches) {
  return [...new Set(matches.map((match) => new URL(match.affiliateUrl).hostname.replace(/^www\./, "")))].sort();
}
