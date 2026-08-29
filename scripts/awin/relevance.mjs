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

function normalizedKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function field(row, names) {
  const wanted = new Set(names.map(normalizedKey));
  const key = Object.keys(row).find((candidate) => wanted.has(normalizedKey(candidate)));
  const value = key ? row[key] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function auditFeedRows(rows) {
  const counts = Object.fromEntries(Object.keys(SIGNAL_GROUPS).map((group) => [group, 0]));
  const samples = [];
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
    }
  }

  return {
    rowsScanned: rows.length,
    signalRows,
    counts,
    sampleProductNames: samples,
  };
}
