import { readFile, writeFile } from "node:fs/promises";
import { assertFeedListUrl, parseEligibleFeeds, resolveTargetFeeds } from "./feed-list.mjs";
import { findCatalogCandidates } from "./catalog-candidates.mjs";
import { readFeedRows } from "./source.mjs";

const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
if (!rawUrl) throw new Error("AWIN_FEED_LIST_URL is not configured");

const [products, feedListRows] = await Promise.all([
  readFile("data/products.json", "utf8").then(JSON.parse),
  readFeedRows(assertFeedListUrl(rawUrl)),
]);
const targets = resolveTargetFeeds(parseEligibleFeeds(feedListRows));
const target = targets.find((candidate) => candidate.merchantId === "benz24");
if (!target) throw new Error("Benz24 target feed is missing");
const rows = await readFeedRows(target.entry.feedUrl, {
  maxDownloadBytes: 250_000_000,
  maxRows: 250_000,
  userAgent: "SelectYourSauna-AwinCatalogCandidateAudit/1.0",
});
const candidates = findCatalogCandidates(products, rows, { merchantName: "Benz24" });
const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source: "Awin authenticated Benz24 Deutschland product feed",
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

await writeFile("data/awin-catalog-candidates.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Benz24 catalog audit: ${report.unlinked_candidates} unlinked and ${report.already_linked_candidates} already linked candidates.`);
