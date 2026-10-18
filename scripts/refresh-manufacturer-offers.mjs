// Re-checks non-affiliate offers (manufacturer and shop pages) at the source.
//
// An offer's last_checked moves to today ONLY when its price was read from the
// page's structured data today:
//   confirmed   the stored price is listed on the page          -> date only
//   updated     one unambiguous price that differs by <= 35%     -> price + date
//   from-price  the page prints "ab <stored price>" (cheapest variant) -> date only
//   sale        the stored price is the page's struck-through list price
//               (JSON-LD StrikethroughPrice or "UVP") next to a lower price
//                                                              -> price + "sale-listed" + date
//   unavailable the page marks the product out of stock          -> availability + date
// Everything else (unreachable, redirected away, no structured price, several
// variant prices without the stored one, implausible change) stays untouched
// and is listed in the report for a manual check.
//
// --affiliate re-checks affiliate offers instead, at their shop page (`url`);
// the Awin sync only maintains affiliate links, not prices or check dates.
//
// Usage: node scripts/refresh-manufacturer-offers.mjs [--affiliate] [--apply] [--date YYYY-MM-DD]
import { readFile, writeFile } from "node:fs/promises";
import { fetchPrice, formatDePrice } from "./manufacturer-price-extract.mjs";

const apply = process.argv.includes("--apply");
const affiliate = process.argv.includes("--affiliate");
const dateArg = process.argv.indexOf("--date");
const today = dateArg > 0 ? process.argv[dateArg + 1] : new Date().toISOString().slice(0, 10);
const MAX_CHANGE = 0.35;
const OUT_OF_STOCK = new Set(["OutOfStock", "SoldOut", "Discontinued"]);

const productsUrl = new URL("../data/products.json", import.meta.url);
const reportUrl = new URL(affiliate ? "../data/affiliate-offer-refresh-report.json" : "../data/manufacturer-offer-refresh-report.json", import.meta.url);
const products = JSON.parse(await readFile(productsUrl, "utf8"));

const jobs = [];
for (const product of products) {
  product.commercial.offers.forEach((offer, index) => {
    if (Boolean(offer.affiliate) === affiliate) jobs.push({ product, offer, index });
  });
}

function productKey(url) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

async function check(job) {
  const { offer } = job;
  let fetched;
  try {
    fetched = await fetchPrice(offer.url);
  } catch (error) {
    return { outcome: "unreachable", detail: String(error.name ?? error) };
  }
  if (!fetched.result && fetched.status !== 200) return { outcome: "unreachable", detail: `HTTP ${fetched.status}` };
  if (fetched.finalUrl && !fetched.finalUrl.includes(productKey(offer.url)) && !fetched.result) {
    return { outcome: "redirected-away", detail: fetched.finalUrl };
  }
  if (!fetched.result) return { outcome: "no-structured-price" };
  const { prices, availability } = fetched.result;
  if (availability && OUT_OF_STOCK.has(availability)) return { outcome: "unavailable", prices };
  if (prices.some((price) => Math.abs(price - offer.price) < 0.01)) return { outcome: "confirmed", prices };
  const stored = formatDePrice(offer.price);
  const text = fetched.text ?? "";
  if (new RegExp(`\\bab\\s+${stored.replace(/\./g, "\\.")}\\s*€`, "i").test(text)) return { outcome: "from-price", prices };
  const listedAsStrikethrough = (fetched.result.listPrices ?? []).some((price) => Math.abs(price - offer.price) < 0.01);
  if (prices.length === 1 && prices[0] < offer.price && (listedAsStrikethrough || new RegExp(`UVP\\s*:?\\s*${stored.replace(/\./g, "\\.")}\\s*€|${stored.replace(/\./g, "\\.")}\\s*€\\s*UVP`, "i").test(text))) {
    return { outcome: "sale", prices, newPrice: prices[0] };
  }
  if (prices.length > 1) return { outcome: "ambiguous-variants", prices };
  const change = (prices[0] - offer.price) / offer.price;
  if (Math.abs(change) > MAX_CHANGE) return { outcome: "implausible-change", prices };
  return { outcome: "updated", prices, newPrice: prices[0] };
}

// Polite crawling: one request at a time per host, hosts in parallel.
const byHost = new Map();
for (const job of jobs) {
  const host = new URL(job.offer.url).host.replace(/^www\./, "");
  if (!byHost.has(host)) byHost.set(host, []);
  byHost.get(host).push(job);
}
await Promise.all([...byHost.values()].map(async (hostJobs) => {
  for (const job of hostJobs) {
    job.result = await check(job);
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
}));

const touched = new Set();
const entries = [];
for (const job of jobs) {
  const { product, offer, result } = job;
  const entry = {
    product_id: product.product_id,
    merchant: offer.merchant,
    url: offer.url,
    stored_price: offer.price,
    outcome: result.outcome,
    ...(result.prices ? { page_prices: result.prices } : {}),
    ...(result.detail ? { detail: result.detail } : {}),
  };
  entries.push(entry);
  if (!apply) continue;
  if (result.outcome === "confirmed" || result.outcome === "from-price") offer.last_checked = today;
  if (result.outcome === "sale") { offer.price = result.newPrice; offer.availability = "sale-listed"; offer.last_checked = today; }
  if (result.outcome === "updated") { offer.price = result.newPrice; offer.last_checked = today; }
  if (result.outcome === "unavailable") { offer.availability = "out-of-stock-listed"; offer.last_checked = today; }
  if (["confirmed", "from-price", "sale", "updated", "unavailable"].includes(result.outcome)) touched.add(product);
}

const counts = Object.fromEntries([...new Set(entries.map((entry) => entry.outcome))].map((outcome) => [outcome, entries.filter((entry) => entry.outcome === outcome).length]));
const byMerchant = {};
for (const entry of entries) {
  byMerchant[entry.merchant] ??= {};
  byMerchant[entry.merchant][entry.outcome] = (byMerchant[entry.merchant][entry.outcome] ?? 0) + 1;
}
console.log(JSON.stringify({ checked_at: today, offers: entries.length, counts, byMerchant }, null, 2));

const reportArg = process.argv.indexOf("--report");
if (reportArg > 0) await writeFile(process.argv[reportArg + 1], `${JSON.stringify(entries, null, 2)}\n`, "utf8");

if (apply) {
  for (const product of touched) if (product.updated_at < today) product.updated_at = today;
  await writeFile(productsUrl, `${JSON.stringify(products, null, 2)}\n`, "utf8");
  await writeFile(reportUrl, `${JSON.stringify({ schema_version: 1, checked_at: today, method: "structured price data (JSON-LD Product offers, itemprop/product:price meta) read from each offer URL", counts, entries }, null, 2)}\n`, "utf8");
  console.log(`Applied: ${touched.size} products touched; report at ${reportUrl.pathname.split("/").slice(-2).join("/")}`);
}
