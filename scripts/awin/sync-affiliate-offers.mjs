import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolveTargetFeeds, assertFeedListUrl, discoverTargets, parseEligibleFeeds } from "./feed-list.mjs";
import { applyMatches, matchExactOffers, trackingHosts } from "./matcher.mjs";
import { readFeedRows } from "./source.mjs";

const TARGET_DETAILS = {
  artsauna: {
    focus: "Infrarotkabinen sowie Indoor- und Outdoor-Saunen von Artsauna.",
  },
  "home-deluxe": {
    focus: "Infrarotkabinen sowie traditionelle Indoor- und Outdoor-Saunen von Home Deluxe.",
  },
  benz24: {
    focus: "Saunahäuser und Kabinen etablierter Hersteller; Zuordnung ausschließlich über die exakte Benz24-Produkt-URL.",
  },
  intergard: {
    focus: "Innensaunen von InterGard; Aktivierung erst nach vollständiger technischer Quellenprüfung.",
  },
  saunaloft: {
    focus: "Saunen, Saunahäuser und Infrarotangebote von Saunaloft; Aktivierung nur bei exakter Produkt-URL-Zuordnung.",
  },
  gartenhausfabrik: {
    focus: "Garten- und Saunahausangebote von GartenHausfabrik; nur eindeutig belegte Sauna- und Saunahaus-Modelle werden aktiviert.",
  },
};

const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
if (!rawUrl) throw new Error("AWIN_FEED_LIST_URL is not configured");

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const generatedAt = new Date().toISOString();

const [products, merchants, affiliatePolicy, legal, launchReadiness] = await Promise.all([
  readJson("data/products.json"),
  readJson("data/merchants.json"),
  readJson("content/de/affiliate.json"),
  readJson("content/de/legal.json"),
  readJson("data/launch-readiness.json"),
]);

const feedListRows = await readFeedRows(assertFeedListUrl(rawUrl));
const eligibleFeeds = parseEligibleFeeds(feedListRows);
const targets = resolveTargetFeeds(eligibleFeeds);
const allMatches = [];
const targetReports = [];

for (const target of targets) {
  const merchant = merchants.find((candidate) => candidate.id === target.merchantId);
  if (!merchant) throw new Error(`Missing merchant registry entry: ${target.merchantId}`);
  const rows = await readFeedRows(target.entry.feedUrl, {
    maxDownloadBytes: 250_000_000,
    maxRows: 250_000,
    userAgent: "SelectYourSauna-AffiliateSync/1.0",
  });
  const advertiserRows = rows.filter((row) => {
    const id = value(row, "merchant_id", "merchant id", "advertiser_id", "advertiser id");
    return id === undefined || id === target.advertiserId;
  });
  const programId = `awin-${target.merchantId}`;
  const result = matchExactOffers(products, {
    merchantName: merchant.name,
    merchantId: target.merchantId,
    programId,
    advertiserId: target.advertiserId,
  }, advertiserRows);
  allMatches.push(...result.matches);
  targetReports.push({
    merchant_id: target.merchantId,
    advertiser_id: target.advertiserId,
    advertiser_name: target.entry.advertiserName,
    feed_id: target.entry.feedId,
    feed_name: target.entry.feedName,
    feed_rows: rows.length,
    catalog_offers: result.catalogOfferCount,
    exact_matches: result.matches.length,
    invalid_tracking_links: result.invalidTrackingLinks,
    unmatched_product_ids: result.unmatchedProductIds,
  });
  upsertApprovedProgram(affiliatePolicy, merchant, target, result.matches, today);
}

const updatedProducts = applyMatches(products, allMatches);
const activeAffiliateOffers = updatedProducts.flatMap((product) => product.commercial.offers).filter((offer) => offer.affiliate).length;
updatePublicDisclosures({ affiliatePolicy, legal, launchReadiness, activeAffiliateOffers, today });

