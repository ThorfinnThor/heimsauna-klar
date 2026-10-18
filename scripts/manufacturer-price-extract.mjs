// Reads the listed price of the main product from a manufacturer or shop page.
// Only structured sources are trusted (JSON-LD Product offers, then itemprop /
// product:price meta). Returns null when the page does not state one clear price.

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36";

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  let s = value.trim().replace(/[^\d.,]/g, "");
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function collectNodes(value, out) {
  if (Array.isArray(value)) value.forEach((entry) => collectNodes(entry, out));
  else if (value && typeof value === "object") {
    out.push(value);
    for (const key of ["@graph", "mainEntity", "itemListElement", "hasVariant"]) if (value[key]) collectNodes(value[key], out);
  }
}

function isType(node, type) {
  const t = node["@type"];
  return Array.isArray(t) ? t.includes(type) : t === type;
}

function offerPrices(offers) {
  const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
  const prices = [];
  const listPrices = [];
  let availability = null;
  for (const offer of list) {
    const specs = Array.isArray(offer.priceSpecification) ? offer.priceSpecification : offer.priceSpecification ? [offer.priceSpecification] : [];
    const isStrike = (spec) => String(spec.priceType ?? "").endsWith("StrikethroughPrice") || String(spec.priceType ?? "").endsWith("ListPrice");
    for (const spec of specs.filter(isStrike)) {
      const listPrice = toNumber(spec.price);
      if (listPrice !== null) listPrices.push(listPrice);
    }
    const saleSpec = specs.find((spec) => !isStrike(spec));
    const price = toNumber(offer.price ?? offer.lowPrice ?? saleSpec?.price);
    if (price !== null) prices.push(price);
    if (!availability && typeof offer.availability === "string") availability = offer.availability.split("/").pop();
  }
  return { prices, listPrices, availability };
}

function strikethroughPrices(html) {
  const out = [];
  for (const block of html.match(/\{[^{}]*(?:StrikethroughPrice|ListPrice)[^{}]*\}/g) ?? []) {
    const price = toNumber(block.match(/"price"\s*:\s*"?([\d.,]+)/)?.[1] ?? "");
    if (price !== null) out.push(price);
  }
  return [...new Set(out)];
}

// Shops that render the price client-side but embed it server-side in a
// shop-specific structure.
function hostSpecificPrice(url, html) {
  const host = url ? new URL(url).host : "";
  if (host === "shop.harvia.com") {
    // Next.js flight data: pricing of the product as configured by default.
    const unescaped = html.replace(/\\+"/g, '"');
    const current = unescaped.match(/"totalCurrentPrice":\{"centAmount":(\d+),"currency":"EUR"\}/);
    const regular = unescaped.match(/"totalRegularPrice":\{"centAmount":(\d+),"currency":"EUR"\}/);
    if (current) {
      const price = Number(current[1]) / 100;
      const listPrice = regular ? Number(regular[1]) / 100 : null;
      return { prices: [price], listPrices: listPrice && listPrice > price ? [listPrice] : [], availability: null, method: "harvia-flight" };
    }
  }
  if (host === "mobibadeutschland.de") {
    // First price of the main purchase form.
    const match = html.match(/class="form-add">[\s\S]*?id="shop2-set-total">([\d.,]+)<\/strong>/);
    const price = match ? toNumber(match[1]) : null;
    if (price !== null) return { prices: [price], listPrices: [], availability: null, method: "mobiba-form" };
  }
  return null;
}

export function extractPrice(html, url) {
  const specific = hostSpecificPrice(url, html);
  if (specific) return specific;
  const listPrices = strikethroughPrices(html);
  const products = [];
  for (const match of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const nodes = [];
      collectNodes(JSON.parse(match[1].trim()), nodes);
      products.push(...nodes.filter((node) => isType(node, "Product") || isType(node, "ProductGroup")));
    } catch {
      // Some shops emit JSON-LD with raw control characters. Read the first
      // price inside a block that declares a single Product.
      const block = match[1];
      if ((block.match(/"@type"\s*:\s*"Product"/g) ?? []).length === 1) {
        const name = block.match(/"name"\s*:\s*"([^"]*)"/)?.[1];
        const price = block.match(/"(?:price|lowPrice)"\s*:\s*"?([\d.,]+)/)?.[1];
        const availability = block.match(/"availability"\s*:\s*"[^"]*\/(\w+)"/)?.[1] ?? null;
        if (price) products.push({ "@type": "Product", name, offers: { price, availability: availability ? `x/${availability}` : undefined } });
      }
    }
  }
  const withPrice = products
    .map((product) => ({ name: product.name, ...offerPrices(product.offers) }))
    .filter((entry) => entry.prices.length > 0);
  // One product page = one priced Product. Several priced products (related
  // items, carousels) make the main price ambiguous; fall back to meta tags.
  const names = new Set(withPrice.map((entry) => entry.name));
  if (withPrice.length > 0 && names.size === 1) {
    const prices = [...new Set(withPrice.flatMap((entry) => entry.prices))].sort((a, b) => a - b);
    return { prices, listPrices, availability: withPrice[0].availability, method: "json-ld" };
  }
  const meta = html.match(/property="product:price:amount"\s+content="([^"]+)"/i)
    ?? html.match(/itemprop="price"[^>]*content="([^"]+)"/i);
  if (meta) {
    const price = toNumber(meta[1]);
    if (price !== null) return { prices: [price], listPrices, availability: null, method: "meta" };
  }
  return null;
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&euro;/g, "€")
    .replace(/\s+/g, " ");
}

/** German price notation as shops print it, e.g. 1579.99 -> "1.579,99". */
export function formatDePrice(value) {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function fetchPrice(url) {
  const response = await fetch(url, { headers: { "user-agent": UA, "accept-language": "de-DE,de;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) return { status: response.status, result: null };
  const html = await response.text();
  return { status: response.status, finalUrl: response.url, result: extractPrice(html, url), text: visibleText(html) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const url of process.argv.slice(2)) {
    const fetched = await fetchPrice(url);
    delete fetched.text;
    console.log(url, JSON.stringify(fetched));
  }
}
