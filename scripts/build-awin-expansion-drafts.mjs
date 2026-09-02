import { readFile, writeFile } from "node:fs/promises";

const input = JSON.parse(await readFile(new URL("../data/awin-expansion-import-26.json", import.meta.url), "utf8"));

function displayDimensions(dimensions) {
  return `${dimensions.width} × ${dimensions.depth} × ${dimensions.height} cm`;
}

function heaterType(entry) {
  const notes = entry.power.notes.toLocaleLowerCase("de");
  if (notes.includes("holzofen") && notes.includes("elektro")) return "Holzofen oder Elektroofen";
  if (notes.includes("mit oder ohne") || notes.includes("separat")) return "Elektroofen optional";
  if (entry.power.kw === null) return "Ofen optional";
  return "Elektroofen";
}

function powerPlugType(entry) {
  if (entry.power.voltage === 230 && entry.model.includes("Lewisburg")) return "Händlerangabe 220 V; Anschluss vor Ort prüfen";
  return null;
}

function offerConfiguration(entry) {
  if (entry.promotion_blocker) return "Konfigurationsabhängige Variante; vor Veröffentlichung festlegen";
  if (entry.power.notes.includes("Mit oder ohne") || entry.power.notes.includes("Elektro- oder Holzofen")) {
    return "Ofenvariante gemäß Händlerseite auswählen";
  }
  return undefined;
}

function buildDraft(entry) {
  const dimensions = displayDimensions(entry.dimensions_cm);
  const peopleLabel = entry.people.min === entry.people.max
    ? `${entry.people.max} Personen`
    : `${entry.people.min} bis ${entry.people.max} Personen`;
  const outdoor = entry.category === "outdoor";
  const offer = {
    merchant: entry.advertiser,
    price: entry.feed_price_eur,
    availability: "feed-listed",
    url: entry.source_url,
    affiliate: false,
    last_checked: input.created_at,
  };
  const configuration = offerConfiguration(entry);
  if (configuration) offer.configuration = configuration;

  return {
    product_id: entry.candidate_id,
    brand: entry.brand,
    model: entry.model,
    family: null,
    category: entry.category,
    status: "draft",
    dimensions_cm: entry.dimensions_cm,
    people: entry.people,
    power: {
      voltage: entry.power.voltage,
      kw: entry.power.kw,
      plug_type: powerPlugType(entry),
      electrician_required: entry.power.electrician_required,
      notes: entry.power.notes,
    },
    sauna: {
      type: "Finnische Sauna",
      indoor_outdoor: entry.category,
      heater_type: heaterType(entry),
      max_temp_c: null,
      heat_up_time_min: null,
      wood_type: entry.wood,
    },
    commercial: {
      currency: "EUR",
      price_status: "from",
      offers: [offer],
    },
    editorial: {
      pros: [
        `${dimensions} Außenmaß laut Händlerseite`,
        `${peopleLabel} Kapazität laut Händlerangabe`,
        entry.seating_evidence,
      ],
      cons: [
        entry.power.kw === null ? "Ein Saunaofen ist nicht fest ausgewiesen." : "Anschluss und Ofenvariante müssen vor dem Kauf geprüft werden.",
        "Keine eigene Nutzung oder Montage geprüft.",
      ],
      ideal_for: [
        outdoor ? "Gartenaufstellung mit geeigneter Vorbereitung" : "Innenräume mit passender Raumhöhe und Lüftung",
        peopleLabel,
        `Interessierte an ${entry.wood}-Ausführung`,
      ],
      not_for: [
        "Situationen, in denen ein fertig montiertes und sofort anschlussbereites Set vorausgesetzt wird.",
        "Aufstellungen ohne Prüfung von Untergrund, Lüftung und Anschlussbedingungen.",
      ],
      test_status: "not_tested",
      editorial_score: null,
      disclosure: "Technische Einordnung auf Basis der verlinkten Händlerangaben; keine eigene Nutzung oder Montage.",
    },
    sources: [
      {
        type: "merchant",
        title: `${entry.advertiser} Produktseite ${entry.model}`,
        url: entry.source_url,
        checked_at: input.created_at,
      },
    ],
    updated_at: input.created_at,
  };
}

const output = {
  schema_version: 1,
  batch_id: input.batch_id,
  generated_at: input.created_at,
  publication_status: "internal-draft",
  source_manifest: "data/awin-expansion-import-26.json",
  note: "Vollständige Produktschema-Entwürfe. Sie werden erst nach Hersteller- oder Handbuchquelle und Sol-Abnahme in products.json veröffentlicht.",
  blocked_candidates: input.entries
    .filter((entry) => entry.promotion_blocker)
    .map((entry) => ({ candidate_id: entry.candidate_id, reason: entry.promotion_blocker })),
  products: input.entries.map(buildDraft),
};

await writeFile(
  new URL("../data/awin-expansion-product-drafts-26.json", import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${output.products.length} internal Awin product drafts.`);
