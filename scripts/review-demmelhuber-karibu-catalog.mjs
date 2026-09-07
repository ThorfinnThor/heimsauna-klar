import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const feedPath = "data/awin-catalog-products-demmelhuber.json";
const outputPath = "data/awin-demmelhuber-karibu-source-review.json";
const feed = JSON.parse(await readFile(feedPath, "utf8"));

const UNIT_PREFIX = /^(?:fasssauna|gartensauna|infrarotkabine|massivholzsauna|saunahaus|sauna)\b/i;
const ACCESSORY = /(?:abluftschieber|anbaudach|aromatopf|aufguss|bankblende|bodenrost|duft|hygrometer|klimamesser|klimamessstation|kopfstütze|pflegebox|rückenlehne|salzkristall|sanduhr|saunaofen|saunaheizung|saunalampe|saunastein|saunasteuerung|saunatür|saunazubehör|schleppdach|schöpfkelle|silikonkabel|technikpaket|thermometer|wanduhr)/i;

const candidates = feed.products.filter((product) => {
  return String(product.brand || "").toLowerCase() === "karibu"
    && UNIT_PREFIX.test(product.name)
    && !ACCESSORY.test(product.name);
});

const results = new Array(candidates.length);
let cursor = 0;
const workers = Array.from({ length: 4 }, async () => {
  while (cursor < candidates.length) {
    const index = cursor++;
    results[index] = await inspect(candidates[index]);
  }
});
await Promise.all(workers);

