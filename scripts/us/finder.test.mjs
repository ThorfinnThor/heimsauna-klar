import assert from "node:assert/strict";
import test from "node:test";

import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import { runUsFinder } from "../../lib/us/finder.ts";
import { buildUsFinderQuery, normalizeUsFinderUrlState, serializeUsFinderUrlState } from "../../lib/us/finder-query.ts";

const documented = (value) => ({ status: "documented", value, evidence_ids: ["fixture-evidence"] });
const unknown = (reason = "Fixture leaves this fact unknown") => ({ status: "unknown", reason });

function product(overrides = {}) {
  return {
    id: "fixture-sauna",
    market: "US",
    slug: "fixture-sauna",
    brand_name: "Fixture",
    model: "Sauna",
    product_type: documented("sauna-cabin"),
    heat_type: documented("traditional"),
    energy_sources: documented(["electric"]),
    placements: documented(["indoor"]),
    form: documented("cabin"),
    configuration_ids: ["fixture-configuration"],
    source_ids: ["fixture-source"],
    publication_status: "published",
    change_reason: "Synthetic unit-test fixture",
    ...overrides,
  };
}

function requirement(voltageV, overrides = {}) {
  return {
    component: "heater",
    voltage_v: documented(voltageV),
    frequency_hz: unknown(),
    phase: unknown(),
    rated_power_w: unknown(),
    rated_current_a: unknown(),
    required_circuit_a: unknown(),
    specified_breaker_a: unknown(),
    connection: unknown(),
    plug_type: unknown(),
    dedicated_circuit: unknown(),
    ...overrides,
  };
}

