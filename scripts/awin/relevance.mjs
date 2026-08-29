const SIGNAL_GROUPS = {
  sauna: ["sauna", "saunahaus", "saunakabine", "fasssauna"],
  infrared: ["infrarot", "infrarotkabine", "infrarotsauna"],
  outdoor: ["gartensauna", "saunahaus", "fasssauna"],
  accessory: ["saunaofen", "saunasteuerung", "saunazubehör", "saunazubehoer", "saunalampe"],
};

const PRODUCT_NAME_FIELDS = [
  "product_name",
  "product name",
  "product_title",
  "product title",
  "name",
  "title",
];

const PRODUCT_URL_FIELDS = [
  "merchant_deep_link",
  "merchant deep link",
  "merchant_product_url",
  "merchant product url",
  "product_url",
  "product url",
  "deep_link",
  "deep link",
  "link",
  "url",
];

const BRAND_FIELDS = ["brand", "brand_name", "brand name", "manufacturer"];
const CATEGORY_FIELDS = ["category", "category_name", "category name", "product_type", "product type"];
const PRICE_FIELDS = ["price", "sale_price", "sale price", "current_price", "current price"];

function normalizedKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function field(row, names) {
  const wanted = new Set(names.map(normalizedKey));
  const key = Object.keys(row).find((candidate) => wanted.has(normalizedKey(candidate)));
  const value = key ? row[key] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanHttpsUrl(value) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return undefined;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

export function auditFeedRows(rows) {
  const counts = Object.fromEntries(Object.keys(SIGNAL_GROUPS).map((group) => [group, 0]));
  const samples = [];
  const sampleProducts = [];
  const sampleProductKeys = new Set();
  let signalRows = 0;

  for (const row of rows) {
    const text = Object.values(row).filter((value) => typeof value === "string").join(" ").toLowerCase();
    const matchedGroups = Object.entries(SIGNAL_GROUPS)
      .filter(([, terms]) => terms.some((term) => text.includes(term)))
      .map(([group]) => group);
    if (matchedGroups.length > 0) signalRows += 1;
    for (const group of matchedGroups) counts[group] += 1;

    if (matchedGroups.length > 0) {
      const name = field(row, PRODUCT_NAME_FIELDS);
      if (name && !samples.includes(name) && samples.length < 8) samples.push(name);
      const url = cleanHttpsUrl(field(row, PRODUCT_URL_FIELDS));
      const sampleKey = url || name?.toLowerCase().replace(/\s+/g, " ").trim();
      if (
        name &&
        /sauna|infrarot|dampfbad/i.test(name) &&
        sampleKey &&
        !sampleProductKeys.has(sampleKey) &&
        sampleProducts.length < 12
      ) {
        sampleProductKeys.add(sampleKey);
        sampleProducts.push({
          name,
          ...(url ? { url } : {}),
          ...(field(row, BRAND_FIELDS) ? { brand: field(row, BRAND_FIELDS) } : {}),
          ...(field(row, CATEGORY_FIELDS) ? { category: field(row, CATEGORY_FIELDS) } : {}),
          ...(field(row, PRICE_FIELDS) ? { price: field(row, PRICE_FIELDS) } : {}),
        });
      }
    }
  }

  return {
    rowsScanned: rows.length,
    signalRows,
    counts,
    sampleProductNames: samples,
    sampleProducts,
  };
}