const discoveryReport = {
  schema_version: 1,
  generated_at: generatedAt,
  source: "Awin authenticated product feed list",
  secret_included: false,
  eligible_feeds: eligibleFeeds.map((feed) => ({
    advertiserId: feed.advertiserId,
    advertiserName: feed.advertiserName,
    membershipStatus: feed.membershipStatus,
    feedId: feed.feedId,
    feedName: feed.feedName,
    language: feed.language,
    lastUpdated: feed.lastUpdated,
    productCount: feed.productCount,
  })),
  advertisers: discoverTargets(eligibleFeeds),
};
const syncReport = {
  schema_version: 1,
  generated_at: generatedAt,
  source: "Awin authenticated product feeds",
  secret_included: false,
  matching_policy: "Exact normalized merchant product URL only; no fuzzy product activation",
  products_total: updatedProducts.length,
  newly_matched_offers: allMatches.length,
  active_affiliate_offers: activeAffiliateOffers,
  targets: targetReports,
};

await writeJsonFilesAtomically({
  "data/products.json": updatedProducts,
  "data/merchants.json": merchants,
  "content/de/affiliate.json": affiliatePolicy,
  "content/de/legal.json": legal,
  "data/launch-readiness.json": launchReadiness,
  "data/awin-feed-discovery.json": discoveryReport,
  "data/awin-affiliate-sync-report.json": syncReport,
});

for (const report of targetReports) {
  console.log(`${report.advertiser_name}: ${report.exact_matches}/${report.catalog_offers} exact catalog matches.`);
}
console.log(`Awin sync completed: ${activeAffiliateOffers} active affiliate links; no secret URLs persisted.`);

