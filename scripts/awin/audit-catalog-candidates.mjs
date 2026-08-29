import { readFile, writeFile } from "node:fs/promises";
import { assertFeedListUrl, parseEligibleFeeds, resolveTargetFeeds } from "./feed-list.mjs";
import { findCatalogCandidates } from "./catalog-candidates.mjs";
import { readFeedRows } from "./source.mjs";

const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
if (!rawUrl) throw new Error("AWIN_FEED_LIST_URL is not configured");
const requestedMerchantId = process.env.AWIN_CANDIDATE_MERCHANT_ID?.trim() || "benz24";

const [products, feedListRows] = await Promise.all([
  readFile("data/products.json", "utf8").then(JSON.parse),
  readFeedRows(assertFeedListUrl(rawUrl)),
]);
const targets = resolveTargetFeeds(parseEligibleFeeds(feedListRows));
const target = targets.find((candidate) => candidate.merchantId === requestedMerchantId);
if (!target) throw new Error(`Candidate target feed is missing: ${requestedMerchantId}`);
const rows = await readFeedRows(target.entry.feedUrl, {
  maxDownloadBytes: 250_000_000,
  maxRows: 250_000,
  userAgent: "SelectYourSauna-AwinCatalogCandidateAudit/1.0",
});
const candidates = findCatalogCandidates(products, rows, { merchantName: target.label });
const reportPath = target.merchantId === "benz24"
  ? "data/awin-catalog-candidates.json"
  : `data/awin-catalog-candidates-${target.merchantId}.json`;
const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source: `Awin authenticated ${target.entry.advertiserName} product feed`,
  secret_included: false,
  activation_policy: "Candidate tokens only; no catalog records, offers, prices, or affiliate links changed",
  advertiser_id: target.advertiserId,
  advertiser_name: target.entry.advertiserName,
  feed_id: target.entry.feedId,
  feed_name: target.entry.feedName,
  feed_rows: rows.length,
  candidates_total: candidates.length,
  unlinked_candidates: candidates.filter((candidate) => !candidate.already_linked).length,
  already_linked_candidates: candidates.filter((candidate) => candidate.already_linked).length,
  candidates,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`${target.entry.advertiserName} catalog audit: ${report.unlinked_candidates} unlinked and ${report.already_linked_candidates} already linked candidates (${reportPath}).`);
