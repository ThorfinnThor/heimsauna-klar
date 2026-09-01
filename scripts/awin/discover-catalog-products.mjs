import { readFile, writeFile } from "node:fs/promises";
import { assertFeedListUrl, parseEligibleFeeds, resolveTargetFeeds } from "./feed-list.mjs";
import { readFeedRows } from "./source.mjs";
import { field, normalizeMerchantUrl } from "./matcher.mjs";

const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
if (!rawUrl) throw new Error("AWIN_FEED_LIST_URL is not configured");

const requestedMerchantId = process.env.AWIN_CATALOG_DISCOVERY_MERCHANT_ID?.trim() || "gartenhausfabrik";
const maxProducts = Number(process.env.AWIN_CATALOG_DISCOVERY_LIMIT || 250);
if (!Number.isInteger(maxProducts) || maxProducts < 1 || maxProducts > 500) {
  throw new Error("AWIN_CATALOG_DISCOVERY_LIMIT must be an integer between 1 and 500");
}

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
  "deep_link",
  "deep link",
  "link",
  "url",
];
const BRAND_FIELDS = ["brand", "brand_name", "brand name", "manufacturer"];
const CATEGORY_FIELDS = ["category", "category_name", "category name", "merchant_category", "merchant category", "product_type", "product type"];
const PRICE_FIELDS = ["price", "product_price", "product price", "merchant_product_price", "merchant product price", "search_price", "search price", "sale_price", "sale price", "current_price", "current price"];
const SKU_FIELDS = ["product_id", "product id", "sku", "merchant_product_id", "merchant product id", "id"];
const PRIMARY_PRODUCT = /\b(sauna|saunahaus|gartensauna|fasssauna|saunakabine|innensauna|infrarotkabine|infrarotsauna|massivholzsauna|elementsauna|kombisauna)\b/i;
const ACCESSORY = /\b(saunaofen|saunaheizung|saunasteuerung|technikpaket|saunastein|aufguss|schöpfkelle|schoepfkelle|saunazubehör|saunazubehoer|kopfstütze|duft|saunalampe|bodenmatte)\b/i;
const VARIANT_HINT = /\b(nach maß|nach mass|maßanfertigung|sonderbau|mit holzofen|ohne holzofen|black edition|natur|schwarz|grau|terragrau|inkl\.?\s*ofen|ohne ofen|set|copy)\b/i;

const parsePrice = (value) => {
  if (!value) return undefined;
  const normalized = String(value).replace(/[^0-9,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

const feedListRows = await readFeedRows(assertFeedListUrl(rawUrl));
const target = resolveTargetFeeds(parseEligibleFeeds(feedListRows))
  .find((candidate) => candidate.merchantId === requestedMerchantId);
if (!target) throw new Error(`Catalog discovery target is missing: ${requestedMerchantId}`);

const merchants = JSON.parse(await readFile("data/merchants.json", "utf8"));
const merchant = merchants.find((entry) => entry.id === requestedMerchantId);
if (!merchant) throw new Error(`Catalog discovery merchant is missing: ${requestedMerchantId}`);
const allowedHosts = new Set(merchant.allowed_hosts);

const rows = await readFeedRows(target.entry.feedUrl, {
  maxDownloadBytes: 250_000_000,
  maxRows: 250_000,
  userAgent: "SelectYourSauna-AwinCatalogDiscovery/1.0",
});

const productsByUrl = new Map();
for (const row of rows) {
  const name = field(row, ...PRODUCT_NAME_FIELDS);
  if (!name || !PRIMARY_PRODUCT.test(name) || ACCESSORY.test(name)) continue;
  const url = normalizeMerchantUrl(field(row, ...PRODUCT_URL_FIELDS) ?? "");
  if (!url || !allowedHosts.has(new URL(url).hostname)) continue;
  const price = parsePrice(field(row, ...PRICE_FIELDS));
  const candidate = {
    name,
    url,
    ...(field(row, ...BRAND_FIELDS) ? { brand: field(row, ...BRAND_FIELDS) } : {}),
    ...(field(row, ...CATEGORY_FIELDS) ? { category: field(row, ...CATEGORY_FIELDS) } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(field(row, ...SKU_FIELDS) ? { sku: field(row, ...SKU_FIELDS) } : {}),
    variant_hint: VARIANT_HINT.test(name) || /\/sw\d+\.\d+/.test(new URL(url).pathname),
  };
  const key = url;
  const existing = productsByUrl.get(key);
  if (!existing || (candidate.price !== undefined && existing.price === undefined)) productsByUrl.set(key, candidate);
}

const products = [...productsByUrl.values()]
  .sort((left, right) => Number(left.variant_hint) - Number(right.variant_hint)
    || left.name.localeCompare(right.name, "de")
    || left.url.localeCompare(right.url))
  .slice(0, maxProducts);

const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source: `Awin authenticated ${target.entry.advertiserName} product feed`,
  secret_included: false,
  selection_policy: "Sauna-relevante Einzel-URLs ohne Zubehör; Variantenhinweise werden markiert und nicht automatisch in data/products.json übernommen.",
  advertiser_id: target.advertiserId,
  advertiser_name: target.entry.advertiserName,
  feed_id: target.entry.feedId,
  feed_name: target.entry.feedName,
  feed_rows: rows.length,
  sauna_relevant_rows: productsByUrl.size,
  products_returned: products.length,
  products,
};

const reportPath = `data/awin-catalog-products-${requestedMerchantId}.json`;
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`${target.entry.advertiserName} catalog discovery: ${products.length} sanitized product candidates (${reportPath}).`);
