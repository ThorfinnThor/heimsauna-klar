import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "../..");
const [productsDocument, configurationsDocument, sourcesDocument, productEditorialDocument] = await Promise.all([
  readFile(resolve(projectRoot, "data/us/products.json"), "utf8").then(JSON.parse),
  readFile(resolve(projectRoot, "data/us/configurations.json"), "utf8").then(JSON.parse),
  readFile(resolve(projectRoot, "data/us/sources.json"), "utf8").then(JSON.parse),
  readFile(resolve(projectRoot, "content/us/product-editorial.json"), "utf8").then(JSON.parse),
]);

const reviewedIds = [
  "redwood-extra-wide-porch-6",
  "redwood-barrel-8",
  "redwood-noctra-8",
  "saunalife-e8",
  "saunalife-e8w",
  "saunalife-e8g",
  "saunalife-e6w",
  "saunalife-e7w",
  "saunalife-e7g",
  "saunalife-cl4g",
  "saunalife-cl5g",
  "saunalife-cl12gcp",
  "saunalife-ee6g",
  "saunalife-ee8g",
  "saunalife-gl4",
  "saunalife-gl6",
  "peak-mini",
  "peak-fuji",
  "peak-patagonia",
  "almost-heaven-pinnacle",
  "almost-heaven-princeton",
  "almost-heaven-audra",
  "saunalife-cl7g",
  "peak-shasta",
  "peak-everest",
  "jnh-tosi-1",
  "jnh-tosi-2",
  "jnh-tosi-4",
  "jnh-arki-outdoor-duo",
  "saunalife-x2",
  "saunalife-g2",
  "saunalife-g3",
  "saunalife-g6",
  "saunalife-g11",
  "saunalife-cl3g",
  "saunalife-e6",
  "saunalife-e7",
  "peak-crown",
  "peak-rainier",
  "peak-matterhorn",
  "peak-kilimanjaro",
  "peak-el-capitan",
  "almost-heaven-hillsboro",
  "almost-heaven-logan",
  "almost-heaven-rainelle",
  "almost-heaven-bridgeport",
  "almost-heaven-grandview",
  "almost-heaven-titan",
  "almost-heaven-patterson",
  "almost-heaven-lewisburg",
  "almost-heaven-grayson",
  "almost-heaven-charleston",
  "almost-heaven-huntington",
  "almost-heaven-madison",
  "sunlighten-mpulse-aspire",
  "sunlighten-mpulse-believe",
  "sunlighten-mpulse-conquer",
  "sunlighten-mpulse-discover",
  "sunlighten-mpulse-empower",
  "sunlighten-amplify-ii",
  "sunlighten-amplify-iii",
  "sunlighten-amplify-iv",
  "sunlighten-signature-i",
  "sun-home-solstice",
  "sun-home-equinox",
  "sun-home-eclipse-2",
  "sun-home-pod",
  "sun-home-luminar-2",
  "sun-home-nova-3",
  "sun-home-solaris",
  "redwood-cabin-4",
  "redwood-cove-3",
  "redwood-garden-8",
  "redwood-grove-8",
  "redwood-vista-6",
  "redwood-horizon-6",
  "redwood-duo-2",
  "redwood-summit-6",
  "redwood-barrel-6",
  "redwood-barrel-porch-6",
  "redwood-extra-wide-6",
  "thermory-luik-kodiak",
  "thermory-luik-ash",
  "thermory-traditional-mod6",
  "thermory-modern-mod6",
  "thermory-mod4-traditional",
  "thermory-mod4-modern",
  "thermory-sauna-square",
  "thermory-natural-barrel",
  "thermory-ignite-barrel",
  "redwood-electric-heater",
  "redwood-heater-fence",
  "redwood-lighting",
  "redwood-bench-extender",
  "redwood-roof-shingles",
  "redwood-privacy-screen",
  "redwood-outdoor-shower",
  "sunlighten-solo-system",
  "sunlighten-solo-rise",
  "sunlighten-luminir-panel",
];

