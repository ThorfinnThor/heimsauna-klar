import assert from "node:assert/strict";
import test from "node:test";
import { applyMatches, matchExactOffers, normalizeAffiliateUrl, normalizeMerchantUrl } from "./matcher.mjs";
import { assertFeedListUrl, normalizeFeedUrl, parseEligibleFeeds, resolveTargetFeeds } from "./feed-list.mjs";
import { auditFeedRows } from "./relevance.mjs";
import { parseCsv } from "./source.mjs";

test("feed-list discovery keeps approved German Awin feeds", () => {
  const rows = parseCsv([
    "Advertiser ID,Advertiser Name,Membership Status,Feed ID,Language,Last Update,Products,URL",
    "100,Artsauna DE,Joined,10,German,27/08/2026,15,https://productdata.awin.com/datafeed/download/apikey/x/fid/10/",
    "200,Home Deluxe DE,active,20,de_DE,2026-08-27,34,https://ui.awin.com/productdata-darwin-download/publisher/3037577/token_123/1/feed/F20.csv.gz",
    "300,Unrelated,Not Joined,30,German,2026-08-27,5,https://productdata.awin.com/datafeed/download/apikey/x/fid/30/",
  ].join("\n"));
  const targets = resolveTargetFeeds(parseEligibleFeeds(rows));
  assert.deepEqual(targets.map((target) => [target.merchantId, target.advertiserId]), [["artsauna", "100"], ["home-deluxe", "200"]]);
});

test("feed endpoints reject arbitrary hosts and unsafe variants", () => {
  assert.equal(normalizeFeedUrl("https://example.com/feed.csv"), undefined);
  assert.equal(normalizeFeedUrl("http://productdata.awin.com/feed.csv"), undefined);
  assert.equal(normalizeFeedUrl("http://datafeed.api.productserve.com/datafeed/download/apikey/x/fid/1/"), "https://datafeed.api.productserve.com/datafeed/download/apikey/x/fid/1/");
  assert.throws(() => assertFeedListUrl("https://example.com/feedList"));
});

test("feed relevance audit counts signal rows without activating products", () => {
  const audit = auditFeedRows([
    { title: "Gartensauna Fjord", description: "Saunahaus aus Holz" },
    { title: "Infrarotkabine", category: "Wellness" },
    { title: "Gartenliege" },
  ]);
  assert.equal(audit.rowsScanned, 3);
  assert.equal(audit.signalRows, 2);
  assert.equal(audit.counts.sauna, 1);
  assert.equal(audit.counts.infrared, 1);
  assert.deepEqual(audit.sampleProductNames, ["Gartensauna Fjord", "Infrarotkabine"]);
});

test("affiliate activation requires an exact canonical merchant URL", () => {
  const products = [{
    product_id: "artsauna-kiruna-120",
    commercial: { offers: [{ merchant: "Artsauna", url: "https://artsauna.de/products/infrarotkabine-kiruna-120", affiliate: false }] },
  }];
  const target = { merchantName: "Artsauna", merchantId: "artsauna", programId: "awin-artsauna", advertiserId: "100" };
  const exact = matchExactOffers(products, target, [{
    merchant_deep_link: "https://www.artsauna.de/products/infrarotkabine-kiruna-120/?variant=1",
    aw_deep_link: "https://www.awin1.com/cread.php?awinmid=100&awinaffid=3037577",
  }]);
  assert.equal(exact.matches.length, 1);
  assert.equal(applyMatches(products, exact.matches)[0].commercial.offers[0].affiliate, true);

  const fuzzy = matchExactOffers(products, target, [{
    merchant_deep_link: "https://artsauna.de/products/infrarotkabine-kiruna-120-neu",
    aw_deep_link: "https://www.awin1.com/cread.php?awinmid=100&awinaffid=3037577",
  }]);
  assert.equal(fuzzy.matches.length, 0);
});

test("tracking links are restricted to Awin HTTPS hosts", () => {
  assert.ok(normalizeAffiliateUrl("https://www.awin1.com/cread.php?awinmid=100&awinaffid=3037577", "100"));
  assert.equal(normalizeAffiliateUrl("https://www.awin1.com/cread.php?awinmid=999&awinaffid=3037577", "100"), undefined);
  assert.equal(normalizeAffiliateUrl("https://www.awin1.com/cread.php?awinmid=100", "100"), undefined);
  assert.equal(normalizeAffiliateUrl("http://www.awin1.com/cread.php?awinmid=100&awinaffid=3037577", "100"), undefined);
  assert.equal(normalizeAffiliateUrl("https://example.com/cread.php?awinmid=100&awinaffid=3037577", "100"), undefined);
  assert.equal(normalizeMerchantUrl("https://www.homedeluxe.de/example/?x=1#y"), "https://homedeluxe.de/example");
});