function value(row, ...names) {
  const normalize = (input) => input.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const wanted = new Set(names.map(normalize));
  const key = Object.keys(row).find((candidate) => wanted.has(normalize(candidate)));
  const raw = key ? row[key] : undefined;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function upsertApprovedProgram(policy, merchant, target, matches, checkedAt) {
  const programId = `awin-${target.merchantId}`;
  const current = policy.programs.find((program) => program.id === programId);
  const hosts = [...new Set([...(current?.tracking_hosts ?? []), ...trackingHosts(matches)])].sort();
  const program = {
    id: programId,
    name: target.label,
    network: "Awin",
    program_id: target.advertiserId,
    status: "approved",
    focus: TARGET_DETAILS[target.merchantId].focus,
    commission_snapshot: "Aktuelle Konditionen im Awin-Publisher-Konto",
    cookie_days: null,
    direct_linking: true,
    tracking_hosts: hosts,
    advertiser_merchant_ids: [target.merchantId],
    url: `https://ui.awin.com/merchant-profile/${target.advertiserId}`,
    checked_at: checkedAt,
  };
  if (current) Object.assign(current, program);
  else policy.programs.push(program);
  if (!merchant.candidate_program_ids.includes(programId)) merchant.candidate_program_ids.push(programId);
  if (matches.length > 0) merchant.affiliate = { status: "active", program_id: programId };
}

function updatePublicDisclosures({ affiliatePolicy: policy, legal: legalContent, launchReadiness: readiness, activeAffiliateOffers: count, today: checkedAt }) {
  policy.updated_at = checkedAt;
  policy.current_status = count > 0 ? "active" : "inactive";
  policy.accent = count > 0 ? `${count} Affiliate-Links sind aktiv.` : "Aktuell sind 0 Affiliate-Links aktiv.";
  policy.description = count > 0
    ? "Vergütete Awin-Links werden nur für exakt zugeordnete Händlerangebote eingesetzt. Herstellerquellen, Produktauswahl und Sortierung bleiben davon unabhängig."
    : "Herstellerquellen bleiben unverändert. Vergütete Händlerlinks werden erst nach Programmfreigabe und exakter Produktzuordnung ergänzt.";

  legalContent.updated_at = checkedAt;
  const externalLinks = legalContent.privacy.sections.find((section) => section.title === "Externe Produkt- und Quellenlinks");
  const cookies = legalContent.privacy.sections.find((section) => section.title === "Cookies, Analyse und Marketing");
  if (count > 0) {
    if (externalLinks) externalLinks.copy = "Die Website enthält Links zu Herstellern, Händlern, Dokumentationen und Behörden. Als Affiliate-Link gekennzeichnete Händlerlinks führen über Awin zum Anbieter. Erst beim Anklicken wird die externe Adresse aufgerufen; Awin und der Händler können dabei technisch erforderliche Aufrufdaten verarbeiten. Für die weitere Datenverarbeitung gelten die Hinweise des jeweiligen Anbieters.";
    if (cookies) cookies.copy = "Select Your Sauna setzt keine eigenen Analyse- oder Werbeskripte und keine hierfür bestimmten Cookies ein. Eine Verbindung zum Affiliate-Netzwerk entsteht erst, wenn ein entsprechend gekennzeichneter Link bewusst angeklickt wird. Technisch notwendige Vorgänge des Hosting- und Sicherheitsdienstleisters bleiben hiervon unberührt.";
    legalContent.affiliate.intro = "Einzelne, ausdrücklich gekennzeichnete Händlerlinks sind Affiliate-Links. Erfolgt nach einem solchen Klick ein qualifizierter Kauf, kann SeitenHafen361 eine Vergütung erhalten; für Nutzerinnen und Nutzer ändert sich der Preis dadurch nicht.";
    legalContent.affiliate.sections = [
      {
        title: "Kennzeichnung und Technik",
        copy: "Aktive Affiliate-Links sind direkt am Link als Affiliate-Link bezeichnet und technisch mit sponsored und nofollow gekennzeichnet. Die Weiterleitung erfolgt über das Partnernetzwerk Awin zum jeweiligen Händler.",
      },
      {
        title: "Redaktionelle Unabhängigkeit",
        copy: "Provisionen bestimmen weder die Aufnahme eines Produkts noch Filter, Sortierung oder redaktionelle Einordnung. Es gibt keine bezahlten Platzierungen und keine gesponserten Ranglisten.",
      },
      {
        title: "Produktdaten",
        copy: "Preise und Verfügbarkeiten sind Momentaufnahmen mit Prüfdatum. Maßgeblich sind die Angaben des Händlers zum Kaufzeitpunkt.",
      },
    ];
  }

  readiness.updated_at = checkedAt;
  const controls = readiness.gates.find((gate) => gate.id === "affiliate_controls");
  const program = readiness.gates.find((gate) => gate.id === "affiliate_program");
  if (controls) controls.detail = count > 0
    ? `${count} exakt zugeordnete Awin-Links sind aktiv; nicht freigegebene Programme und nicht passende Feed-Zeilen bleiben gesperrt.`
    : "Affiliate-Links sind inaktiv und können ohne registrierten Händler sowie genehmigtes Programm nicht aktiviert werden.";
  if (program) {
    const approvedAwinNames = policy.programs
      .filter((item) => item.network.toLowerCase() === "awin" && item.status === "approved")
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right, "de"));
    const approvedPrograms = approvedAwinNames.length > 1
      ? `${approvedAwinNames.slice(0, -1).join(", ")} und ${approvedAwinNames.at(-1)}`
      : approvedAwinNames[0] ?? "Kein Awin-Programm";
    program.status = "ready";
    program.detail = count > 0
      ? `${approvedPrograms} sind bei Awin freigegeben; ${count} exakt zugeordnete Produktlinks sind aktiv.`
      : `${approvedPrograms} sind bei Awin freigegeben; für die Aktivierung fehlt noch eine exakte Produktzuordnung aus dem Feed.`;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJsonFilesAtomically(files) {
  const temporary = [];
  for (const [path, data] of Object.entries(files)) {
    const temp = `${path}.tmp`;
    await mkdir(path.split("/").slice(0, -1).join("/"), { recursive: true });
    await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    temporary.push([temp, path]);
  }
  for (const [temp, path] of temporary) await rename(temp, path);
}
