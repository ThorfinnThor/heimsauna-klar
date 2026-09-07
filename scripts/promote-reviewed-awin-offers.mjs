import { readFile, writeFile } from "node:fs/promises";

const reviewPath = process.argv[2];
if (!reviewPath) throw new Error("Usage: node scripts/promote-reviewed-awin-offers.mjs <review-file>");

const [review, products, merchants, feedReport] = await Promise.all([
  readJson(reviewPath),
  readJson("data/products.json"),
  readJson("data/merchants.json"),
  readJson(`data/awin-catalog-products-${reviewMerchantId(reviewPath)}.json`),
]);

const merchant = merchants.find((entry) => entry.id === review.merchant_id);
if (!merchant || merchant.name !== review.merchant_name) {
  throw new Error(`Merchant registry mismatch for ${review.merchant_id}`);
}
if (String(feedReport.advertiser_id) !== String(review.advertiser_id) || String(feedReport.feed_id) !== String(review.feed_id)) {
  throw new Error("Review does not match the current advertiser and feed report");
}

const feedByUrl = new Map(feedReport.products.map((entry) => [normalizeUrl(entry.url), entry]));
const productsById = new Map(products.map((entry) => [entry.product_id, entry]));
let added = 0;
let existing = 0;

for (const entry of review.approved) {
  if (entry.page_status !== 200) throw new Error(`${entry.merchant_url} was not verified as reachable`);
  const product = productsById.get(entry.product_id);
  if (!product) throw new Error(`Unknown product ${entry.product_id}`);
  const normalizedUrl = normalizeUrl(entry.merchant_url);
  const feedProduct = feedByUrl.get(normalizedUrl);
  if (!feedProduct) throw new Error(`${entry.merchant_url} is not present in the sanitized feed report`);
  if (!merchant.allowed_hosts.includes(new URL(normalizedUrl).hostname)) {
    throw new Error(`${entry.merchant_url} is not on an allowed merchant host`);
  }

  const current = product.commercial.offers.find((offer) => normalizeUrl(offer.url) === normalizedUrl);
  if (current) {
    existing += 1;
  } else {
    product.commercial.offers.push({
      merchant: merchant.name,
      price: feedProduct.price,
      availability: "feed-listed",
      url: entry.merchant_url,
      affiliate: false,
      last_checked: review.reviewed_at,
      configuration: entry.configuration,
      selection_required: entry.selection_required,
    });
    added += 1;
  }

  if (!product.sources.some((source) => normalizeUrl(source.url) === normalizedUrl)) {
    product.sources.push({
      type: "merchant",
      title: `Demmelhuber Produktseite ${feedProduct.name}`,
      url: entry.merchant_url,
      checked_at: review.reviewed_at,
    });
  }
  product.updated_at = review.reviewed_at;
}

await writeFile("data/products.json", `${JSON.stringify(products, null, 2)}\n`, "utf8");
console.log(`${merchant.name}: ${added} reviewed offers added, ${existing} already present.`);

function reviewMerchantId(path) {
  const match = path.match(/awin-([a-z0-9-]+)-offer-review\.json$/);
  if (!match) throw new Error("Review filename must follow data/awin-<merchant-id>-offer-review.json");
  return match[1];
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
