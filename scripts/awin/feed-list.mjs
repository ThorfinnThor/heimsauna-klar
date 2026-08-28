const ELIGIBLE_MEMBERSHIP = new Set(["active", "joined"]);
const GERMAN_LANGUAGE = /^(?:de|de[-_]de|german|deutsch)$/i;

function normalizedKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function field(row, ...names) {
  const wanted = new Set(names.map(normalizedKey));
  const key = Object.keys(row).find((candidate) => wanted.has(normalizedKey(candidate)));
  const value = key ? row[key] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function assertFeedListUrl(raw) {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.hostname !== "ui.awin.com" || !/\/feedlist$/i.test(url.pathname)) {
    throw new Error("AWIN_FEED_LIST_URL is not an allowed Awin feed-list URL");
  }
  if (url.username || url.password || url.port || url.search || url.hash) {
    throw new Error("AWIN_FEED_LIST_URL contains unsupported URL components");
  }
  return url.toString();
}

export function parseEligibleFeeds(rows) {
  return rows.flatMap((row) => {
    const membershipStatus = field(row, "membership_status", "membership status", "status");
    const language = field(row, "language", "feed_language", "feed language");
    if (membershipStatus && !ELIGIBLE_MEMBERSHIP.has(membershipStatus.toLowerCase())) return [];
    if (language && !GERMAN_LANGUAGE.test(language)) return [];
    const advertiserId = field(row, "advertiser_id", "advertiser id");
    const advertiserName = field(row, "advertiser_name", "advertiser name");
    if (!advertiserId || !/^\d+$/.test(advertiserId) || !advertiserName) return [];
    return [{
      advertiserId,
      advertiserName,
      membershipStatus: membershipStatus ?? "not stated",
      feedId: field(row, "feed_id", "feed id") ?? null,
      feedName: field(row, "datafeed_name", "datafeed name", "feed_name", "feed name") ?? null,
      language: language ?? null,
      lastUpdated: field(row, "last_update", "last update", "last_updated", "last updated") ?? null,
      productCount: Number(field(row, "products", "product_count", "product count")?.replace(/[^\d]/g, "")) || null,
    }];
  });
}

export function discoverTargets(entries) {
  const targets = [
    { merchantId: "artsauna", label: "Artsauna", matches: (name) => normalizedKey(name).includes("artsauna") },
    { merchantId: "home-deluxe", label: "Home Deluxe", matches: (name) => normalizedKey(name).includes("homedeluxe") },
  ];

  return targets.map((target) => {
    const matches = entries.filter((entry) => target.matches(entry.advertiserName));
    const advertiserIds = [...new Set(matches.map((entry) => entry.advertiserId))];
    return {
      merchant_id: target.merchantId,
      expected_name: target.label,
      status: advertiserIds.length === 1 ? "found" : advertiserIds.length === 0 ? "missing" : "ambiguous",
      advertiser_id: advertiserIds.length === 1 ? advertiserIds[0] : null,
      advertiser_names: [...new Set(matches.map((entry) => entry.advertiserName))].sort(),
      feeds: matches.map((entry) => ({
        membershipStatus: entry.membershipStatus,
        feedId: entry.feedId,
        feedName: entry.feedName,
        language: entry.language,
        lastUpdated: entry.lastUpdated,
        productCount: entry.productCount,
      })),
    };
  });
}
