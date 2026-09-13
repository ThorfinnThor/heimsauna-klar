import assert from "node:assert/strict";
import test from "node:test";

import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import { runUsFinder } from "../../lib/us/finder.ts";

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

test("real pilot data produces five known indoor infrared 120 V results and one exclusion", () => {
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
  assert.equal(results.filter((entry) => entry.status === "meets-known-criteria").length, 5);
  assert.equal(results.filter((entry) => entry.status === "excluded").length, 1);
  assert.equal(results.at(-1).productId, "jnh-arki-outdoor-duo");
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