const products = new Map(productsDocument.products.map((product) => [product.id, product]));
const configurations = new Map(configurationsDocument.configurations.map((configuration) => [configuration.id, configuration]));
const sources = new Map(sourcesDocument.sources.map((source) => [source.id, source]));
const evidence = new Map(sourcesDocument.evidence.map((entry) => [entry.id, entry]));
const productEditorial = new Map(productEditorialDocument.entries.map((entry) => [entry.product_id, entry]));

test("the latest Luna enrichment cites each reviewed model page", () => {
  for (const id of reviewedIds) {
    const product = products.get(id);
    const configuration = configurations.get(`${id}-standard`);
    const productEvidence = evidence.get(`evidence-${id}-product`);
    const configurationEvidence = evidence.get(`evidence-${id}-configuration`);
    assert(product, `missing product ${id}`);
    assert(configuration, `missing configuration ${id}-standard`);
    assert.equal(productEvidence?.source_id, `${id}-product`);
    assert.equal(configurationEvidence?.source_id, `${id}-product`);
    assert.match(productEvidence?.field_path ?? "", /^manufacturer-product-page/);
    assert.match(configurationEvidence?.field_path ?? "", /^manufacturer-product-page/);
    assert.doesNotMatch(JSON.stringify({ product, configuration }), /collection page|require the individual product page/i);
  }
});

test("Redwood heater amperage is not presented as a documented circuit rating", () => {
  for (const product of products.values()) {
    if (product.brand_name !== "Redwood Outdoors") continue;
    for (const configurationId of product.configuration_ids) {
      const configuration = configurations.get(configurationId);
      assert(configuration, `missing configuration ${configurationId}`);
      for (const option of configuration.electrical_supply_options ?? []) {
        for (const requirement of option.requirements ?? []) {
          if (requirement.rated_current_a.status !== "documented") continue;
          assert.equal(requirement.required_circuit_a.status, "unknown", `${configurationId} infers a circuit rating from heater amperage`);
          assert.match(requirement.required_circuit_a.reason, /does not state a required circuit rating/i);
        }
      }
    }
  }
});

test("Horizon and Summit keep the current model-page evidence behind their release facts", () => {
  const expected = {
    "redwood-horizon-6": {
      exterior: { width: 72.75, depth: 92.5, height: 76.5 },
      listedWeight: 1150,
    },
    "redwood-summit-6": {
      exterior: { width: 82, depth: 69.5, height: 82.75 },
      listedWeight: 1100,
    },
  };

  for (const [productId, facts] of Object.entries(expected)) {
    const product = products.get(productId);
    const configuration = configurations.get(`${productId}-standard`);
    const requirement = configuration?.electrical_supply_options?.[0]?.requirements?.[0];
    const source = sources.get(`${productId}-product`);
    const rawEvidence = evidence.get(`evidence-${productId}-configuration`)?.raw_value ?? "";
    assert(product, `missing product ${productId}`);
    assert(configuration, `missing configuration ${productId}-standard`);
    assert.equal(product.spec_checked_at, "2026-09-22");
    assert.equal(source?.checked_at, "2026-09-22");
    assert.match(source?.locator ?? "", /Exact manufacturer product page/);
    assert.equal(configuration.dimensions.exterior.value.width.value, facts.exterior.width);
    assert.equal(configuration.dimensions.exterior.value.depth.value, facts.exterior.depth);
    assert.equal(configuration.dimensions.exterior.value.height.value, facts.exterior.height);
    assert.equal(configuration.net_weight.status, "unknown");
    assert.match(configuration.net_weight.reason, /listed weight.*not identify.*net weight/i);
    assert.equal(requirement?.voltage_v.value, 240);
    assert.equal(requirement?.rated_power_w.value, 6000);
    assert.equal(requirement?.rated_current_a.value, 30);
    assert.equal(requirement?.required_circuit_a.status, "unknown");
    assert.match(rawEvidence, /Canadian Thermowood/);
    assert.match(rawEvidence, /heat-treated hemlock/);
    assert.match(rawEvidence, new RegExp(`listed weight ${facts.listedWeight.toLocaleString("en-US")} lb`));
    assert.match(rawEvidence, /6 kW Harvia KIP option at 240 V and 30 A/);
    assert.match(rawEvidence, /does not identify 30 A as a required circuit or breaker rating/);
  }
});

