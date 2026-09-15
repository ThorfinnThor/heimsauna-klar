import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "../..");
const [productsDocument, configurationsDocument, sourcesDocument] = await Promise.all([
  readFile(resolve(projectRoot, "data/us/products.json"), "utf8").then(JSON.parse),
  readFile(resolve(projectRoot, "data/us/configurations.json"), "utf8").then(JSON.parse),
  readFile(resolve(projectRoot, "data/us/sources.json"), "utf8").then(JSON.parse),
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
const evidence = new Map(sourcesDocument.evidence.map((entry) => [entry.id, entry]));

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
