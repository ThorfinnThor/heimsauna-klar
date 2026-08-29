import assert from "node:assert/strict";
import test from "node:test";
import { applyMatches, matchExactOffers, normalizeAffiliateUrl, normalizeMerchantUrl } from "./matcher.mjs";
import { assertFeedListUrl, normalizeFeedUrl, parseEligibleFeeds, resolveTargetFeeds } from "./feed-list.mjs";
import { auditFeedRows } from "./relevance.mjs";
import { findCatalogCandidates } from "./catalog-candidates.mjs";
import { parseCsv } from "./source.mjs";

test("feed-list discovery keeps approved German Awin feeds", () => {
  const rows = parseCsv([
    "Advertiser ID,Advertiser Name,Membership Status,Feed ID,Language,Last Update,Products,URL",
    "100,Artsauna DE,Joined,10,German,27/08/2026,15,https://productdata.awin.com/datafeed/download/apikey/x/fid/10/",
    "200,Home Deluxe DE,active,20,de_DE,2026-08-27,34,https://ui.awin.com/productdata-darwin-download/publisher/3037577/token_123/1/feed/F20.csv.gz",
    "300,Benz24 DE/AT,active,30,German,2026-08-27,100,https://productdata.awin.com/datafeed/download/apikey/x/fid/30/",
    "300,Benz24 DE/AT,active,31,German,2026-08-28,110,https://productdata.awin.com/datafeed/download/apikey/x/fid/31/",
    "400,InterGard Heim und Garten DE,active,40,German,2026-08-27,4,https://productdata.awin.com/datafeed/download/apikey/x/fid/40/",
    "500,Unrelated,Not Joined,50,German,2026-08-27,5,https://productdata.awin.com/datafeed/download/apikey/x/fid/50/",
  ].join("\n"));
  rows[2]["Feed Name"] = "BENZ24 Deutschland";
  rows[3]["Feed Name"] = "BENZ24 Österreich";
  const targets = resolveTargetFeeds(parseEligibleFeeds(rows));
  assert.deepEqual(targets.map((target) => [target.merchantId, target.advertiserId]), [
    ["artsauna", "100"],
    ["home-deluxe", "200"],
    ["benz24", "300"],
    ["intergard", "400"],
  ]);
  assert.equal(targets.find((target) => target.merchantId === "benz24").entry.feedId, "30");
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
  assert.deepEqual(audit.sampleProducts, [
    { name: "Gartensauna Fjord" },
    { name: "Infrarotkabine", category: "Wellness" },
  ]);
});

test("feed relevance samples exclude Awin tracking hosts", () => {
  const audit = auditFeedRows([
    { title: "Saunaofen", link: "https://www.awin1.com/cread.php?s=secret" },
    { title: "Gartensauna", link: "https://merchant.example/sauna" },
  ]);
  assert.deepEqual(audit.sampleProducts, [
    { name: "Saunaofen" },
    { name: "Gartensauna", url: "https://merchant.example/sauna" },
  ]);
});

test("feed relevance samples read standard Awin price and category fields", () => {
  const audit = auditFeedRows([
    {
      product_name: "Saunahaus Nord",
      merchant_deep_link: "https://merchant.example/saunahaus-nord?variant=1",
      merchant_category: "Gartensaunen",
      product_price: "4999.00 EUR",
    },
  ]);
  assert.deepEqual(audit.sampleProducts, [
    {
      name: "Saunahaus Nord",
      url: "https://merchant.example/saunahaus-nord",
      category: "Gartensaunen",
      price: "4999.00 EUR",
    },
  ]);
});

test("catalog candidate audit requires matching brand, family and variant tokens", () => {
  const products = [
    {
      product_id: "karibu-skrollan-1",
      brand: "Karibu",
      model: "Saunahaus Skrollan 1 mit Vorraum",
      family: { id: "karibu-skrollan", name: "Skrollan", variant: "1 · 336 × 196 cm" },
      commercial: { offers: [] },
    },
    {
      product_id: "karibu-skrollan-2",
      brand: "Karibu",
      model: "Saunahaus Skrollan 2 mit Vorraum",
      family: { id: "karibu-skrollan", name: "Skrollan", variant: "2 · 337 × 231 cm" },
      commercial: { offers: [] },
    },
    {
      product_id: "karibu-saja-klarglas",
      brand: "Karibu",
      model: "Sauna Saja Klarglas",
      family: { id: "karibu-saja", name: "Sauna Saja", variant: "Easy Bio · Klarglas" },
      commercial: { offers: [] },
    },
  ];
  const candidates = findCatalogCandidates(products, [{
    product_name: "Karibu Saunahaus Skrollan 2 Naturbelassen günstig",
    brand: "Karibu",
    merchant_deep_link: "https://benz24.de/skrollan-2.html",
    product_price: "3479.00",
  }], { merchantName: "Benz24" });
  assert.deepEqual(candidates.map((candidate) => candidate.product_id), ["karibu-skrollan-2"]);
  assert.equal(candidates[0].activation_policy, undefined);
  assert.equal(candidates[0].already_linked, false);
  assert.equal(candidates[0].ambiguous_merchant_url, false);
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