test("the JNH Tosi one- and two-person supply requirements cite the model pages", () => {
  for (const productId of ["jnh-tosi-1", "jnh-tosi-2"]) {
    const configuration = configurations.get(`${productId}-standard`);
    const requirement = configuration?.electrical_supply_options?.[0]?.requirements?.[0];
    assert(configuration, `missing configuration ${productId}-standard`);
    assert.equal(requirement?.voltage_v.value, 120);
    assert.equal(requirement?.required_circuit_a.value, 15);
    assert.deepEqual(requirement?.required_circuit_a.evidence_ids, [`evidence-${productId}-configuration`]);
    assert.equal(requirement?.dedicated_circuit.status, "unknown");
    assert.match(evidence.get(`evidence-${productId}-configuration`)?.raw_value ?? "", /standard 110 V \/ 15 A outlet is sufficient/i);
    assert.match(JSON.stringify(productEditorial.get(productId)), /15-amp supply|documented supply is 15 amps/i);
    assert.doesNotMatch(JSON.stringify(productEditorial.get(productId)), /required circuit (?:field|value|rating) (?:is )?not/i);
  }
});

test("the Sol-reviewed Harvia heater records preserve source limits", () => {
  const heaterIds = [
    "harvia-concept-r-105",
    "harvia-virta-wall-hlw90e",
    "harvia-legend-po70fc",
    "harvia-concept-r-combi-105",
  ];
  for (const id of heaterIds) {
    const product = products.get(id);
    const configuration = configurations.get(`${id}-standard`);
    const requirement = configuration?.electrical_supply_options?.[0]?.requirements?.[0];
    assert(product, `missing product ${id}`);
    assert(configuration, `missing configuration ${id}-standard`);
    assert.equal(product.publication_status, "candidate");
    assert.equal(product.product_type.value, "heater");
    assert.equal(configuration.capacity.seated.status, "not-applicable");
    assert.equal(configuration.dimensions.interior.status, "not-applicable");
    assert.equal(requirement?.frequency_hz.status, "unknown");
  }

  assert.equal(products.get("harvia-concept-r-combi-105")?.heat_type.value, "traditional");
  assert.equal(products.get("harvia-concept-r-105")?.placements.status, "unknown");
  assert.equal(products.get("harvia-concept-r-combi-105")?.placements.status, "unknown");
  assert.equal(configurations.get("harvia-concept-r-105-standard")?.materials.status, "unknown");
  assert.deepEqual(configurations.get("harvia-concept-r-combi-105-standard")?.materials.value, ["Ceramic bowl"]);
});

