import { mkdir, writeFile } from "node:fs/promises";
import { assertFeedListUrl, discoverTargets, parseEligibleFeeds } from "./feed-list.mjs";
import { readFeedRows } from "./source.mjs";

const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
if (!rawUrl) throw new Error("AWIN_FEED_LIST_URL is not configured");

const feedListUrl = assertFeedListUrl(rawUrl);
const rows = await readFeedRows(feedListUrl);
const eligibleFeeds = parseEligibleFeeds(rows);
const advertisers = discoverTargets(eligibleFeeds);
const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
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
  advertisers,
};

await mkdir("data", { recursive: true });
await writeFile("data/awin-feed-discovery.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");

for (const advertiser of advertisers) {
  console.log(`${advertiser.expected_name}: ${advertiser.status}${advertiser.advertiser_id ? ` (${advertiser.advertiser_id})` : ""}`);
}
if (advertisers.some((advertiser) => advertiser.status !== "found")) {
  console.log("Discovery completed with unresolved advertisers; no affiliate links were activated.");
}