const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source: `${feed.advertiser_name} Awin feed plus public Demmelhuber product pages`,
  secret_included: false,
  selection_policy: "Nur Karibu Saunakabinen, Saunahäuser, Garten- und Fasssaunen. Zubehör wird ausgeschlossen. Technische Angaben werden aus der jeweils erreichbaren Produktseite extrahiert und müssen vor Veröffentlichung gegen vorhandene Produkte abgeglichen werden.",
  advertiser_id: feed.advertiser_id,
  feed_id: feed.feed_id,
  feed_rows: feed.feed_rows,
  karibu_units_in_feed: candidates.length,
  reachable_pages: results.filter((entry) => entry.page_status === 200).length,
  products: results,
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Demmelhuber Karibu review: ${candidates.length} units, ${report.reachable_pages} reachable pages (${outputPath}).`);

async function inspect(product) {
  try {
    const inspectedUrl = new URL(product.url);
    inspectedUrl.searchParams.set("number", product.sku);
    const { stdout: responseBody } = await execFileAsync("curl", [
      "--silent",
      "--show-error",
      "--location",
      "--fail-with-body",
      "--max-time",
      "30",
      "--user-agent",
      "SelectYourSauna-CatalogReview/1.0",
      "--write-out",
      "\n__SELECTYOURSAUNA_HTTP__:%{http_code}:%{url_effective}",
      inspectedUrl.toString(),
    ], { maxBuffer: 4_000_000 });
    const marker = responseBody.lastIndexOf("\n__SELECTYOURSAUNA_HTTP__:");
    if (marker < 0) throw new Error("curl response metadata is missing");
    const html = responseBody.slice(0, marker);
    const [, statusText, finalUrl] = responseBody.slice(marker + 1).match(/^__SELECTYOURSAUNA_HTTP__:(\d+):(.*)$/) || [];
    const pageStatus = Number(statusText);
    const text = toText(html);
    const technical = text;
    const standardDimensions = parseDimensions(technical, /Außenmaß B x H x T\s*:?\s*([\d,.]+)\s*x\s*([\d,.]+)\s*x\s*([\d,.]+)\s*cm/i)
      || parseBthDimensions(technical, /Außenmaß\s*:?\s*([\d,.]+)\s*x\s*([\d,.]+)\s*x\s*([\d,.]+)\s*cm/i)
      || parsePlanDimensions(technical)
      || parseSeparateDimensions(technical, false);
    const roofDimensions = parseDimensions(technical, /Außenmaß mit Dachkranz B x H x T\s*:?\s*([\d,.]+)\s*x\s*([\d,.]+)\s*x\s*([\d,.]+)\s*cm/i)
      || parseBthDimensions(technical, /Außenmaß mit (?:Dach)?kranz\s*:?\s*([\d,.]+)\s*x\s*([\d,.]+)\s*x\s*([\d,.]+)\s*cm/i)
      || parseSeparateDimensions(technical, true);
    const powerKw = parseNumber(product.name.match(/([\d,.]+)\s*kW\b/i)?.[1]);
    const withoutHeater = /ohne Ofen/i.test(product.name);
    const voltage = withoutHeater ? null : inferVoltage(product.name, powerKw, technical);
    return {
      feed_name: product.name,
      feed_sku: product.sku,
      feed_price: product.price,
      merchant_url: product.url,
      page_status: pageStatus,
      final_url: finalUrl,
      canonical_url: decodeHtml(html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || finalUrl),
      page_article: extractArticleName(html),
      category: inferCategory(product.name),
      dimensions_cm: /mit Dachkranz/i.test(product.name) && roofDimensions ? roofDimensions : standardDimensions,
      standard_dimensions_cm: standardDimensions,
      roof_dimensions_cm: roofDimensions,
      power_kw: powerKw ?? null,
      voltage,
      heater_configuration: inferHeater(product.name),
      bank_count: parseInteger(technical.match(/Anzahl Bänke\s*:?\s*(\d+)/i)?.[1]),
      people_max: parsePeople(text),
      people_evidence: extractPeopleEvidence(text),
      lying_places: parseInteger(text.match(/(?:mit|für)\s+(\d+)\s+Liegen\b/i)?.[1])
        || parseInteger(text.match(/(\d+)\s*x\s*Saunaliege\b/i)?.[1]),
      wall_thickness_mm: parseNumber(technical.match(/Wandstärke\s*:?\s*([\d,.]+)\s*mm/i)?.[1]) ?? null,
      wood_type: inferWoodType(technical),
    };
  } catch (error) {
    return {
      feed_name: product.name,
      feed_sku: product.sku,
      feed_price: product.price,
      merchant_url: product.url,
      page_status: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseDimensions(text, pattern) {
  const match = text.match(pattern);
  if (!match) return null;
  const [width, height, depth] = match.slice(1).map(parseNumber);
  if (![width, height, depth].every(Number.isFinite)) return null;
  return { width, depth, height };
}

function parseBthDimensions(text, pattern) {
  const match = text.match(pattern);
  if (!match) return null;
  const [width, depth, height] = match.slice(1).map(parseNumber);
  if (![width, depth, height].every(Number.isFinite)) return null;
  return { width, depth, height };
}

function parsePlanDimensions(text) {
  const plan = text.match(/Außenmaße?(?:\s+B\s*x\s*T)?\s*:?\s*([\d,.]+)\s*x\s*([\d,.]+)\s*cm/i);
  if (!plan) return null;
  const width = parseNumber(plan[1]);
  const depth = parseNumber(plan[2]);
  const height = parseNumber(text.match(/(?:Firsthöhe(?:\s*\/\s*Seitenhöhe)?|Außenmaß Höhe|Seitenhöhe)\s*:?\s*([\d,.]+)\s*cm/i)?.[1]);
  return [width, depth, height].every(Number.isFinite) ? { width, depth, height } : null;
}

function parseSeparateDimensions(text, withRoof) {
  const suffix = withRoof ? "\\s+mit Dachkranz" : "";
  const width = parseNumber(text.match(new RegExp(`Außenmaß Breite${suffix}\\s*:?\\s*([\\d,.]+)\\s*cm`, "i"))?.[1]);
  const height = parseNumber(text.match(new RegExp(`Außenmaß Höhe${suffix}\\s*:?\\s*([\\d,.]+)\\s*cm`, "i"))?.[1])
    || (!withRoof ? parseNumber(text.match(/Firsthöhe\s*:?\s*([\d,.]+)\s*cm/i)?.[1]) : null);
  const depth = parseNumber(text.match(new RegExp(`Außenmaß Tiefe${suffix}\\s*:?\\s*([\\d,.]+)\\s*cm`, "i"))?.[1]);
  return [width, height, depth].every(Number.isFinite) ? { width, depth, height } : null;
}

function parsePeople(text) {
  const range = text.match(/(?:optimal|geeignet)?\s*(?:für)?\s*bis zu\s*(\d+)\s*[-–]\s*(\d+)\s*Personen/i);
  if (range) return Number(range[2]);
  const single = text.match(/(?:optimal|geeignet)?\s*(?:für)?\s*(?:bis zu\s*)?(\d+)\s*Personen/i);
  return single ? Number(single[1]) : null;
}

function extractPeopleEvidence(text) {
  const mentions = text.match(/[^.!?]{0,100}\b\d+(?:\s*[-–]\s*\d+)?\s*Personen\b[^.!?]{0,100}[.!?]?/gi) || [];
  return [...new Set(mentions.map((entry) => entry.trim()))].slice(0, 3);
}

function inferCategory(name) {
  if (/infrarot/i.test(name)) return "infrared";
  if (/^(?:fasssauna|gartensauna|saunahaus)/i.test(name)) return "outdoor";
  return "indoor";
}

function inferHeater(name) {
  if (/ohne Ofen/i.test(name)) return "ohne Ofen";
  if (/Bio.?Kombiofen/i.test(name)) return "Bio-Kombiofen";
  if (/Ofen.*integ/i.test(name)) return "Saunaofen mit integrierter Steuerung";
  if (/Ofen.*(?:Steuergerät|ext\.?\s*Steuerung)/i.test(name)) return "Saunaofen mit separatem Steuergerät";
  if (/Ofen/i.test(name)) return "Saunaofen";
  return "nicht eindeutig ausgewiesen";
}

function inferWoodType(text) {
  if (/nordische(?:r|s)?\s+Fichte/i.test(text)) return "Nordische Fichte";
  if (/Hemlock/i.test(text)) return "Hemlock";
  return null;
}

function inferVoltage(name, powerKw, text) {
  if (/230\s*V/i.test(name)) return 230;
  if (/400\s*V/i.test(name)) return 400;
  if (powerKw !== null) {
    const power = Number.isInteger(powerKw) ? `${powerKw}(?:[.,]0)?` : String(powerKw).replace(".", "[.,]");
    const exactConfiguration = text.match(new RegExp(`Leistung\\s*:?\\s*${power}\\s*kW[\\s\\S]{0,160}?Anschluss\\s*:?\\s*(230|400)\\s*V`, "i"));
    if (exactConfiguration) return Number(exactConfiguration[1]);
  }
  return null;
}

function extractArticleName(html) {
  const raw = html.match(/"articleName"\s*:\s*"((?:\\.|[^"\\])*)"/i)?.[1]
    || html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]
    || null;
  if (!raw) return null;
  try {
    return decodeHtml(JSON.parse(`"${raw}"`));
  } catch {
    return decodeHtml(raw);
  }
}

function toText(html) {
  return decodeHtml(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " "));
}

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:x27|39);|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function parseNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function parseInteger(value) {
  const number = parseNumber(value);
  return Number.isInteger(number) ? number : null;
}