test("the Sol-reviewed Finnmark batch preserves manufacturer facts and source limits", () => {
  const expectations = {
    "finnmark-fd-2": { heat: "infrared", capacity: 2, exterior: [48, 44, 78] },
    "finnmark-fd-4": { heat: "hybrid", capacity: 2, exterior: [48, 48, 83] },
    "finnmark-fd-6": { heat: "hybrid", capacity: 6, exterior: [75, 79, 75] },
    "finnmark-fd-7": { heat: "hybrid", capacity: 6, exterior: [75, 79, 75] },
  };
  for (const [id, expected] of Object.entries(expectations)) {
    const product = products.get(id);
    const configuration = configurations.get(`${id}-standard`);
    assert(product, `missing product ${id}`);
    assert(configuration, `missing configuration ${id}-standard`);
    assert.equal(product.heat_type.value, expected.heat);
    assert.equal(configuration.capacity.seated.value, expected.capacity);
    assert.deepEqual(Object.values(configuration.dimensions.exterior.value).map((measurement) => measurement.value), expected.exterior);
    assert.equal(configuration.dimensions.minimum_clearances.status, "unknown");
    assert.equal(configuration.publication_status, "candidate");
    assert.match(evidence.get(`evidence-${id}-verified-configuration-2026-09-22`)?.raw_value ?? "", /Capacity/);
  }

  const fd2 = configurations.get("finnmark-fd-2-standard");
  const fd2Electrical = fd2?.electrical_supply_options?.[0]?.requirements?.[0];
  assert.deepEqual(Object.values(fd2?.dimensions.interior.value).map((measurement) => measurement.value), [43, 40, 70]);
  assert.equal(fd2Electrical?.voltage_v.value, 120);
  assert.equal(fd2Electrical?.rated_power_w.value, 1750);
  assert.equal(fd2Electrical?.rated_current_a.value, 15);
  assert.equal(fd2Electrical?.plug_type.value, "NEMA 5-15P");
  assert.equal(fd2Electrical?.phase.status, "unknown");
  assert(products.get("finnmark-fd-2")?.source_ids.includes("source-finnmark-fd-2-spec-sheet"));

  const fd4 = configurations.get("finnmark-fd-4-standard");
  const fd4Heater = fd4?.electrical_supply_options?.[1]?.requirements?.[0];
  assert.deepEqual(Object.values(fd4?.dimensions.interior.value).map((measurement) => measurement.value), [44, 45, 75]);
  assert.equal(fd4Heater?.rated_current_a.value, 20);
  assert.equal(fd4Heater?.phase.status, "unknown");
  assert.equal(fd4Heater?.required_circuit_a.status, "unknown");
  assert.equal(fd4Heater?.dedicated_circuit.status, "unknown");
  assert(products.get("finnmark-fd-4")?.source_ids.includes("source-finnmark-fd-4-spec-sheet"));
});

test("the latest Luna Finnleo batch records included heaters without inventing circuit data", () => {
  const cases = [
    ["finnleo-hallmark-44-9-0601", "Piccolo Mini sauna heater", 120, "plug-in", "unknown"],
    ["finnleo-is440-infrasauna-9-0602", "Piccolo Mini traditional sauna heater", 120, "plug-in", "unknown"],
    ["finnleo-solace-9-0502", "Designer-SL2 sauna heater", 240, null, "unknown"],
    ["finnleo-twilight-9-0501", "Designer-SL2 sauna heater", null, null, "unknown"],
  ];
  for (const [id, componentName, voltage, connection, dedicated] of cases) {
    const product = products.get(id);
    const configuration = configurations.get(`${id}-standard`);
    const requirement = configuration?.electrical_supply_options?.[0]?.requirements?.[0];
    assert(product, `missing product ${id}`);
    assert(configuration, `missing configuration ${id}-standard`);
    assert(configuration.components.some((component) => component.name === componentName));
    if (voltage === null) assert.equal(requirement?.voltage_v.status, "unknown");
    else assert.equal(requirement?.voltage_v.value, voltage);
    if (connection === null) assert.equal(requirement?.connection.status, "unknown");
    else assert.equal(requirement?.connection.value, connection);
    assert.equal(requirement?.required_circuit_a.status, "unknown");
    if (dedicated === "unknown") assert.equal(requirement?.dedicated_circuit.status, "unknown");
    else assert.equal(requirement?.dedicated_circuit.value, dedicated);
    assert.match(evidence.get(`evidence-${id}-depth-electrical`)?.raw_value ?? "", /Finnleo/);
  }
  assert.equal(configurations.get("finnleo-solace-9-0502-standard")?.capacity.reclining.value, 2);
  assert.equal(configurations.get("finnleo-twilight-9-0501-standard")?.capacity.reclining.value, 3);
  assert.match(evidence.get("evidence-finnleo-solace-9-0502-depth-product")?.raw_value ?? "", /4–5 seated/);
  assert.match(evidence.get("evidence-finnleo-twilight-9-0501-depth-product")?.raw_value ?? "", /4–5 seated/);
});

