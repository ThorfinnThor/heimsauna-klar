// The copy of the data-driven US guides states facts about the published
// catalog and the EIA price table. These tests fail when the data changes in a
// way that makes a sentence wrong, so the copy is reviewed with the data.
import assert from "node:assert/strict";
import test from "node:test";

import editorialDocument from "../../content/us/editorial.json" with { type: "json" };
import { selectUsComparisonConfigurations } from "../../lib/us/content.ts";
import { costPerHourUsd, median, ratedPowerW, statePricesSorted, usElectricityPrices } from "../../lib/us/running-cost.ts";

const page = (id) => editorialDocument.entries.find((entry) => entry.id === id);
const select = (selection) => selectUsComparisonConfigurations({ ...page("two-person-home-saunas"), selection });
const value = (fact) => (fact?.status === "documented" ? fact.value : null);
const heat = (item) => value(item.product.heat_type);
const requirements = (item) => item.configuration.electrical_supply_options.flatMap((option) => option.requirements);
const byModel = (items, model) => items.find((item) => item.product.model === model);
const all = select({ heat_types: ["infrared", "traditional", "hybrid"] });
const watts = (items, type) => items.filter((item) => heat(item) === type).map((item) => ratedPowerW(item.configuration)).filter((w) => w !== null);

test("120-volt page: every 120-volt configuration is infrared, 1.2 to 2.8 kW, circuits 15 to 30 A", () => {
  const items = select({ voltages_v: [120] });
  assert(items.length > 0);
  assert(items.every((item) => heat(item) === "infrared"));
  const power = items.map((item) => ratedPowerW(item.configuration));
  assert.equal(Math.min(...power), 1200);
  assert.equal(Math.max(...power), 2820);
  const eclipse = requirements(byModel(items, "Eclipse 2"))[0];
  assert.equal(value(eclipse.rated_current_a), 23.5);
  assert.equal(value(eclipse.required_circuit_a), 30);
  assert.equal(value(requirements(byModel(items, "Mini"))[0].rated_current_a), 10);
  for (const model of ["Tosi 1-Person", "Tosi 2-Person", "Rainier", "Shasta"]) assert.equal(value(requirements(byModel(items, model))[0].required_circuit_a), 15, model);
  for (const model of ["Everest", "Fuji", "Tosi Red 4-Person", "Arki Outdoor Duo", "Equinox"]) assert.equal(value(requirements(byModel(items, model))[0].required_circuit_a), 20, model);
  assert(items.filter((item) => requirements(item).some((r) => value(r.dedicated_circuit) === true)).length >= 2);
  assert.deepEqual(items.filter((item) => !value(item.product.placements).every((p) => p === "indoor")).map((item) => item.product.model), ["Arki Outdoor Duo"]);
});

test("120-volt page: the smallest traditional heater is 4 kW and the typical one 6 kW", () => {
  assert.equal(Math.min(...watts(all, "traditional")), 4000);
  assert.equal(median(watts(all, "traditional")), 6000);
});

test("2-person page: infrared 1.5 to 3.4 kW, traditional 4.5 to 8 kW, Tosi 2 is the smallest", () => {
  const items = select({ minimum_seated_capacity: 2, maximum_seated_capacity: 2 });
  assert.equal(Math.min(...watts(items, "infrared")), 1540);
  assert.equal(Math.max(...watts(items, "infrared")), 3350);
  assert.equal(Math.min(...watts(items, "traditional")), 4500);
  assert.equal(Math.max(...watts(items, "traditional")), 8000);
  const area = (item) => { const d = value(item.configuration.dimensions.exterior); return d.width.value * d.depth.value; };
  const smallest = [...items].sort((a, b) => area(a) - area(b))[0];
  assert.equal(smallest.product.model, "Tosi 2-Person");
  const seats = all.map((item) => value(item.configuration.capacity.seated));
  const counts = Object.fromEntries([...new Set(seats)].map((seat) => [seat, seats.filter((s) => s === seat).length]));
  assert.equal(Math.max(...Object.values(counts)), counts[2], "two seats is the most common size");
});

test("running cost page: prices, typical loads and the worked examples", () => {
  assert.equal(Object.keys(usElectricityPrices.states).length, 51);
  assert.equal(usElectricityPrices.us_average, 18.19);
  const states = statePricesSorted();
  assert.deepEqual(states[0], { state: "North Dakota", cents: 12.36 });
  assert.deepEqual(states.at(-1), { state: "Hawaii", cents: 46.28 });
  assert.equal(usElectricityPrices.states.California, 33.25);
  assert.equal(median(watts(all, "infrared")), 2050);
  const usd = (w, cents) => costPerHourUsd(w, cents).toFixed(2);
  assert.equal(usd(2050, 18.19), "0.37");
  assert.equal(usd(6000, 18.19), "1.09");
  assert.equal(usd(6000, 12.36), "0.74");
  assert.equal(usd(6000, 33.25), "2.00");
  assert.equal(usd(6000, 46.28), "2.78");
  assert.equal((costPerHourUsd(6000, 18.19) * 1.25).toFixed(2), "1.36");
  assert(costPerHourUsd(2050, 18.19) * (40 / 60) < 0.25);
});
