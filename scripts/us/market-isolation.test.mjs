import assert from "node:assert/strict";
import test from "node:test";

import { formatMarketMoney, getEnabledMarkets, marketPath, markets } from "../../lib/markets.ts";
import {
  getUsPublicConfigurations,
  getUsPublicOffers,
  getUsPublicProducts,
  getUsResearchProducts,
  getUsResearchStats,
} from "../../lib/us/catalog.ts";

test("market configuration keeps DE and US locale semantics separate", () => {
  assert.equal(markets.DE.locale, "de-DE");
  assert.equal(markets.DE.currency, "EUR");
  assert.equal(markets.DE.measurementSystem, "metric");
  assert.equal(markets.US.locale, "en-US");
  assert.equal(markets.US.currency, "USD");
  assert.equal(markets.US.measurementSystem, "imperial");
  assert.deepEqual(markets.US.displayVoltageChoices, [120, 240]);
});

test("market paths are explicit and stable", () => {
  assert.equal(marketPath("DE"), "/de/");
  assert.equal(marketPath("US"), "/us/");
  assert.equal(marketPath("US", "saunas/peak-shasta"), "/us/saunas/peak-shasta/");
});

test("currency output follows the selected market", () => {
  assert.equal(formatMarketMoney("DE", 123456), "1.234,56 €");
  assert.equal(formatMarketMoney("US", 123456), "$1,234.56");
});

test("the public US release exposes the reviewed first wave and approved offers", () => {
  assert.deepEqual(getEnabledMarkets().map((market) => market.code), ["DE", "US"]);
  assert.equal(getUsResearchProducts().length, 290);
  assert.equal(getUsPublicProducts().length, 28);
  assert.equal(getUsPublicConfigurations().length, 28);
  assert.equal(getUsPublicOffers().length, 17);
  assert.deepEqual(getUsResearchStats(), { products: 290, configurations: 290, offers: 17, publicProducts: 28 });
});
