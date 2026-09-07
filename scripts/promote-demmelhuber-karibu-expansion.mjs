import { readFile, writeFile } from "node:fs/promises";

const reportPath = "data/awin-demmelhuber-karibu-source-review.json";
const reviewPath = "data/awin-demmelhuber-karibu-expansion-review.json";
const productsPath = "data/products.json";
const [report, review, products] = await Promise.all([readJson(reportPath), readJson(reviewPath), readJson(productsPath)]);

if (String(report.advertiser_id) !== review.advertiser_id || String(report.feed_id) !== review.feed_id) {
  throw new Error("Demmelhuber source report and editorial review do not describe the same Awin feed");
}
if (report.products.some((entry) => entry.page_status !== 200)) throw new Error("Every promoted Demmelhuber page must return HTTP 200");

const existingById = new Map(products.map((product) => [product.product_id, product]));
const capacityEvidence = await readJson("data/demmelhuber-capacity-evidence.json");
const newKeys = new Set(review.new_model_keys);
const classifiedKeys = new Set([...Object.keys(review.existing_product_by_key), ...newKeys]);
const grouped = Map.groupBy(report.products, (entry) => modelKey(entry.page_article));
const unknownKeys = [...grouped.keys()].filter((key) => !classifiedKeys.has(key));
if (unknownKeys.length) throw new Error(`Unclassified Demmelhuber models: ${unknownKeys.join(", ")}`);

const assignedUrls = new Map();
for (const product of products) {
  for (const offer of product.commercial.offers) assignedUrls.set(normalizeUrl(offer.url), product.product_id);
}

let offersAdded = 0;
let offersAlreadyPresent = 0;
for (const [key, productId] of Object.entries(review.existing_product_by_key)) {
  const product = existingById.get(productId);
  if (!product) throw new Error(`Reviewed product is missing: ${productId}`);
  for (const source of grouped.get(key) || []) {
    const result = attachOffer(product, source);
    offersAdded += result === "added" ? 1 : 0;
    offersAlreadyPresent += result === "existing" ? 1 : 0;
  }
}

let productsAdded = 0;
for (const key of review.new_model_keys) {
  const sources = grouped.get(key);
  if (!sources?.length) throw new Error(`Reviewed new model is missing from source report: ${key}`);
  if (sources.some((entry) => !entry.dimensions_cm)) throw new Error(`New model lacks complete dimensions: ${key}`);
  const productId = makeProductId(sources[0], key);
  let product = existingById.get(productId);
  const refreshed = createProduct(sources[0], key);
  if (!product) {
    product = refreshed;
    products.push(product);
    existingById.set(productId, product);
    productsAdded += 1;
  } else {
    const offers = product.commercial.offers;
    const publishedSources = product.sources;
    Object.assign(product, refreshed);
    product.commercial.offers = offers;
    product.sources = publishedSources;
  }
  ensureOfficialSource(product, sources[0]);
  synchronizePower(product, sources[0]);
  for (const source of sources) {
    const result = attachOffer(product, source);
    offersAdded += result === "added" ? 1 : 0;
    offersAlreadyPresent += result === "existing" ? 1 : 0;
  }
}

const demmelhuberOfferCount = products.flatMap((product) => product.commercial.offers)
  .filter((offer) => offer.merchant === review.merchant_name).length;
if (demmelhuberOfferCount !== report.products.length) {
  throw new Error(`Expected ${report.products.length} Demmelhuber offers after full-catalog promotion, found ${demmelhuberOfferCount}`);
}