function configuration(overrides = {}) {
  return {
    id: "fixture-configuration",
    market: "US",
    product_id: "fixture-sauna",
    label: "Fixture configuration",
    manufacturer_sku: unknown(),
    capacity: { seated: documented(2), reclining: unknown() },
    dimensions: {
      exterior: documented({
        width: { value: 60, unit: "in" },
        depth: { value: 48, unit: "in" },
        height: { value: 78, unit: "in" },
      }),
      interior: unknown(),
      shipping: unknown(),
      minimum_clearances: unknown(),
    },
    net_weight: unknown(),
    shipping_weight: unknown(),
    materials: unknown(),
    components: [],
    electrical_supply_options: [{ id: "fixture-120", requirements: [requirement(120)], evidence_ids: ["fixture-evidence"] }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: ["fixture-source"],
    publication_status: "published",
    ...overrides,
  };
}

function offer(overrides = {}) {
  return {
    id: "fixture-offer",
    market: "US",
    market_product_id: "fixture-sauna",
    configuration_id: "fixture-configuration",
    merchant_id: "fixture-merchant",
    destination_url: "https://example.com/fixture-sauna",
    offer_type: "fixed-price",
    price: { amount_minor: 480000, currency: "USD" },
    price_scope: "configured-sauna-package",
    included_component_ids: [],
    excluded_required_components: [],
    completeness: "documented",
    condition: "new",
    availability: "in-stock",
    tax_treatment: "calculated-by-merchant",
    delivery_region_ids: [],
    shipping_evidence_ids: [],
    last_successfully_checked_at: "2026-09-13",
    verification_method: "manual",
    promotion_status: "inactive",
    ...overrides,
  };
}

function resultFor({ query, productValue = product(), configurationValue = configuration(), offers = [] }) {
  return runUsFinder({ products: [productValue], configurations: [configurationValue], offers, query, asOf: "2026-09-13" })[0];
}

test("real pilot data produces nine known indoor infrared 120 V results and nine exclusions", () => {
  const results = runUsFinder({
    products: productsDocument.products,
    configurations: configurationsDocument.configurations,
    offers: [],
    query: {
      heatType: { value: "infrared", strength: "hard" },
      placement: { value: "indoor", strength: "hard" },
      electrical: { value: { mode: "electric", supplies: [{ voltageV: 120 }] }, strength: "hard" },
    },
    asOf: "2026-09-13",
  });
  assert.equal(results.filter((entry) => entry.status === "meets-known-criteria").length, 9);
  assert.equal(results.filter((entry) => entry.status === "excluded").length, 9);
  assert.equal(results.at(-1).productId, "saunalife-g11");
});

test("the pilot scenario for two indoor infrared seats on 120 V returns five known configurations", () => {
  const results = runUsFinder({
    products: productsDocument.products,
    configurations: configurationsDocument.configurations,
    offers: [],
    query: {
      heatType: { value: "infrared", strength: "hard" },
      placement: { value: "indoor", strength: "hard" },
      seatedPeople: { value: 2, strength: "hard" },
      electrical: { value: { mode: "electric", supplies: [{ voltageV: 120 }] }, strength: "hard" },
    },
    asOf: "2026-09-13",
  });
  assert.deepEqual(
    results.filter((entry) => entry.status === "meets-known-criteria").map((entry) => entry.productId),
    ["peak-everest", "jnh-tosi-2", "jnh-tosi-4", "peak-crown", "peak-fuji"],
  );
  assert.equal(results.filter((entry) => entry.status === "needs-verification").length, 0);
  assert.deepEqual(
    results.filter((entry) => entry.status === "excluded").map((entry) => entry.productId),
    ["peak-shasta", "jnh-tosi-1", "jnh-arki-outdoor-duo", "peak-mini", "peak-patagonia", "peak-rainier", "peak-matterhorn", "peak-kilimanjaro", "peak-el-capitan", "saunalife-cl3g", "saunalife-e6", "saunalife-e7", "saunalife-g11"],
  );
});

test("adding a room envelope keeps the pilot honest when installation clearances are unknown", () => {
  const results = runUsFinder({
    products: productsDocument.products,
    configurations: configurationsDocument.configurations,
    offers: [],
    query: {
      heatType: { value: "infrared", strength: "hard" },
      placement: { value: "indoor", strength: "hard" },
      seatedPeople: { value: 2, strength: "hard" },
      maximumExteriorInches: { value: { width: 100, depth: 100, height: 100, allowRotation: false }, strength: "hard" },
      electrical: { value: { mode: "electric", supplies: [{ voltageV: 120 }] }, strength: "hard" },
    },
    asOf: "2026-09-13",
  });
  assert.equal(results.filter((entry) => entry.status === "needs-verification").length, 5);
  assert(results.filter((entry) => entry.status === "needs-verification").every((entry) => entry.unknownCriteria.includes("space:installation-clearances")));
});

test("hard capacity uses the full requested group size", () => {
  assert.equal(resultFor({ query: { seatedPeople: { value: 4, strength: "hard" } } }).status, "excluded");
  assert.equal(resultFor({ query: { seatedPeople: { value: 2, strength: "hard" } } }).status, "meets-known-criteria");
});

test("a fitting cabinet with unknown clearances still needs verification", () => {
  const result = resultFor({ query: { maximumExteriorInches: { value: { width: 65, depth: 55, height: 84, allowRotation: false }, strength: "hard" } } });
  assert.equal(result.status, "needs-verification");
  assert(result.matchedCriteria.includes("space:cabinet-fits"));
  assert(result.unknownCriteria.includes("space:installation-clearances"));
});

test("documented clearances are included in the hard room envelope", () => {
  const configurationValue = configuration({
    dimensions: {
      ...configuration().dimensions,
      minimum_clearances: documented({ left: { value: 2, unit: "in" }, right: { value: 2, unit: "in" }, top: { value: 4, unit: "in" } }),
    },
  });
  const excluded = resultFor({ query: { maximumExteriorInches: { value: { width: 62, depth: 50, height: 80, allowRotation: false }, strength: "hard" } }, configurationValue });
  const matched = resultFor({ query: { maximumExteriorInches: { value: { width: 64, depth: 50, height: 82, allowRotation: false }, strength: "hard" } }, configurationValue });
  assert.equal(excluded.status, "excluded");
  assert.equal(matched.status, "meets-known-criteria");
});

test("metric dimensions are converted before boundary comparison without display rounding", () => {
  const metricConfiguration = configuration({
    dimensions: {
      ...configuration().dimensions,
      exterior: documented({
        width: { value: 152.4, unit: "cm" },
        depth: { value: 1219.2, unit: "mm" },
        height: { value: 6.5, unit: "ft" },
      }),
      minimum_clearances: documented({}),
    },
  });
  const exact = resultFor({
    query: { maximumExteriorInches: { value: { width: 60, depth: 48, height: 78, allowRotation: false }, strength: "hard" } },
    configurationValue: metricConfiguration,
  });
  const fractionallyTooSmall = resultFor({
    query: { maximumExteriorInches: { value: { width: 59.999, depth: 48, height: 78, allowRotation: false }, strength: "hard" } },
    configurationValue: metricConfiguration,
  });
  assert.equal(exact.status, "meets-known-criteria");
  assert.equal(fractionallyTooSmall.status, "excluded");
});

test("rotation is applied only when explicitly enabled", () => {
  const strict = { width: 50, depth: 62, height: 80, allowRotation: false };
  assert.equal(resultFor({ query: { maximumExteriorInches: { value: strict, strength: "hard" } } }).status, "excluded");
  assert.equal(resultFor({ query: { maximumExteriorInches: { value: { ...strict, allowRotation: true }, strength: "hard" } } }).status, "needs-verification");
});

test("voltage alone can match while unrequested circuit facts remain unknown", () => {
  const result = resultFor({ query: { electrical: { value: { mode: "electric", supplies: [{ voltageV: 120 }] }, strength: "hard" } } });
  assert.equal(result.status, "meets-known-criteria");
  assert.equal(result.selectedSupplyOptionId, "fixture-120");
});

test("a requested circuit limit makes an unknown required circuit a verification item", () => {
  const result = resultFor({ query: { electrical: { value: { mode: "electric", supplies: [{ voltageV: 120, maxRequiredCircuitA: 20 }] }, strength: "hard" } } });
  assert.equal(result.status, "needs-verification");
  assert(result.unknownCriteria.includes("electrical:supply-option"));
});

test("alternative supply options use OR logic", () => {
  const configurationValue = configuration({ electrical_supply_options: [
    { id: "option-120", requirements: [requirement(120)], evidence_ids: [] },
    { id: "option-240", requirements: [requirement(240)], evidence_ids: [] },
  ] });
  const result = resultFor({ query: { electrical: { value: { mode: "electric", supplies: [{ voltageV: 240 }] }, strength: "hard" } }, configurationValue });
  assert.equal(result.status, "meets-known-criteria");
  assert.equal(result.selectedSupplyOptionId, "option-240");
});

test("requirements inside one supply option use AND logic", () => {
  const configurationValue = configuration({ electrical_supply_options: [
    { id: "hybrid-option", requirements: [requirement(120), requirement(240)], evidence_ids: [] },
  ] });
  const only120 = resultFor({ query: { electrical: { value: { mode: "electric", supplies: [{ voltageV: 120 }] }, strength: "hard" } }, configurationValue });
  const both = resultFor({ query: { electrical: { value: { mode: "electric", supplies: [{ voltageV: 120 }, { voltageV: 240 }] }, strength: "hard" } }, configurationValue });
  assert.equal(only120.status, "excluded");
  assert.equal(both.status, "meets-known-criteria");
});

test("wood-fired interest excludes an electric-only product", () => {
  const result = resultFor({ query: { electrical: { value: { mode: "wood-fired" }, strength: "hard" } } });
  assert.equal(result.status, "excluded");
  assert(result.exclusionReasons.includes("electrical:wood-fired"));
});

test("a complete current package can meet a hard package budget", () => {
  const result = resultFor({ query: { budget: { value: { maxAmountMinor: 500000, requiredPriceScope: "configured-sauna-package" }, strength: "hard" } }, offers: [offer()] });
  assert.equal(result.status, "meets-known-criteria");
  assert.equal(result.offerId, "fixture-offer");
  assert.equal(result.comparablePriceAmountMinor, 480000);
});

test("a cheaper kit cannot confirm a complete-package budget", () => {
  const result = resultFor({ query: { budget: { value: { maxAmountMinor: 500000, requiredPriceScope: "configured-sauna-package" }, strength: "hard" } }, offers: [offer({ price_scope: "sauna-kit", price: { amount_minor: 300000, currency: "USD" } })] });
  assert.equal(result.status, "needs-verification");
  assert.equal(result.offerId, undefined);
});

test("stale, quote-only, incomplete and unavailable prices never become confirmed budget matches", () => {
  const query = { budget: { value: { maxAmountMinor: 500000, requiredPriceScope: "configured-sauna-package" }, strength: "hard" } };
  for (const candidate of [
    offer({ last_successfully_checked_at: "2026-08-01" }),
    offer({ offer_type: "quote-only", price: undefined }),
    offer({ completeness: "incomplete", excluded_required_components: ["fixture-heater"] }),
    offer({ availability: "unknown" }),
    offer({ availability: "out-of-stock" }),
  ]) {
    assert.equal(resultFor({ query, offers: [candidate] }).status, "needs-verification");
  }
});

test("a documented price above a hard limit excludes the configuration", () => {
  const result = resultFor({ query: { budget: { value: { maxAmountMinor: 450000, requiredPriceScope: "configured-sauna-package" }, strength: "hard" } }, offers: [offer()] });
  assert.equal(result.status, "excluded");
});

test("soft preferences affect ranking without excluding a configuration", () => {
  const secondProduct = product({ id: "fixture-outdoor", slug: "fixture-outdoor", placements: documented(["outdoor"]), configuration_ids: ["fixture-outdoor-configuration"] });
  const secondConfiguration = configuration({ id: "fixture-outdoor-configuration", product_id: "fixture-outdoor" });
  const results = runUsFinder({
    products: [secondProduct, product()],
    configurations: [secondConfiguration, configuration()],
    offers: [],
    query: { placement: { value: "indoor", strength: "preference" } },
    asOf: "2026-09-13",
  });
  assert(results.every((entry) => entry.status === "meets-known-criteria"));
  assert.equal(results[0].productId, "fixture-sauna");
  assert(results[1].unmetPreferences.includes("placement:indoor"));
});

test("unsupported product records never enter the finder as confirmed matches", () => {
  const result = resultFor({ query: {}, productValue: product({ product_type: documented("heater") }) });
  assert.equal(result.status, "excluded");
  assert(result.exclusionReasons.includes("product-type:finder-supported"));
});

test("finder URL state accepts only bounded known values", () => {
  const state = normalizeUsFinderUrlState(new URLSearchParams("run=1&type=heater&people=1.5&width=999&depth=40&height=70&rotate=1&power=480&budget=-1&unexpected=secret"));
  assert.equal(state.submitted, true);
  assert.equal(state.productType, "any");
  assert.equal(state.seatedPeople, null);
  assert.equal(state.widthInches, null);
  assert.equal(state.depthInches, null);
  assert.equal(state.heightInches, null);
  assert.equal(state.allowRotation, false);
  assert.equal(state.power, "any");
  assert.equal(state.budgetDollars, null);
  assert.equal(serializeUsFinderUrlState(state).toString(), "run=1");
});

test("finder URL state round-trips a complete constrained search", () => {
  const initial = normalizeUsFinderUrlState(new URLSearchParams("run=1&type=sauna-cabin&heat=infrared&placement=indoor&people=2&width=60&depth=48&height=84&rotate=1&power=120-240&circuit=20&connection=plug-in&budget=5000&scope=configured-sauna-package&budgetMode=preference"));
  const serialized = serializeUsFinderUrlState(initial);
  const restored = normalizeUsFinderUrlState(serialized);
  assert.deepEqual(restored, initial);

  const query = buildUsFinderQuery(restored);
  assert.equal(query.budget.strength, "preference");
  assert.deepEqual(query.electrical.value, {
    mode: "electric",
    supplies: [
      { voltageV: 120, maxRequiredCircuitA: 20, connection: "plug-in" },
      { voltageV: 240, maxRequiredCircuitA: 20, connection: "plug-in" },
    ],
  });
  assert.equal(query.maximumExteriorInches.value.allowRotation, true);
});

test("partial room dimensions never create a hidden space criterion", () => {
  const state = normalizeUsFinderUrlState(new URLSearchParams("run=1&width=60&depth=48&rotate=1"));
  const query = buildUsFinderQuery(state);
  assert.equal(query.maximumExteriorInches, undefined);
  assert.equal(state.allowRotation, false);
});
