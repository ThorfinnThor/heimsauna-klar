import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-15";

const load = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const save = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`);
const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const dimension = (width, depth, height) => ({ width: { value: width, unit: "in" }, depth: { value: depth, unit: "in" }, height: { value: height, unit: "in" } });

const sourceDefinitions = [
  ["redwood-extra-wide-porch-6-product", "https://www.redwoodoutdoors.com/products/extra-wide-barrel-sauna-with-porch-6-person", "Redwood Outdoors Extra-Wide Outdoor Barrel Sauna with Porch 6 Person product page", "Redwood Outdoors", "Product specifications for traditional format, dimensions, weight, material and heater requirements"],
  ["redwood-barrel-8-product", "https://www.redwoodoutdoors.com/products/barrel-sauna-8-person", "Redwood Outdoors Barrel Outdoor Sauna 8 Person product page", "Redwood Outdoors", "Product specifications for traditional format, dimensions, weight, material and heater requirements"],
  ["redwood-noctra-8-product", "https://www.redwoodoutdoors.com/products/noctra-outdoor-sauna-8-person", "Redwood Outdoors Noctra Outdoor Sauna 8 Person product page", "Redwood Outdoors", "Product specifications for traditional format, dimensions, weight, material and heater requirements"],
  ["saunalife-e8-product", "https://saunalife.com/saunas/ergo-series-model-e8/", "SaunaLife Ergo-Series Model E8 product page", "SaunaLife", "Product page specifications for barrel dimensions, shipping dimensions, weight and construction"],
  ["saunalife-e8w-product", "https://saunalife.com/saunas/ergo-series-model-e8w/", "SaunaLife Ergo-Series Model E8W product page", "SaunaLife", "Product page specifications for barrel dimensions, shipping dimensions, weight and construction"],
  ["saunalife-e8g-product", "https://saunalife.com/saunas/ergo-series-model-e8g/", "SaunaLife Ergo-Series Model E8G product page", "SaunaLife", "Product page specifications for barrel dimensions, shipping dimensions, weight and construction"],
  ["saunalife-e6w-product", "https://saunalife.com/saunas/ergo-series-model-e6w/", "SaunaLife Ergo-Series Model E6W product page", "SaunaLife", "Product page specifications for barrel diameter and length, shipping dimensions, weight and construction"],
  ["saunalife-e7w-product", "https://saunalife.com/saunas/ergo-series-model-e7w/", "SaunaLife Ergo-Series Model E7W product page", "SaunaLife", "Product page specifications for barrel diameter and length, shipping dimensions, weight and construction"],
  ["saunalife-e7g-product", "https://saunalife.com/saunas/ergo-series-model-e7g/", "SaunaLife Ergo-Series Model E7G product page", "SaunaLife", "Product page specifications for barrel diameter and length, shipping dimensions, weight and construction"],
  ["saunalife-cl7g-product", "https://saunalife.com/saunas/cube-series-model-cl7g/", "SaunaLife Cube-Series Model CL7G product page", "SaunaLife", "Product page specifications for interior and exterior dimensions, shipping dimensions, weight and construction"],
  ["saunalife-cl4g-product", "https://saunalife.com/saunas/cube-series-model-cl4g/", "SaunaLife Cube-Series Model CL4G product page", "SaunaLife", "Product page specifications for interior and exterior dimensions, shipping dimensions, weight and construction"],
  ["saunalife-cl5g-product", "https://saunalife.com/saunas/cube-series-model-cl5g/", "SaunaLife Cube-Series Model CL5G product page", "SaunaLife", "Product page specifications for interior and exterior dimensions, shipping dimensions, weight and construction"],
  ["saunalife-cl12gcp-product", "https://saunalife.com/saunas/cube-series-model-cl12gcp/", "SaunaLife Cube-Series Model CL12GCP product page", "SaunaLife", "Product page specifications for sauna suite dimensions, shipping dimensions, weight and construction"],
  ["saunalife-ee6g-product", "https://saunalife.com/saunas/ergo-series-model-ee6g/", "SaunaLife Ergo Elegance-Series Model EE6G product page", "SaunaLife", "Product page specifications for barrel diameter and length, shipping data, weight and construction"],
  ["saunalife-ee8g-product", "https://saunalife.com/saunas/ergo-series-model-ee8g/", "SaunaLife Ergo Elegance-Series Model EE8G product page", "SaunaLife", "Product page specifications for barrel diameter and length, shipping data, weight and construction"],
  ["saunalife-gl4-product", "https://saunalife.com/saunas/garden-luxury-series-model-gl4/", "SaunaLife Garden Luxury-Series Model GL4 product page", "SaunaLife", "Product page specifications for interior and exterior dimensions, shipping dimensions, weight and construction"],
  ["saunalife-gl6-product", "https://saunalife.com/saunas/garden-luxury-series-model-gl6/", "SaunaLife Garden Luxury-Series Model GL6 product page", "SaunaLife", "Product page specifications for interior and exterior dimensions, shipping dimensions, weight and construction"],
  ["peak-mini-product", "https://peaksaunas.com/products/peak-saunas-mini-1-person-indoor-full-spectrum-infrared-sauna-with-medical-grade-red-light-therapy", "Peak Mini 1-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, electrical requirements and construction"],
  ["peak-fuji-product", "https://peaksaunas.com/products/peak-saunas-fuji-2-person-indoor-near-zero-emf-full-spectrum-infrared-sauna-with-medical-grade-red-light-therapy", "Peak Fuji 2-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, weight, electrical requirements and construction"],
  ["peak-patagonia-product", "https://peaksaunas.com/products/peak-saunas-patagonia-2-person-outdoor-full-spectrum-infrared-sauna-with-smart-wifi-app-control", "Peak Patagonia 2-Person Outdoor Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, weight, electrical requirements and construction"],
  ["almost-heaven-pinnacle-product", "https://almostheaven.com/products/pinnacle-4-person-barrel-sauna", "Almost Heaven Pinnacle 4 Person Barrel Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-princeton-product", "https://almostheaven.com/products/princeton-6-person-barrel-sauna", "Almost Heaven Princeton 6 Person Barrel Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-audra-product", "https://almostheaven.com/products/audra-2-4-person-canopy-barrel-sauna", "Almost Heaven Audra 2-4 Person Canopy Barrel Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
];

const productFacts = {
  "redwood-extra-wide-porch-6": {
    source: "redwood-extra-wide-porch-6-product", evidence: "evidence-redwood-extra-wide-porch-6-product", configEvidence: "evidence-redwood-extra-wide-porch-6-configuration",
    heat: "traditional", energy: ["electric"], exterior: dimension(84.75, 92.5, 88.5), shipping: dimension(42.1, 94.1, 40), weight: 1234, material: ["Canadian heat-treated hemlock"], power: 6000, current: 30,
    productRaw: "Extra-Wide Outdoor Barrel Sauna with Porch 6 Person; traditional outdoor sauna kit with seating for up to 6 people and an included 6 kW Harvia KIP electric heater.",
    configRaw: "Redwood specifications: exterior 92.5 L x 84.75 W x 88.5 H in; shipping 94.1 L x 42.1 W x 40 H in; Canadian heat-treated hemlock; net weight 1,234 lb; electrical requirements 120 V lighting and 240 V heater; included 6 kW heater listed at 30 A.",
  },
  "redwood-barrel-8": {
    source: "redwood-barrel-8-product", evidence: "evidence-redwood-barrel-8-product", configEvidence: "evidence-redwood-barrel-8-configuration",
    heat: "traditional", energy: ["electric"], exterior: dimension(72.75, 92.5, 76.5), shipping: dimension(44, 96, 33), weight: 1150, material: ["Canadian Thermowood"], power: 8000, current: 40,
    productRaw: "Barrel Outdoor Sauna 8 Person; traditional outdoor sauna kit with seating for up to 8 people and an included 8 kW Harvia KIP electric heater.",
    configRaw: "Redwood specifications: exterior 92.5 L x 72.75 W x 76.5 H in; shipping 96 L x 44 W x 33 H in; Canadian Thermowood; net weight 1,150 lb; electrical requirements 120 V lighting and 240 V heater; included 8 kW heater listed at 40 A.",
  },
  "redwood-noctra-8": {
    source: "redwood-noctra-8-product", evidence: "evidence-redwood-noctra-8-product", configEvidence: "evidence-redwood-noctra-8-configuration",
    heat: "traditional", energy: ["electric"], exterior: dimension(75.5, 89.75, 85.75), shipping: dimension(90.5, 50.5, 32.25), weight: 1410, material: ["Heat-treated hemlock stained black"], power: 8000, current: 40,
    productRaw: "Noctra Outdoor Sauna 8 Person; traditional outdoor sauna kit with seating for up to 8 people and an included 8 kW Harvia KIP electric heater.",
    configRaw: "Redwood specifications: base exterior 89.75 L x 75.5 W x 85.75 H in; shipping 90.5 W x 50.5 L x 32.25 H in; heat-treated hemlock stained black; net weight 1,410 lb; electrical requirements 120 V lighting and 240 V heater; included 8 kW heater listed at 40 A.",
  },
  "saunalife-e8": {
    source: "saunalife-e8-product", evidence: "evidence-saunalife-e8-product", configEvidence: "evidence-saunalife-e8-configuration",
    exterior: dimension(81, 87, 81), shipping: dimension(44, 88, 43), weight: 1345, material: ["European Thermo-Spruce", "Thermo-Aspen"],
    productRaw: "ERGO Series Model E8; 6-person outdoor barrel sauna with 81 in diameter and 87 in length, constructed with Thermo-Spruce staves and Thermo-Aspen benches.",
    configRaw: "SaunaLife E8 specifications: exterior barrel 81 in diameter x 87 in length; shipping 88 L x 44 W x 43 H in; weight 1,345 lb; full-length Thermo-Spruce staves and Thermo-Aspen benches.",
  },
  "saunalife-e8w": {
    source: "saunalife-e8w-product", evidence: "evidence-saunalife-e8w-product", configEvidence: "evidence-saunalife-e8w-configuration",
    exterior: dimension(81, 87, 81), shipping: dimension(44, 88, 44), weight: 1367, material: ["European Thermo-Spruce", "Thermo-Aspen"],
    productRaw: "ERGO Series Model E8W; 6-person outdoor barrel sauna with rear window, 81 in diameter and 87 in length, constructed with Thermo-Spruce staves and Thermo-Aspen benches.",
    configRaw: "SaunaLife E8W specifications: exterior barrel 81 in diameter x 87 in length; shipping 88 L x 44 W x 44 H in; weight 1,367 lb; full-length Thermo-Spruce staves and Thermo-Aspen benches.",
  },
  "saunalife-e8g": {
    source: "saunalife-e8g-product", evidence: "evidence-saunalife-e8g-product", configEvidence: "evidence-saunalife-e8g-configuration",
    exterior: dimension(81, 87, 81), shipping: dimension(44, 88, 41), weight: 1544, material: ["European Thermo-Spruce", "Thermo-Aspen"],
    productRaw: "ERGO Series Model E8G; 6-person outdoor barrel sauna with full-glass front, 81 in diameter and 87 in length, constructed with Thermo-Spruce staves and Thermo-Aspen benches.",
    configRaw: "SaunaLife E8G specifications: exterior barrel 81 in diameter x 87 in length; shipping 88 L x 44 W x 41 H in; weight 1,544 lb; full-length Thermo-Spruce staves and Thermo-Aspen benches.",
  },
  "saunalife-cl7g": {
    source: "saunalife-cl7g-product", evidence: "evidence-saunalife-cl7g-product", configEvidence: "evidence-saunalife-cl7g-configuration",
    exterior: dimension(91, 86.6, 93), interior: dimension(87.5, 70.8, 85.5), shipping: dimension(91, 86, 93), weight: 2040, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    productRaw: "CUBE Series Model CL7G; 6-person outdoor sauna kit with full-glass front, Thermo-Spruce exterior and Thermo-Aspen seating.",
    configRaw: "SaunaLife CL7G overview: exterior 91 W x 86.6 D x 93 H in and interior 87.5 W x 70.8 D x 85.5 H in. The floor-plan section rounds these to 91 x 86 x 93 in and 87 x 70 x 85 in. Shipping is 91 W x 86 D x 93 H in; weight is 2,040 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass.",
  },
  "saunalife-e6w": {
    source: "saunalife-e6w-product", evidence: "evidence-saunalife-e6w-product", configEvidence: "evidence-saunalife-e6w-configuration",
    capacity: 3, shipping: dimension(44, 80, 34), weight: 1125, material: ["European Thermo-Spruce", "Thermo-Aspen"],
    exteriorReason: "The individual product page gives a barrel diameter of 81 in and length of 59 in, not a complete width/depth/height envelope.",
    interiorReason: "The individual product page gives an interior height of 6 ft 5 in but not complete interior width and depth dimensions.",
    productRaw: "ERGO Series Model E6W; 3-person outdoor barrel sauna with panoramic half-moon rear window, 81 in diameter and 59 in length, constructed with Thermo-Spruce staves and Thermo-Aspen benches.",
    configRaw: "SaunaLife E6W specifications: barrel 81 in diameter x 59 in length; shipping 80 in x 44 in x 34 in; weight 1,125 lb; full-length Thermo-Spruce staves and Thermo-Aspen benches. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-e7w": {
    source: "saunalife-e7w-product", evidence: "evidence-saunalife-e7w-product", configEvidence: "evidence-saunalife-e7w-configuration",
    capacity: 4, shipping: dimension(44, 80, 41), weight: 1235, material: ["European Thermo-Spruce", "Thermo-Aspen"],
    exteriorReason: "The individual product page gives a barrel diameter of 81 in and length of 71 in, not a complete width/depth/height envelope.",
    interiorReason: "The individual product page gives an interior height of 6 ft 5 in but not complete interior width and depth dimensions.",
    productRaw: "ERGO Series Model E7W; 4-person outdoor barrel sauna with panoramic half-moon rear window, 81 in diameter and 71 in length, constructed with Thermo-Spruce staves and Thermo-Aspen benches.",
    configRaw: "SaunaLife E7W specifications: barrel 81 in diameter x 71 in length; shipping 80 in x 44 in x 41 in; weight 1,235 lb; full-length Thermo-Spruce staves and Thermo-Aspen benches. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-e7g": {
    source: "saunalife-e7g-product", evidence: "evidence-saunalife-e7g-product", configEvidence: "evidence-saunalife-e7g-configuration",
    capacity: 4, shipping: dimension(44, 80, 37), weight: 1279, material: ["European Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    exteriorReason: "The individual product page gives a barrel diameter of 81 in and length of 71 in, not a complete width/depth/height envelope.",
    interiorReason: "The individual product page gives an interior height of 6 ft 5 in but not complete interior width and depth dimensions.",
    productRaw: "ERGO Series Model E7G; 4-person outdoor barrel sauna with full-glass front, 81 in diameter and 71 in length, constructed with Thermo-Spruce staves, Thermo-Aspen benches and tempered bronze glass.",
    configRaw: "SaunaLife E7G specifications: barrel 81 in diameter x 71 in length; shipping 80 in x 44 in x 37 in; weight 1,279 lb; full-length Thermo-Spruce staves, Thermo-Aspen benches and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-cl4g": {
    source: "saunalife-cl4g-product", evidence: "evidence-saunalife-cl4g-product", configEvidence: "evidence-saunalife-cl4g-configuration",
    capacity: 3, exterior: dimension(80.7, 49.2, 82.7), interior: dimension(77.2, 41.3, 74.8), shipping: dimension(80, 49, 82), weight: 1415, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    productRaw: "CUBE Series Model CL4G; 3-person outdoor sauna kit with full-glass front, Thermo-Spruce exterior, Thermo-Aspen seating and tempered bronze glass.",
    configRaw: "SaunaLife CL4G specifications: exterior 80.7 W x 49.2 D x 82.7 H in; interior 77.2 W x 41.3 D x 74.8 H in; shipping 80 W x 49 D x 82 H in; weight 1,415 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-cl5g": {
    source: "saunalife-cl5g-product", evidence: "evidence-saunalife-cl5g-product", configEvidence: "evidence-saunalife-cl5g-configuration",
    capacity: 4, exterior: dimension(80.7, 63, 82.7), interior: dimension(77.2, 55.1, 74.8), shipping: dimension(80, 63, 82), weight: 1680, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    productRaw: "CUBE Series Model CL5G; 4-person outdoor sauna kit with full-glass front, Thermo-Spruce exterior, Thermo-Aspen seating and tempered bronze glass.",
    configRaw: "SaunaLife CL5G specifications: exterior 80.7 W x 63 D x 82.7 H in; interior 77.2 W x 55.1 D x 74.8 H in; shipping 80 W x 63 D x 82 H in; weight 1,680 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-cl12gcp": {
    source: "saunalife-cl12gcp-product", evidence: "evidence-saunalife-cl12gcp-product", configEvidence: "evidence-saunalife-cl12gcp-configuration",
    capacity: 8, exterior: dimension(91, 151.6, 93), interior: dimension(87.5, 122.5, 85.5), shipping: dimension(155, 44, 47), weight: 3450, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    productRaw: "CUBE Series Model CL12GCP; 8-person outdoor sauna suite with changing room and front porch, Thermo-Spruce exterior, Thermo-Aspen seating and tempered bronze glass.",
    configRaw: "SaunaLife CL12GCP specifications: exterior 91 W x 151.6 D x 93 H in; interior 87.5 W x 122.5 D x 85.5 H in; sauna room 87.5 W x 78.6 D x 85.5 H in; dressing room 87.5 W x 43.9 D x 85.5 H in; porch 87.5 W x 22.75 D x 85.5 H in; shipping 155 W x 44 D x 47 H in; weight 3,450 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-ee6g": {
    source: "saunalife-ee6g-product", evidence: "evidence-saunalife-ee6g-product", configEvidence: "evidence-saunalife-ee6g-configuration",
    capacity: 4, weight: 1500, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    exteriorReason: "The individual product page gives a barrel diameter of 91 in and length of 63 in, not a complete width/depth/height envelope.",
    interiorReason: "The individual product page gives an interior barrel diameter of 87 in and length of 55 in, not complete width/depth/height dimensions.",
    shippingReason: "The individual product page gives shipping length and width of 80 in x 43 in but does not state a third shipping dimension.",
    productRaw: "ERGO Elegance Series Model EE6G; 4-person outdoor barrel sauna with full-glass front, 91 in diameter and 63 in length, constructed with Thermo-Spruce staves, Thermo-Aspen seating and tempered bronze glass.",
    configRaw: "SaunaLife EE6G specifications: barrel 91 in diameter x 63 in length; interior barrel 87 in diameter x 55 in length; shipping data 80 in length x 43 in width with no third dimension stated; weight 1,500 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-ee8g": {
    source: "saunalife-ee8g-product", evidence: "evidence-saunalife-ee8g-product", configEvidence: "evidence-saunalife-ee8g-configuration",
    capacity: 4, weight: 1763, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    exteriorReason: "The individual product page gives a barrel diameter of 91 in and length of 79 in, not a complete width/depth/height envelope.",
    interiorReason: "The individual product page gives an interior barrel diameter of 87 in and length of 71 in, not complete width/depth/height dimensions.",
    shippingReason: "The individual product page gives shipping length and width of 80 in x 43 in but does not state a third shipping dimension.",
    productRaw: "ERGO Elegance Series Model EE8G; 4-person outdoor barrel sauna with full-glass front, 91 in diameter and 79 in length, constructed with Thermo-Spruce staves, Thermo-Aspen seating and tempered bronze glass.",
    configRaw: "SaunaLife EE8G specifications: barrel 91 in diameter x 79 in length; interior barrel 87 in diameter x 71 in length; shipping data 80 in length x 43 in width with no third dimension stated; weight 1,763 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-gl4": {
    source: "saunalife-gl4-product", evidence: "evidence-saunalife-gl4-product", configEvidence: "evidence-saunalife-gl4-configuration",
    capacity: 4, exterior: dimension(58.9, 79.5, 85), interior: dimension(55.5, 59, 76), shipping: dimension(83, 43, 32), weight: 1830, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    productRaw: "Garden Luxury Series Model GL4; 4-person outdoor sauna cabin with integrated porch and full bronze-glass front, built with Thermo-Spruce and thermo-hardwood seating.",
    configRaw: "SaunaLife GL4 specifications: exterior 58.9 W x 79.5 D x 85 H in; interior 55.5 W x 59 D x 76 H in; shipping 83 W x 43 D x 32 H in; weight 1,830 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "saunalife-gl6": {
    source: "saunalife-gl6-product", evidence: "evidence-saunalife-gl6-product", configEvidence: "evidence-saunalife-gl6-configuration",
    capacity: 6, exterior: dimension(90.2, 90.2, 92.5), interior: dimension(69.7, 69.7, 79.1), shipping: dimension(83, 43, 43), weight: 2425, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    productRaw: "Garden Luxury Series Model GL6; 6-person outdoor sauna cabin with integrated porch and full bronze-glass front, built with Thermo-Spruce and thermo-hardwood seating.",
    configRaw: "SaunaLife GL6 specifications: exterior 90.2 W x 90.2 D x 92.5 H in; interior 69.7 W x 69.7 D x 79.1 H in; shipping 83 W x 43 D x 43 H in; weight 2,425 lb; construction uses Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirements.",
  },
  "peak-mini": {
    source: "peak-mini-product", evidence: "evidence-peak-mini-product", configEvidence: "evidence-peak-mini-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1, exterior: dimension(31, 32, 67), material: ["Canadian Hemlock"], voltage: 120, ratedPower: 1200, current: 10,
    interiorReason: "The reviewed product page publishes exterior dimensions but does not state complete interior dimensions.",
    shippingReason: "The reviewed product page describes crate-protected delivery but does not state shipping dimensions.",
    productRaw: "Peak Mini; 1-person indoor full-spectrum infrared sauna with medical-grade red-light panel and app control, built with Canadian Hemlock.",
    configRaw: "Peak Mini specifications: exterior 31 W x 32 D x 67 H in; electrical 120 V / 10 A / 1,200 W with standard outlet plug; construction uses Canadian Hemlock. The page does not state complete interior dimensions, shipping dimensions or product weight.",
  },
  "peak-fuji": {
    source: "peak-fuji-product", evidence: "evidence-peak-fuji-product", configEvidence: "evidence-peak-fuji-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(53, 44, 75), interior: dimension(49, 40, 67), weight: 385, material: ["Canadian Red Cedar"], voltage: 120, ratedPower: 2050, current: 20,
    shippingReason: "The reviewed product page describes crate-protected delivery but does not state shipping dimensions.",
    productRaw: "Peak Fuji; 2-person indoor full-spectrum infrared sauna with medical-grade red-light panel and app control, built with Canadian Red Cedar.",
    configRaw: "Peak Fuji specifications: exterior 53 W x 44 D x 75 H in; interior 49 W x 40 D x 67 H in; weight 385 lb; electrical 120 V / 20 A / 2,050 W with a dedicated 20 A circuit; construction uses Canadian Red Cedar.",
  },
  "peak-patagonia": {
    source: "peak-patagonia-product", evidence: "evidence-peak-patagonia-product", configEvidence: "evidence-peak-patagonia-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(52, 42, 83), interior: dimension(44, 38, 77), weight: 798, material: ["Aerospace-grade aluminum", "Canadian Hemlock"], voltage: 240, ratedPower: 3350, current: 20,
    shippingReason: "The reviewed product page describes crate-protected delivery but does not state shipping dimensions.",
    productRaw: "Peak Patagonia; 2-person outdoor full-spectrum infrared sauna with smart app control, aerospace-grade aluminum exterior and Canadian Hemlock interior.",
    configRaw: "Peak Patagonia specifications: exterior 52 W x 42 D x 83 H in; interior 44 W x 38 D x 77 H in; weight 798 lb; electrical 240 V / 20 A / 3,350 W with a dedicated outdoor-rated circuit; construction uses aerospace-grade aluminum and Canadian Hemlock.",
  },
  "almost-heaven-pinnacle": {
    source: "almost-heaven-pinnacle-product", evidence: "evidence-almost-heaven-pinnacle-product", configEvidence: "evidence-almost-heaven-pinnacle-configuration",
    heat: "traditional", energy: ["electric"], capacity: 4, exterior: dimension(78, 71, 81.5), interior: dimension(75.25, 63.25, 69.25), material: ["Rustic Red Cedar", "Onyx"], power: 6000, current: 30,
    shippingReason: "The reviewed product page gives a shipping lead time but does not state shipping dimensions or weight.",
    productRaw: "Pinnacle 4 Person Barrel Sauna; outdoor barrel sauna with seating for up to four people and a 6 kW electric heater. Lumber options include Rustic Red Cedar and Onyx.",
    configRaw: "Almost Heaven Pinnacle specifications: assembled 78 W x 71 D x 81.5 H in; interior room 75.25 W x 63.25 D x 69.25 H in; heater 6 kW / 240 V with a 30 A hardwire requirement; lighting 120 V / 15 A plug-in service. The page does not state shipping dimensions or product weight.",
  },
  "almost-heaven-princeton": {
    source: "almost-heaven-princeton-product", evidence: "evidence-almost-heaven-princeton-product", configEvidence: "evidence-almost-heaven-princeton-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(78, 94, 75.375), interior: dimension(75.25, 86.375, 69.25), material: ["Rustic Red Cedar", "Onyx"], power: 8000, current: 40,
    shippingReason: "The reviewed product page gives a shipping lead time and flatbed note but does not state shipping dimensions or weight.",
    productRaw: "Princeton 6 Person Barrel Sauna; outdoor barrel sauna with seating for up to six people and an 8 kW electric heater. Lumber options include Rustic Red Cedar and Onyx.",
    configRaw: "Almost Heaven Princeton specifications: assembled 78 W x 94 D x 75.375 H in; interior room 75.25 W x 86.375 D x 69.25 H in; heater 8 kW / 240 V with a 40 A hardwire requirement; lighting 110 V / 15 A plug-in service. The page notes flatbed shipping but does not state shipping dimensions or product weight.",
  },
  "almost-heaven-audra": {
    source: "almost-heaven-audra-product", evidence: "evidence-almost-heaven-audra-product", configEvidence: "evidence-almost-heaven-audra-configuration",
    heat: "traditional", energy: ["electric"], capacity: 4, exterior: dimension(78, 71, 75.375), interior: dimension(75.25, 51.25, 69.25), material: ["Rustic Red Cedar", "Onyx"], power: 6000, current: 30,
    shippingReason: "The reviewed product page gives a shipping lead time but does not state shipping dimensions or weight.",
    productRaw: "Audra 2-4 Person Canopy Barrel Sauna; outdoor barrel sauna with seating for up to four people, canopy porch and a 6 kW electric heater. Lumber options include Rustic Red Cedar and Onyx.",
    configRaw: "Almost Heaven Audra specifications: assembled 78 W x 71 D x 75.375 H in; interior room 75.25 W x 51.25 D x 69.25 H in; heater 6 kW / 240 V with a 30 A hardwire requirement; lighting 110 V / 15 A plug-in service. The page does not state shipping dimensions or product weight.",
  },
};

const redwoodConfigurationsWithAmpOnlyEvidence = new Set([
  "redwood-garden-8-standard",
  "redwood-grove-8-standard",
  "redwood-vista-6-standard",
  "redwood-horizon-6-standard",
  "redwood-duo-2-standard",
  "redwood-summit-6-standard",
  "redwood-barrel-6-standard",
  "redwood-barrel-porch-6-standard",
  "redwood-extra-wide-porch-6-standard",
  "redwood-extra-wide-6-standard",
  "redwood-barrel-8-standard",
  "redwood-noctra-8-standard",
]);

const productsDoc = await load("data/us/products.json");
const configurationsDoc = await load("data/us/configurations.json");
const sourcesDoc = await load("data/us/sources.json");
const products = productsDoc.products;
const configurations = configurationsDoc.configurations;

for (const [id, url, title, publisher, locator] of sourceDefinitions) {
  const existing = sourcesDoc.sources.find((source) => source.id === id);
  if (existing) {
    existing.url = url;
    existing.title = title;
    existing.publisher = publisher;
    existing.market = "US";
    existing.checked_at = today;
    existing.locator = locator;
  } else {
    sourcesDoc.sources.push({ id, type: "manufacturer-page", url, title, publisher, market: "US", checked_at: today, locator });
  }
}

for (const [productId, facts] of Object.entries(productFacts)) {
  const product = products.find((item) => item.id === productId);
  const configuration = configurations.find((item) => item.id === `${productId}-standard`);
  if (!product || !configuration) throw new Error(`Missing catalog record for ${productId}`);
  const { evidence, configEvidence, source } = facts;

  const productEvidence = { id: evidence, entity_id: productId, source_id: source, field_path: "manufacturer-product-page", raw_value: facts.productRaw };
  const configurationEvidence = { id: configEvidence, entity_id: configuration.id, source_id: source, field_path: "manufacturer-product-page.specifications", raw_value: facts.configRaw };
  const productEvidenceIndex = sourcesDoc.evidence.findIndex((item) => item.id === evidence);
  const configurationEvidenceIndex = sourcesDoc.evidence.findIndex((item) => item.id === configEvidence);
  if (productEvidenceIndex === -1) sourcesDoc.evidence.push(productEvidence);
  else sourcesDoc.evidence[productEvidenceIndex] = productEvidence;
  if (configurationEvidenceIndex === -1) sourcesDoc.evidence.push(configurationEvidence);
  else sourcesDoc.evidence[configurationEvidenceIndex] = configurationEvidence;

  for (const field of ["product_type", "placements", "form"]) product[field].evidence_ids = Array.from(new Set([...(product[field].evidence_ids ?? []), evidence]));
  if (facts.heat) product.heat_type = documented(facts.heat, evidence);
  else product.heat_type = unknown("The reviewed product page does not identify a supplied heating system or a specific heat format.");
  if (facts.energy) product.energy_sources = documented(facts.energy, evidence);
  else product.energy_sources = unknown("The reviewed product page does not identify the energy source of a supplied heater.");
  product.source_ids = Array.from(new Set([...(product.source_ids ?? []), source]));
  product.spec_checked_at = today;
  product.change_reason = "Official US manufacturer product page reviewed in the Luna catalog-enrichment batch; unresolved fields remain explicitly unknown.";

  configuration.source_ids = Array.from(new Set([...(configuration.source_ids ?? []), source]));
  configuration.manufacturer_sku = unknown("A manufacturer SKU is not stated on the reviewed product page.");
  if (facts.capacity) configuration.capacity.seated = documented(facts.capacity, configEvidence);
  else configuration.capacity.seated.evidence_ids = Array.from(new Set([...(configuration.capacity.seated.evidence_ids ?? []), configEvidence]));
  configuration.capacity.reclining = unknown("A reclining capacity is not stated on the reviewed product page.");
  if (facts.exterior) configuration.dimensions.exterior = documented(facts.exterior, configEvidence);
  else if (facts.exteriorReason) configuration.dimensions.exterior = unknown(facts.exteriorReason);
  if (facts.interior) configuration.dimensions.interior = documented(facts.interior, configEvidence);
  else if (facts.interiorReason) configuration.dimensions.interior = unknown(facts.interiorReason);
  else if (productId.startsWith("saunalife-e8")) configuration.dimensions.interior = unknown("The reviewed product page states a 6 ft 5 in interior height but not complete interior dimensions.");
  else configuration.dimensions.interior = unknown("Interior dimensions are not stated in the reviewed product specifications.");
  if (facts.shipping) configuration.dimensions.shipping = documented(facts.shipping, configEvidence);
  else if (facts.shippingReason) configuration.dimensions.shipping = unknown(facts.shippingReason);
  configuration.dimensions.minimum_clearances = unknown("Installation clearances require review of the linked installation documentation.");
  if (facts.weight) configuration.net_weight = documented({ value: facts.weight, unit: "lb" }, configEvidence);
  else configuration.net_weight = unknown("Net weight is not listed on the reviewed product page.");
  configuration.shipping_weight = unknown("The product page lists a product weight but does not identify a separate shipping weight.");
  if (facts.material) configuration.materials = documented(facts.material, configEvidence);

  const electrical = configuration.electrical_supply_options[0];
  const requirement = electrical.requirements[0];
  if (facts.power) {
    electrical.id = `${productId}-heater-240v`;
    requirement.voltage_v = documented(240, configEvidence);
    requirement.rated_power_w = documented(facts.power, configEvidence);
    requirement.rated_current_a = documented(facts.current, configEvidence);
    electrical.evidence_ids = [configEvidence];
  } else if (facts.ratedPower || facts.voltage || facts.current) {
    if (facts.voltage) requirement.voltage_v = documented(facts.voltage, configEvidence);
    if (facts.ratedPower) requirement.rated_power_w = documented(facts.ratedPower, configEvidence);
    if (facts.current) requirement.rated_current_a = documented(facts.current, configEvidence);
    electrical.evidence_ids = Array.from(new Set([...(electrical.evidence_ids ?? []), configEvidence]));
  } else {
    requirement.voltage_v = unknown("The reviewed product page does not specify the selected heater or its voltage.");
    requirement.rated_power_w = unknown("The reviewed product page does not specify the selected heater or its rated power.");
    requirement.rated_current_a = unknown("The reviewed product page does not specify the selected heater or its rated current.");
  }
  if (facts.power || (!facts.ratedPower && !facts.voltage && !facts.current)) {
    requirement.frequency_hz = unknown("Frequency is not stated in the reviewed product specifications.");
    requirement.phase = unknown("Phase is not stated in the reviewed product specifications.");
    requirement.required_circuit_a = unknown(facts.power
      ? "The product page lists heater amperage but does not state a required circuit rating."
      : "The reviewed product page does not specify the selected heater or a required circuit rating.");
    requirement.specified_breaker_a = unknown("A breaker rating is not stated in the reviewed product specifications.");
    requirement.connection = unknown("Connection type is not stated in the reviewed product specifications.");
    requirement.plug_type = unknown("Plug type is not stated in the reviewed product specifications.");
    requirement.dedicated_circuit = unknown("Dedicated-circuit requirements are not stated in the reviewed product specifications.");
  }
  for (const key of ["manufacturer_sku", "dimensions", "net_weight", "shipping_weight", "materials"]) {
    if (key === "dimensions" || key === "net_weight" || key === "materials") continue;
    if (configuration[key]?.status === "documented") configuration[key].evidence_ids = Array.from(new Set([...(configuration[key].evidence_ids ?? []), configEvidence]));
  }
}

for (const configuration of configurations) {
  if (!redwoodConfigurationsWithAmpOnlyEvidence.has(configuration.id)) continue;
  for (const option of configuration.electrical_supply_options ?? []) {
    for (const requirement of option.requirements ?? []) {
      requirement.required_circuit_a = unknown("The product page lists heater amperage but does not state a required circuit rating.");
    }
  }
}

await save("data/us/products.json", productsDoc);
await save("data/us/configurations.json", configurationsDoc);
await save("data/us/sources.json", sourcesDoc);
console.log(`Luna enrichment applied for ${Object.keys(productFacts).length} US products.`);
