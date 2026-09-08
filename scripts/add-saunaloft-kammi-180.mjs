import { readFile, writeFile } from "node:fs/promises";

const productsPath = "data/products.json";
const overridesPath = "data/product-editorial-overrides.json";
const readinessPath = "data/launch-readiness.json";
const powerEvidencePath = "data/power-evidence.json";
const batchPath = "data/data-maintenance-batch-2026-09-08-kammi.json";
const checkedAt = "2026-09-08";
const productId = "harvia-kammi-barrel-180";

const [products, overrides, readiness, powerEvidence] = await Promise.all([
  readJson(productsPath),
  readJson(overridesPath),
  readJson(readinessPath),
  readJson(powerEvidencePath),
]);

if (products.some((product) => product.product_id === productId)) {
  throw new Error(`${productId} already exists`);
}

products.push({
  product_id: productId,
  brand: "Harvia",
  model: "Kammi Barrel 180",
  family: {
    id: "harvia-kammi-barrel",
    name: "Kammi Barrel",
    variant: "180 · 220 × 180 cm",
  },
  category: "outdoor",
  status: "verified",
  dimensions_cm: {
    width: 220,
    depth: 180,
    height: 220,
  },
  people: {
    min: 2,
    max: 4,
    seats: 4,
    lying_places: 0,
  },
  power: {
    voltage: "none",
    kw: null,
    plug_type: null,
    electrician_required: true,
    notes: "Die Kammi 180 wird als Kabine geführt. Saunaloft bietet sie ohne Ofen oder mit einer wählbaren 8-kW-Variante an; Spannung und Anschluss hängen von der konkreten Ofenwahl ab.",
  },
  sauna: {
    type: "Finnische Sauna",
    indoor_outdoor: "outdoor",
    heater_type: "Elektro",
    max_temp_c: null,
    heat_up_time_min: null,
    wood_type: "Fichte",
  },
  commercial: {
    currency: "EUR",
    price_status: "from",
    offers: [
      {
        merchant: "Saunaloft",
        price: 3999,
        availability: "feed-listed",
        url: "https://shop-saunaloft.de/harvia-fasssauna-kammi-180/sw10343set.2",
        affiliate: false,
        last_checked: checkedAt,
        configuration: "Kabine ohne Ofen",
        selection_required: true,
      },
      {
        merchant: "Saunaloft",
        price: 4449,
        availability: "feed-listed",
        url: "https://shop-saunaloft.de/harvia-fasssauna-kammi-180/sw10343set.1",
        affiliate: false,
        last_checked: checkedAt,
        configuration: "Kabine mit wählbarem 8-kW-Ofen",
        selection_required: true,
      },
    ],
  },
  editorial: {
    pros: [
      "Kompakte Fasssauna mit 220 cm Durchmesser und 180 cm Außenlänge",
      "Harvia nennt zwei bis vier Nutzer und 40-mm-Fichtenholz",
      "Zwei Saunaloft-Konfigurationen trennen Kabine und Ofenwahl nachvollziehbar",
    ],
    cons: [
      "Die Netzspannung ist ohne konkrete Ofenauswahl nicht festgelegt",
      "Außenfundament, Zugang und Wetterschutz müssen separat geplant werden",
      "Harvia führt das Modell als ausgelaufen, während Saunaloft Varianten im Feed listet",
    ],
    ideal_for: [
      "Kleine Gärten mit länglicher Stellfläche",
      "Zwei bis vier Personen mit überwiegender Sitznutzung",
      "Planungen, bei denen Kabine und Ofen getrennt entschieden werden",
    ],
    not_for: [
      "Steckerfertige Nutzung ohne konkrete Ofen- und Elektroplanung",
      "Sehr kleine Zufahrten ohne Platz für Anlieferung und Aufbau",
      "Käufer, die einen aktuellen Hersteller-Neuerscheinungsstatus erwarten",
    ],
    test_status: "not_tested",
    editorial_score: null,
    disclosure: "Technische Einordnung auf Basis der offiziellen Harvia-Produktseite und der dokumentierten Saunaloft-Varianten; keine eigene Nutzung oder Montage.",
  },
  sources: [
    {
      type: "manufacturer",
      title: "Harvia Produktseite Kammi 180",
      url: "https://www.harvia.com/en/products/SHKM180PS/barrel-sauna-kammi-180",
      checked_at: checkedAt,
    },
    {
      type: "merchant",
      title: "Saunaloft Produktseite Harvia Fasssauna Kammi 180",
      url: "https://shop-saunaloft.de/harvia-fasssauna-kammi-180/sw10343set.2",
      checked_at: checkedAt,
    },
    {
      type: "merchant",
      title: "Saunaloft Produktseite Harvia Fasssauna Kammi 180 mit Ofenwahl",
      url: "https://shop-saunaloft.de/harvia-fasssauna-kammi-180/sw10343set.1",
      checked_at: checkedAt,
    },
  ],
  updated_at: checkedAt,
});

overrides.entries[productId] = {
  intro: "Die Kammi 180 ist Harvias kompakte Fasssauna für zwei bis vier Personen. Mit 220 cm Durchmesser und 180 cm Außenlänge bleibt sie deutlich platzsparender als die größere Kammi-Ausführung.",
  detail: "Saunaloft führt die Kabine ohne Ofen sowie mit einer wählbaren 8-kW-Variante. Deshalb lässt sich aus dem Kabinenangebot allein weder eine feste Netzspannung noch ein betriebsfertiger Anschluss ableiten. Harvia nennt 40-mm-Fichtenholz, zwei Bänke und eine Höhe von 2,2 m; Fundament, Ofenwahl und Elektroplanung bleiben Aufgaben für den konkreten Aufstellort.",
};
overrides.updated_at = checkedAt;

const catalogGate = readiness.gates.find((gate) => gate.id === "catalog_quality");
if (catalogGate) catalogGate.detail = "516 eindeutige Produktdatensätze werden bei jedem Build gegen Quellen-, Preis-, Händler- und Schemakriterien geprüft.";
readiness.updated_at = checkedAt;

const snapshot = powerEvidence.snapshot;
snapshot.products = 516;
snapshot.voltage_not_assigned += 1;
snapshot.no_oven_or_unconfigured += 1;
powerEvidence.updated_at = checkedAt;

const batch = {
  schema_version: 1,
  batch_id: "data-maintenance-2026-09-08-kammi-180",
  model: "luna",
  reviewed_at: checkedAt,
  source_policy: "Only official manufacturer facts and directly checked Saunaloft variant pages; no inferred voltage or capacity beyond the documented ranges.",
  added_products: [productId],
  added_offers: 2,
  affiliate_status: "pending-next-awin-sync",
  held_candidates: [
    "Saunaloft Kammi 220 feed rows remain held until the current feed exposes a canonical URL and a one-to-one match to the existing Kammi Barrel Large record.",
    "Kammi Cube candidates remain held because the Saunaloft candidate URLs identify Kammi 180/220, not the Cube model.",
    "Benz24 ambiguous variant candidates remain held; no fuzzy activation was performed.",
  ],
};

await Promise.all([
  writeJson(productsPath, products),
  writeJson(overridesPath, overrides),
  writeJson(readinessPath, readiness),
  writeJson(powerEvidencePath, powerEvidence),
  writeJson(batchPath, batch),
]);

console.log(`Data maintenance complete: ${productId} added with 2 documented Saunaloft offers.`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