await writeFile(productsPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
console.log(`Demmelhuber full Karibu catalog: ${productsAdded} products added, ${offersAdded} offers added, ${offersAlreadyPresent} offers already present, ${demmelhuberOfferCount} offers total.`);

function attachOffer(product, source) {
  const normalized = normalizeUrl(source.merchant_url);
  const assignedProduct = assignedUrls.get(normalized);
  if (assignedProduct && assignedProduct !== product.product_id) {
    throw new Error(`${source.merchant_url} is already assigned to ${assignedProduct}, not ${product.product_id}`);
  }
  const current = product.commercial.offers.find((offer) => normalizeUrl(offer.url) === normalized);
  if (current) {
    if (product.product_id === "karibu-sauna-sahib-1") {
      current.selection_required = true;
      current.configuration = "Abweichende Ausführung · Energiespartür · mit Dachkranz · 221 × 198 × 212 cm · ohne Ofen";
    }
    return "existing";
  }
  product.commercial.offers.push({
    merchant: review.merchant_name,
    price: source.feed_price,
    availability: "feed-listed",
    url: source.merchant_url,
    affiliate: false,
    last_checked: review.reviewed_at,
    configuration: formatConfiguration(source),
    selection_required: !configurationMatchesProduct(product, source),
  });
  if (!product.sources.some((entry) => normalizeUrl(entry.url) === normalized)) {
    product.sources.push({
      type: "merchant",
      title: `Demmelhuber Produktseite ${source.page_article}`,
      url: source.merchant_url,
      checked_at: review.reviewed_at,
    });
  }
  product.updated_at = review.reviewed_at;
  assignedUrls.set(normalized, product.product_id);
  return "added";
}

function createProduct(source, key) {
  const capacity = resolveCapacity(source, key);
  const category = source.category;
  const outdoor = category === "outdoor";
  const infrared = category === "infrared";
  const withoutHeater = source.heater_configuration === "ohne Ofen";
  const dimensions = source.dimensions_cm;
  const modelName = displayModelName(source, key);
  const construction = source.wall_thickness_mm
    ? `${source.wall_thickness_mm} mm Wandstärke sind auf der Händlerseite ausgewiesen`
    : `${dimensions.width} × ${dimensions.depth} × ${dimensions.height} cm Außenmaß sind vollständig dokumentiert`;
  const heatAdvantage = withoutHeater
    ? "Ofen und Steuerung können passend zum Projekt separat gewählt werden"
    : `${source.power_kw.toLocaleString("de-DE")} kW und ${source.voltage} V sind für die angebotene Konfiguration genannt`;
  const capacityCaveat = capacity.basis === "conservative-planning"
    ? `Die Kapazität ist ein konservativer Planungswert; Bankmaße und gewünschter Sitzabstand sind vor dem Kauf zu prüfen`
    : "Sitz- und Liegeplätze sind unterschiedliche Nutzungsweisen und werden nicht addiert";

  return {
    product_id: makeProductId(source, key),
    brand: "Karibu",
    model: modelName,
    family: null,
    category,
    status: "verified",
    dimensions_cm: dimensions,
    people: {
      min: 1,
      max: capacity.max,
      seats: capacity.max,
      lying_places: capacity.lying_places,
      basis: capacity.basis,
    },
    power: withoutHeater ? {
      voltage: "none",
      kw: null,
      plug_type: null,
      electrician_required: false,
      notes: "Das geprüfte Angebot wird ohne Ofen geführt. Leistung, Spannung, Steuerung und Installation richten sich nach der später gewählten Saunatechnik.",
    } : {
      voltage: source.voltage,
      kw: source.power_kw,
      plug_type: source.voltage === 230 ? "230-V-Anschluss laut Händlerangabe" : null,
      electrician_required: source.voltage === 400,
      notes: source.voltage === 400
        ? "Demmelhuber nennt für diese Konfiguration einen 400-V-Starkstromanschluss. Planung und Anschluss gehören in die Hände einer Elektrofachkraft."
        : "Demmelhuber nennt für diese Konfiguration 230 V. Anleitung, Absicherung und die örtlichen Anschlussbedingungen bleiben maßgeblich.",
    },
    sauna: {
      type: infrared ? "Sauna-Infrarot-Kombination" : outdoor ? (/^fass/i.test(source.page_article) ? "Fasssauna" : "Saunahaus") : (/^massivholz/i.test(source.page_article) ? "Massivholzsauna" : "Finnische Sauna"),
      indoor_outdoor: outdoor ? "outdoor" : "indoor",
      heater_type: source.heater_configuration,
      max_temp_c: null,
      heat_up_time_min: null,
      wood_type: source.wood_type || "Nordische Fichte",
    },
    commercial: { currency: "EUR", price_status: "current", offers: [] },
    editorial: {
      pros: [`${capacity.max} Sitzplätze und ${capacity.lying_places} ${capacity.lying_places === 1 ? "Liegeplatz" : "Liegeplätze"} laut Karibu-Produktdokument`, heatAdvantage, construction],
      cons: [capacityCaveat, outdoor ? "Fundament, Dachdeckung und Montagezugang sind nicht in der Produktfläche enthalten" : "Montageabstände und Türweg müssen zusätzlich zum Außenmaß eingeplant werden", source.voltage === 400 ? "Der Ofen benötigt einen fachgerecht geplanten Starkstromanschluss" : withoutHeater ? "Saunatechnik ist im dokumentierten Angebot nicht enthalten" : "Die Anschlussbedingungen müssen am Aufstellort geprüft werden"],
      ideal_for: [outdoor ? "Gartenprojekte mit vorbereitetem, tragfähigem Untergrund" : `Innenräume mit ausreichend Platz für ${dimensions.width} × ${dimensions.depth} cm zuzüglich Herstellerabständen`, withoutHeater ? "Käufer, die Ofen und Steuerung selbst passend zusammenstellen" : `Projekte mit geklärtem ${source.voltage}-V-Anschluss`, infrared ? "Nutzer, die zwischen Infrarotwärme und Saunabetrieb wählen möchten" : `Planungen für bis zu ${capacity.max} Personen`],
      not_for: [outdoor ? "Grundstücke ohne geklärten Zugang und Fundament" : "Räume ohne geprüfte Lüftungs- und Sicherheitsabstände", source.voltage === 400 ? "Standorte ohne realisierbaren Starkstromanschluss" : withoutHeater ? "Kaufwünsche mit vollständig enthaltenem Ofenpaket" : "Inbetriebnahme ohne Prüfung der Elektroinstallation"],
      test_status: "not_tested",
      editorial_score: null,
      disclosure: "Sitz- und Liegeplätze stammen aus dem Karibu-Produktdokument. Ofenpaket und Außenmaß beziehen sich auf das genannte Demmelhuber-Angebot. Keine eigene Nutzung oder Montage.",
    },
    sources: [{
      type: "merchant",
      title: `Demmelhuber Produktseite ${source.page_article}`,
      url: source.merchant_url,
      checked_at: review.reviewed_at,
    }],
    updated_at: review.reviewed_at,
  };
}

function ensureOfficialSource(product, source) {
  const sku = new URL(source.merchant_url).pathname.match(/-(\d+)$/)?.[1];
  if (!sku) throw new Error(`Cannot derive Karibu document SKU from ${source.merchant_url}`);
  const url = `https://www.karibu.de/wb-pdf-creator/create-product-document?sku=${sku}`;
  if (!product.sources.some((entry) => entry.url === url)) {
    product.sources.push({
      type: "manufacturer",
      title: `Karibu Produktdokument ${product.model}`,
      url,
      checked_at: review.reviewed_at,
    });
  }
}

function synchronizePower(product, source) {
  const withoutHeater = source.heater_configuration === "ohne Ofen";
  if (withoutHeater) {
    product.power = {
      voltage: "none",
      kw: null,
      plug_type: null,
      electrician_required: false,
      notes: "Das geprüfte Angebot wird ohne Ofen geführt. Leistung, Spannung, Steuerung und Installation richten sich nach der später gewählten Saunatechnik.",
    };
    return;
  }
  product.power = {
    voltage: source.voltage ?? "none",
    kw: source.power_kw,
    plug_type: source.voltage === 230 ? "230-V-Anschluss laut Händlerangabe" : null,
    electrician_required: source.voltage === 400,
    notes: source.voltage === 400
      ? "Demmelhuber nennt für diese Konfiguration einen 400-V-Starkstromanschluss. Planung und Anschluss gehören in die Hände einer Elektrofachkraft."
      : source.voltage === 230
        ? "Demmelhuber nennt für diese Konfiguration 230 V. Anleitung, Absicherung und die örtlichen Anschlussbedingungen bleiben maßgeblich."
        : "Die geprüfte Produktseite nennt die Ofenleistung, weist die Netzspannung für die gewählte Konfiguration jedoch nicht eindeutig aus. Anschluss und Absicherung sind mit einer Elektrofachkraft zu klären.",
  };
}

function resolveCapacity(source, key) {
  const evidence = capacityEvidence.entries[makeProductId(source, key)];
  if (!evidence || !Number.isInteger(evidence.seats) || evidence.seats < 1 || !Number.isInteger(evidence.lying_places)) {
    throw new Error(`Missing reviewed manufacturer capacity for ${key}`);
  }
  return { max: evidence.seats, lying_places: evidence.lying_places, basis: "source-stated" };
}

function displayModelName(source, key) {
  const proper = key.split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const prefix = source.category === "outdoor" ? (/^fass/i.test(source.page_article) ? "Fasssauna" : "Saunahaus") : source.category === "infrared" ? "Sauna-Infrarot-Kombination" : "Sauna";
  if (source.heater_configuration === "ohne Ofen") return `${prefix} ${proper} · ohne Ofen`;
  if (source.heater_configuration === "Bio-Kombiofen") return `${prefix} ${proper} · ${source.power_kw.toLocaleString("de-DE")} kW Bio`;
  if (/separat/i.test(source.heater_configuration)) return `${prefix} ${proper} · ${source.power_kw.toLocaleString("de-DE")} kW mit Steuergerät`;
  return `${prefix} ${proper} · ${source.power_kw.toLocaleString("de-DE")} kW mit integrierter Steuerung`;
}

function formatConfiguration(source) {
  const { width, depth, height } = source.dimensions_cm || source.standard_dimensions_cm || {};
  const size = width && depth && height ? `${width} × ${depth} × ${height} cm` : source.page_article;
  const heat = source.heater_configuration === "ohne Ofen" ? "ohne Ofen" : `${source.power_kw.toLocaleString("de-DE")} kW · ${source.heater_configuration}`;
  return `${size} · ${heat}`;
}

function configurationMatchesProduct(product, source) {
  const dimensionsMatch = source.dimensions_cm
    ? product.dimensions_cm.width === source.dimensions_cm.width && product.dimensions_cm.depth === source.dimensions_cm.depth
    : false;
  const powerMatches = product.power.kw === source.power_kw;
  const productText = `${product.model} ${product.sauna.heater_type}`.toLowerCase();
  const sourceText = source.heater_configuration.toLowerCase();
  const heatMatches = sourceText === "ohne ofen" ? product.power.kw === null : sourceText.includes("bio") ? productText.includes("bio") : sourceText.includes("integriert") ? productText.includes("integ") : true;
  return dimensionsMatch && powerMatches && heatMatches;
}

function modelKey(title) {
  const lower = title.toLowerCase().replace(/sauna\s*\/\s*infrarotkabine/, "infrarotkabine");
  const prefix = lower.match(/^(fasssauna|gartensauna|infrarotkabine|massivholzsauna|saunahaus|sauna)\s+(.+?)\s+\d+(?:[,.]\d+)?\s*x/);
  if (!prefix) throw new Error(`Cannot derive model key from ${title}`);
  const raw = prefix[2].replace(/[^a-z0-9äöüß]+/g, " ").trim();
  if (prefix[1] === "fasssauna" && /^\d/.test(raw)) return `fasssauna ${raw}`;
  if (prefix[1] === "gartensauna" && raw.startsWith("fasshaus")) return raw;
  return raw;
}

function makeProductId(source, key) {
  const suffix = new URL(source.merchant_url).pathname.match(/-(\d+)$/)?.[1] || source.feed_sku.split("-").at(-1);
  const type = source.category === "outdoor" ? (/^fass/i.test(source.page_article) ? "fasssauna" : "saunahaus") : source.category === "infrared" ? "sauna-infrarot" : "sauna";
  return `karibu-${type}-${slugify(key)}-${suffix}`;
}

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
