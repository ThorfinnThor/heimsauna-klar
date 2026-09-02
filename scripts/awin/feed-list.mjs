const ELIGIBLE_MEMBERSHIP = new Set(["active", "joined"]);
const GERMAN_LANGUAGE = /^(?:de|de[-_]de|german|deutsch)$/i;
const DARWIN_FEED_PATH = /^\/productdata-darwin-download\/publisher\/\d+\/[A-Za-z0-9_-]+\/\d+\/feed\/F?\d+\.csv\.gz$/;
const MAX_AUTO_FEEDS = 100;
const TARGETS = [
  { merchantId: "artsauna", label: "Artsauna", matches: (name) => normalizedKey(name).includes("artsauna") },
  { merchantId: "home-deluxe", label: "Home Deluxe", matches: (name) => normalizedKey(name).includes("homedeluxe") },
  {
    merchantId: "benz24",
    label: "Benz24",
    matches: (name) => normalizedKey(name).includes("benz24"),
    preferredFeed: (entry) => normalizedKey(entry.feedName ?? "").includes("deutschland"),
  },
  { merchantId: "intergard", label: "InterGard", matches: (name) => normalizedKey(name).includes("intergard") },
  { merchantId: "saunaloft", label: "Saunaloft", matches: (name) => normalizedKey(name).includes("saunaloft") },
  { merchantId: "gartenhausfabrik", label: "GartenHausfabrik", matches: (name) => normalizedKey(name).includes("gartenhausfabrik") },
  {
    merchantId: "wellness-point",
    label: "Wellness Point",
    matches: (name) => normalizedKey(name).includes("wellnesspoint"),
    preferredFeed: (entry) => normalizedKey(entry.feedName ?? "").includes("de"),
  },
];

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
  const seen = new Set();
  const entries = rows.flatMap((row) => {
    const membershipStatus = field(row, "membership_status", "membership status", "status");
    const language = field(row, "language", "feed_language", "feed language");
    if (membershipStatus && !ELIGIBLE_MEMBERSHIP.has(membershipStatus.toLowerCase())) return [];
    if (language && !GERMAN_LANGUAGE.test(language)) return [];
    const advertiserId = field(row, "advertiser_id", "advertiser id");
    const advertiserName = field(row, "advertiser_name", "advertiser name");
    if (!advertiserId || !/^\d+$/.test(advertiserId) || !advertiserName) return [];
    const rawFeedUrl = field(
      row,
      "url",
      "download_url",
      "download url",
      "feed_url",
      "feed url",
      "feed_download_url",
      "feed download url",
      "manual_download_url",
      "manual download url",
    );
    const feedUrl = rawFeedUrl ? normalizeFeedUrl(rawFeedUrl) : undefined;
    if (!feedUrl || seen.has(feedUrl)) return [];
    seen.add(feedUrl);
    return [{
      advertiserId,
      advertiserName,
      membershipStatus: membershipStatus ?? "not stated",
      feedId: field(row, "feed_id", "feed id") ?? null,
      feedName: field(row, "datafeed_name", "datafeed name", "feed_name", "feed name") ?? null,
      language: language ?? null,
      lastUpdated: field(row, "last_update", "last update", "last_updated", "last updated") ?? null,
      productCount: Number(field(row, "products", "product_count", "product count")?.replace(/[^\d]/g, "")) || null,
      feedUrl,
    }];
  });
  if (entries.length > MAX_AUTO_FEEDS) throw new Error(`Awin feed list contains more than ${MAX_AUTO_FEEDS} eligible feeds`);
  return entries;
}

export function normalizeFeedUrl(raw) {
  try {
    const url = new URL(raw);
    if (url.username || url.password || url.port || url.hash) return undefined;
    if (url.hostname === "productdata.awin.com" && url.protocol === "https:") return url.toString();
    if (url.hostname === "datafeed.api.productserve.com" && ["http:", "https:"].includes(url.protocol)) {
      url.protocol = "https:";
      return url.toString();
    }
    if (url.hostname === "ui.awin.com" && url.protocol === "https:" && !url.search && DARWIN_FEED_PATH.test(url.pathname)) {
      return url.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function feedTimestamp(raw) {
  if (!raw) return 0;
  const german = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\D|$)/);
  if (german) return Date.UTC(Number(german[3]), Number(german[2]) - 1, Number(german[1]));
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function selectPreferredFeed(entries) {
  return [...entries].sort((left, right) =>
    feedTimestamp(right.lastUpdated) - feedTimestamp(left.lastUpdated)
    || (right.productCount ?? 0) - (left.productCount ?? 0)
    || Number(right.feedId ?? 0) - Number(left.feedId ?? 0)
    || left.feedUrl.localeCompare(right.feedUrl)
  )[0];
}

export function discoverTargets(entries) {
  return TARGETS.map((target) => {
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

export function resolveTargetFeeds(entries) {
  return TARGETS.map((target) => {
    const matches = entries.filter((entry) => target.matches(entry.advertiserName));
    const advertiserIds = [...new Set(matches.map((entry) => entry.advertiserId))];
    if (advertiserIds.length !== 1) {
      throw new Error(`${target.label} feed discovery is ${advertiserIds.length === 0 ? "missing" : "ambiguous"}`);
    }
    const advertiserFeeds = matches.filter((entry) => entry.advertiserId === advertiserIds[0]);
    const preferredFeeds = target.preferredFeed ? advertiserFeeds.filter(target.preferredFeed) : advertiserFeeds;
    const preferred = selectPreferredFeed(preferredFeeds.length > 0 ? preferredFeeds : advertiserFeeds);
    if (!preferred) throw new Error(`${target.label} has no eligible German product feed`);
    return { ...target, advertiserId: advertiserIds[0], entry: preferred };
  });
}
