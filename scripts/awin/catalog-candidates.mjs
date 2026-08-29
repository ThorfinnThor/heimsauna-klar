import { field, normalizeMerchantUrl } from "./matcher.mjs";

const PRIMARY_PRODUCT = /\b(saunahaus|gartensauna|fasssauna|innensauna|infrarotkabine|saunakabine|elementsauna|massivholzsauna|ecksauna)\b/i;
const ACCESSORY = /\b(saunaofen|saunaheizung|saunasteuerung|technikpaket|saunastein|aufguss|schöpfkelle|saunazubehör|saunazubehoer|kopfstütze|duft)\b/i;
const STOP_WORDS = new Set([
  "sauna",
  "saunahaus",
  "gartensauna",
  "infrarotkabine",
  "saunakabine",
  "elementsauna",
  "massivholzsauna",
  "ecksauna",
  "karibu",
  "weka",
  "guenstig",
  "naturbelassen",
  "anthrazit",
  "terragrau",
  "design",
  "fichte",
  "inklusive",
  "inkl",
  "sparset",
  "premium",
  "plus",
  "klarglas",
  "glastuer",
  "holztuer",
  "fenster",
  "klassikofen",
  "bioaktivofen",
  "panorama",
  "ruheraum",
  "vorraum",
  "ohne",
  "ofen",
  "mit",
  "und",
  "fuer",
  "cm",
  "kw",
]);

const PRODUCT_NAME_FIELDS = ["product_name", "product name", "product_title", "product title", "name", "title"];
const PRODUCT_URL_FIELDS = [
  "merchant_deep_link",
  "merchant deep link",
  "merchant_product_url",
  "merchant product url",
  "merchant_product_link",
  "merchant product link",
  "product_url",
  "product url",
];
const BRAND_FIELDS = ["brand", "brand_name", "brand name", "manufacturer"];
const PRICE_FIELDS = ["product_price", "product price", "search_price", "search price", "price"];

function normalizedText(value) {
  return value
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value, { includeGeneric = false } = {}) {
  return [...new Set(normalizedText(value).split(/\s+/).filter((token) =>
    token &&
    (includeGeneric || !STOP_WORDS.has(token)) &&
    (/^\d+(?:\.\d+)?$/.test(token) || token.length >= 3)
  ))];
}

function brandMatches(product, rowName, rowBrand) {
  const productBrand = normalizedText(product.brand).replaceAll(" ", "");
  const candidateBrand = normalizedText(rowBrand ?? "").replaceAll(" ", "");
  if (candidateBrand) return candidateBrand === productBrand;
  return tokens(rowName, { includeGeneric: true }).includes(productBrand);
}

function value(row, names) {
  return field(row, ...names);
}

export function findCatalogCandidates(products, rows, { merchantName, maxCandidates = 500 } = {}) {
  const familySizes = new Map();
  for (const product of products) {
    if (product.family) familySizes.set(product.family.id, (familySizes.get(product.family.id) ?? 0) + 1);
  }

  const tokenFrequency = new Map();
  for (const product of products) {
    const key = normalizedText(product.brand);
    const productTokens = tokens(`${product.family?.name ?? ""} ${product.model}`);
    for (const token of productTokens) {
      const frequencyKey = `${key}|${token}`;
      tokenFrequency.set(frequencyKey, (tokenFrequency.get(frequencyKey) ?? 0) + 1);
    }
  }

  const candidates = [];
  const seen = new Set();
  for (const row of rows) {
    const feedName = value(row, PRODUCT_NAME_FIELDS);
    if (!feedName || !PRIMARY_PRODUCT.test(feedName) || ACCESSORY.test(feedName)) continue;
    const merchantUrl = normalizeMerchantUrl(value(row, PRODUCT_URL_FIELDS) ?? "");
    if (!merchantUrl) continue;
    const rowBrand = value(row, BRAND_FIELDS);
    const feedTokens = new Set(tokens(feedName, { includeGeneric: true }));

    for (const product of products) {
      if (!brandMatches(product, feedName, rowBrand)) continue;
      const brandKey = normalizedText(product.brand);
      const identityTokens = product.family ? tokens(product.family.name) : tokens(product.model);
      const rareTextTokens = identityTokens.filter((token) =>
        !/^\d/.test(token) && (tokenFrequency.get(`${brandKey}|${token}`) ?? 0) <= 3
      );
      const matchedIdentity = rareTextTokens.filter((token) => feedTokens.has(token));
      if (matchedIdentity.length === 0) continue;

      const variantTokens = product.family ? tokens(product.family.variant) : [];
      const matchedVariant = variantTokens.filter((token) => feedTokens.has(token));
      const familySize = product.family ? familySizes.get(product.family.id) ?? 1 : 1;
      if (familySize > 1 && matchedVariant.length === 0) continue;

      const key = `${product.product_id}|${merchantUrl}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const existingOffer = product.commercial.offers.some((offer) =>
        offer.merchant === merchantName && normalizeMerchantUrl(offer.url) === merchantUrl
      );
      candidates.push({
        product_id: product.product_id,
        catalog_name: `${product.brand} ${product.model}`,
        feed_product_name: feedName,
        merchant_url: merchantUrl,
        ...(value(row, PRICE_FIELDS) ? { feed_price: value(row, PRICE_FIELDS) } : {}),
        matched_identity_tokens: matchedIdentity,
        matched_variant_tokens: matchedVariant,
        reason: product.family ? (familySize > 1 ? "family-and-variant-token" : "unique-family-token") : "rare-model-token",
        already_linked: existingOffer,
      });
      if (candidates.length > maxCandidates) throw new Error(`Awin catalog candidate audit exceeds ${maxCandidates} rows`);
    }
  }

  const merchantUrlCounts = new Map();
  for (const candidate of candidates) {
    merchantUrlCounts.set(candidate.merchant_url, (merchantUrlCounts.get(candidate.merchant_url) ?? 0) + 1);
  }
  return candidates.map((candidate) => ({
    ...candidate,
    candidates_for_merchant_url: merchantUrlCounts.get(candidate.merchant_url),
    ambiguous_merchant_url: merchantUrlCounts.get(candidate.merchant_url) > 1,
  })).sort((left, right) =>
    Number(left.already_linked) - Number(right.already_linked)
    || left.product_id.localeCompare(right.product_id)
    || left.merchant_url.localeCompare(right.merchant_url)
  );
}
