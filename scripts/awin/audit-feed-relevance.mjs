import { mkdir, writeFile } from "node:fs/promises";
import { assertFeedListUrl, parseEligibleFeeds } from "./feed-list.mjs";
import { auditFeedRows } from "./relevance.mjs";
import { readFeedRows } from "./source.mjs";

const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
if (!rawUrl) throw new Error("AWIN_FEED_LIST_URL is not configured");

const feedListRows = await readFeedRows(assertFeedListUrl(rawUrl));
const eligibleFeeds = parseEligibleFeeds(feedListRows);
const uniqueFeeds = [...new Map(eligibleFeeds.map((feed) => [feed.feedUrl, feed])).values()];
const audits = [];

for (const feed of uniqueFeeds) {
  try {
    const rows = await readFeedRows(feed.feedUrl, {
      maxDownloadBytes: 250_000_000,
      maxRows: 250_000,
      userAgent: "SelectYourSauna-AwinFeedAudit/1.0",
    });
    audits.push({
      advertiserId: feed.advertiserId,
      advertiserName: feed.advertiserName,
      feedId: feed.feedId,
      feedName: feed.feedName,
      language: feed.language,
      ...auditFeedRows(rows),
      status: "audited",
    });
  } catch (error) {
    audits.push({
      advertiserId: feed.advertiserId,
      advertiserName: feed.advertiserName,
      feedId: feed.feedId,
      feedName: feed.feedName,
      language: feed.language,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown feed error",
    });
  }
}

const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source: "Awin authenticated product feeds",
  secret_included: false,
  matching_policy: "Relevance signals only; no product data or affiliate links activated",
  audits,
};

await mkdir("data", { recursive: true });
await writeFile("data/awin-feed-relevance.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");

for (const audit of audits) {
  if (audit.status === "audited") {
    console.log(`${audit.advertiserName}: ${audit.signalRows} signal rows in ${audit.rowsScanned} feed rows.`);
  } else {
    console.log(`${audit.advertiserName}: feed audit failed (${audit.error}).`);
  }
}