test("the Sol-reviewed Finnleo release facts preserve conflicts, ranges and source semantics", () => {
  const northstar46 = configurations.get("finnleo-northstar-indoor-sauna-4-x-6-9630-2263-standard");
  const northstar56 = configurations.get("finnleo-northstar-indoor-sauna-5-x-6-9630-2264-standard");
  const northstar57 = configurations.get("finnleo-northstar-indoor-sauna-5-x-7-9630-2265-standard");
  const is565 = configurations.get("finnleo-is565-infrasauna-9805-0840-standard");

  assert.equal(northstar56?.capacity.seated.status, "conflict");
  assert.equal(northstar56?.capacity.seated.evidence_ids.length, 2);
  assert.match(evidence.get("evidence-finnleo-northstar-indoor-sauna-5-x-7-9630-2265-depth-product")?.raw_value ?? "", /4(?:-|–)5/);
  const northstar57Copy = productEditorialDocument.entries.find((entry) => entry.product_id === "finnleo-northstar-indoor-sauna-5-x-7-9630-2265");
  assert.match([northstar57Copy?.heading, northstar57Copy?.summary, ...(northstar57Copy?.paragraphs ?? [])].join(" "), /four-to-five/i);

  for (const configuration of [northstar46, northstar56, northstar57, is565]) {
    assert.equal(configuration?.manufacturer_sku.status, "unknown");
  }
  for (const configuration of [northstar46, northstar56, northstar57]) {
    const requirement = configuration?.electrical_supply_options?.[0]?.requirements?.[0];
    assert.equal(requirement?.required_circuit_a.status, "unknown");
    assert.equal(requirement?.specified_breaker_a.status, "unknown");
  }
  const is565Requirement = is565?.electrical_supply_options?.[0]?.requirements?.[0];
  assert.equal(is565Requirement?.required_circuit_a.value, 30);
  assert.equal(is565Requirement?.specified_breaker_a.value, 30);
  assert.equal(is565Requirement?.connection.value, "hardwired");
  assert.equal(is565Requirement?.dedicated_circuit.status, "unknown");
});

test("the Sol-reviewed wave keeps breaker, connection and dedicated-circuit claims separate", () => {
  const cases = [
    ["tylo-lulea-4", "unknown", "unknown", "unknown"],
    ["geyser-hekla", "unknown", "unknown", "unknown"],
    ["geyser-lukaku", "unknown", "unknown", "unknown"],
    ["geyser-valera", "unknown", "unknown", "unknown"],
    ["geyser-balerion", 30, "unknown", "unknown"],
    ["sunray-bristow", "unknown", "hardwired", true],
    ["sunray-aurora", "unknown", "hardwired", true],
    ["salus-ally", "unknown", "hardwired", "unknown"],
  ];
  for (const [productId, breaker, connection, dedicated] of cases) {
    const requirement = configurations.get(`${productId}-standard`)?.electrical_supply_options?.[0]?.requirements?.[0];
    if (breaker === "unknown") assert.equal(requirement?.specified_breaker_a.status, "unknown", `${productId} breaker`);
    else assert.equal(requirement?.specified_breaker_a.value, breaker, `${productId} breaker`);
    if (connection === "unknown") assert.equal(requirement?.connection.status, "unknown", `${productId} connection`);
    else assert.equal(requirement?.connection.value, connection, `${productId} connection`);
    if (dedicated === "unknown") assert.equal(requirement?.dedicated_circuit.status, "unknown", `${productId} dedicated circuit`);
    else assert.equal(requirement?.dedicated_circuit.value, dedicated, `${productId} dedicated circuit`);
  }

  const luleaComponents = configurations.get("tylo-lulea-4-standard")?.components ?? [];
  assert(luleaComponents.some((component) => component.name === "Chromotherapy lighting" && component.inclusion === "included"));
  assert(luleaComponents.some((component) => component.name === "Optional Bluetooth sound bar" && component.inclusion === "excluded"));
});
