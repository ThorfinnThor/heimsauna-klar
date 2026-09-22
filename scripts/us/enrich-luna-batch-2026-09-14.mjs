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
  ["peak-shasta-product", "https://peaksaunas.com/products/peak-saunas-shasta-1-person-indoor-near-zero-emf-full-spectrum-infrared-sauna-with-xl-medical-grade-red-light-therapy-smart-wifi-app-control", "Peak Shasta 1-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, electrical requirements and construction"],
  ["peak-everest-product", "https://peaksaunas.com/products/peak-saunas-everest-2-person-indoor-near-zero-emf-full-spectrum-infrared-sauna-with-medical-grade-red-light-therapy", "Peak Everest 2-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, electrical requirements and construction"],
  ["jnh-tosi-1-product", "https://jnhlifestyles.com/tosi-1-person-full-spectrum-infrared-sauna", "JNH Lifestyles Tosi 1-Person Full Spectrum Infrared Sauna product page", "JNH Lifestyles", "Product page specifications for capacity, dimensions, electrical requirements and construction"],
  ["jnh-tosi-2-product", "https://jnhlifestyles.com/tosi-2-person-full-spectrum-infrared-sauna", "JNH Lifestyles Tosi 2-Person Full Spectrum Infrared Sauna product page", "JNH Lifestyles", "Product page specifications for capacity, dimensions, electrical requirements and construction"],
  ["jnh-tosi-4-product", "https://jnhlifestyles.com/tosi-red-4-person-full-spectrum-infrared-sauna", "JNH Lifestyles Tosi Red 4-Person Full Spectrum Infrared Sauna product page", "JNH Lifestyles", "Product page specifications for capacity, dimensions, electrical requirements and construction"],
  ["jnh-arki-outdoor-duo-product", "https://jnhlifestyles.com/all-saunas/jnh-arki-outdoor-2-person-red-light-therapy-full-spectrum-infrared-sauna-ultra-low-emf/", "JNH Lifestyles Arki Outdoor Duo 2-Person Infrared Sauna product page", "JNH Lifestyles", "Product page specifications for capacity, dimensions, electrical requirements and construction"],
  ["saunalife-x2-product", "https://saunalife.com/saunas/xperience-series-model-x2/", "SaunaLife XPERIENCE-Series Model X2 product page", "SaunaLife", "Product page specifications for capacity, dimensions, shipping data, weight and construction"],
  ["saunalife-g2-product", "https://saunalife.com/saunas/garden-series-model-g2/", "SaunaLife Garden-Series Model G2 product page", "SaunaLife", "Product page specifications for capacity, dimensions, shipping data, weight and construction"],
  ["saunalife-g3-product", "https://saunalife.com/saunas/garden-series-model-g3/", "SaunaLife Garden-Series Model G3 product page", "SaunaLife", "Product page specifications for dimensions, shipping data, weight and construction"],
  ["saunalife-g6-product", "https://saunalife.com/saunas/outdoor-model-g6/", "SaunaLife Outdoor Model G6 product page", "SaunaLife", "Product page specifications for capacity, dimensions, shipping data, weight and construction"],
  ["saunalife-g11-product", "https://saunalife.com/saunas/garden-series-model-g11/", "SaunaLife Garden-Series Model G11 product page", "SaunaLife", "Product page specifications for capacity, room dimensions, shipping data, weight and construction"],
  ["saunalife-cl3g-product", "https://saunalife.com/saunas/cube-series-model-cl3g/", "SaunaLife Cube-Series Model CL3G product page", "SaunaLife", "Product page specifications for capacity, dimensions, shipping data, weight and construction"],
  ["saunalife-e6-product", "https://saunalife.com/saunas/ergo-series-model-e6/", "SaunaLife Ergo-Series Model E6 product page", "SaunaLife", "Product page specifications for capacity, barrel dimensions, shipping data, weight and construction"],
  ["saunalife-e7-product", "https://saunalife.com/saunas/ergo-series-model-e7/", "SaunaLife Ergo-Series Model E7 product page", "SaunaLife", "Product page specifications for capacity, barrel dimensions, shipping data, weight and construction"],
  ["peak-crown-product", "https://peaksaunas.com/products/peak-saunas-crown-2-person-full-spectrum-infrared-sauna", "Peak Crown 2-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, weight, electrical requirements and construction"],
  ["peak-rainier-product", "https://peaksaunas.com/products/peak-saunas-rainier-1-person-indoor-full-spectrum-infrared-sauna", "Peak Rainier 1-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, weight, electrical requirements and construction"],
  ["peak-matterhorn-product", "https://peaksaunas.com/products/peak-saunas-matterhorn-3-person-indoor-near-zero-emf-full-spectrum-infrared-sauna", "Peak Matterhorn 3-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, weight, electrical requirements and construction"],
  ["peak-kilimanjaro-product", "https://peaksaunas.com/products/peak-saunas-kilimanjaro-5-person-indoor-near-zero-emf-full-spectrum-infrared-sauna", "Peak Kilimanjaro 5-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, weight and electrical requirements"],
  ["peak-el-capitan-product", "https://peaksaunas.com/products/peak-saunas-el-capitan-4-person-indoor-near-zero-emf-full-spectrum-infrared-sauna", "Peak El Capitan 4-Person Full Spectrum Infrared Sauna product page", "Peak Saunas", "Product page specifications for capacity, dimensions, weight and electrical requirements"],
  ["almost-heaven-hillsboro-product", "https://almostheaven.com/collections/saunas/products/hillsboro-2-person-indoor-sauna", "Almost Heaven Hillsboro 2 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-logan-product", "https://almostheaven.com/products/logan-1-person-indoor-sauna", "Almost Heaven Logan 1 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-rainelle-product", "https://almostheaven.com/products/rainelle-4-person-indoor-sauna", "Almost Heaven Rainelle 4 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-bridgeport-product", "https://almostheaven.com/products/bridgeport-6-person-indoor-sauna", "Almost Heaven Bridgeport 6 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-grandview-product", "https://almostheaven.com/products/grandview-4-6-person-canopy-barrel-sauna", "Almost Heaven Grandview 4-6 Person Canopy Barrel Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and canopy construction"],
  ["almost-heaven-titan-product", "https://almostheaven.com/products/titan-6-person-indoor-sauna", "Almost Heaven Titan 6 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-patterson-product", "https://almostheaven.com/products/patterson-6-person-indoor-sauna", "Almost Heaven Patterson 6 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-lewisburg-product", "https://almostheaven.com/products/lewisburg-6-8-person-barrel-sauna", "Almost Heaven Lewisburg 6-8 Person Barrel Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-grayson-product", "https://almostheaven.com/products/grayson-4-person-indoor-sauna", "Almost Heaven Grayson 4 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["almost-heaven-charleston-product", "https://almostheaven.com/products/charleston-4-person-canopy-barrel-sauna", "Almost Heaven Charleston 4 Person Canopy Barrel Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and canopy construction"],
  ["almost-heaven-huntington-product", "https://almostheaven.com/products/huntington-4-6-person-canopy-barrel-sauna", "Almost Heaven Huntington 4-6 Person Canopy Barrel Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and canopy construction"],
  ["almost-heaven-madison-product", "https://almostheaven.com/products/madison-2-3-person-indoor-sauna", "Almost Heaven Madison 2-3 Person Indoor Sauna product page", "Almost Heaven Saunas", "Product page specifications for capacity, dimensions, heater requirements and construction"],
  ["sunlighten-mpulse-aspire-product", "https://www.sunlighten.eu/en/mpulse-aspire", "Sunlighten mPulse Aspire product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sunlighten-mpulse-believe-product", "https://www.sunlighten.eu/en/mpulse-believe", "Sunlighten mPulse Believe product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sunlighten-mpulse-conquer-product", "https://www.sunlighten.eu/en/mpulse-conquer", "Sunlighten mPulse Conquer product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sunlighten-mpulse-discover-product", "https://www.sunlighten.eu/en/mpulse-discover", "Sunlighten mPulse Discover product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sunlighten-mpulse-empower-product", "https://www.sunlighten.eu/en/mpulse-empower", "Sunlighten mPulse Empower product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sunlighten-amplify-ii-product", "https://www.sunlighten.eu/en/amplify-ii", "Sunlighten Amplify II product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sunlighten-amplify-iii-product", "https://www.sunlighten.eu/en/amplify-iii", "Sunlighten Amplify III product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sunlighten-amplify-iv-product", "https://www.sunlighten.eu/en/amplify-saunas", "Sunlighten Amplify sauna range page with Amplify IV listing", "Sunlighten", "Manufacturer range page confirms the Amplify IV model; individual dimensions and US electrical details remain to be verified"],
  ["sunlighten-signature-i-product", "https://www.sunlighten.eu/en/signature-i", "Sunlighten Signature I product page", "Sunlighten", "Manufacturer page specifications for capacity, dimensions, weight, materials and infrared technology"],
  ["sun-home-solstice-product", "https://sunhomesaunas.com/products/sun-home-solstice-4-person-infrared-sauna", "Sun Home Solstice 4-Person Infrared Sauna product page", "Sun Home Saunas", "Product page specifications for capacity, dimensions, weight, heater count and electrical requirements"],
  ["sun-home-equinox-product", "https://sunhomesaunas.com/pages/equinox", "Sun Home Equinox Infrared Sauna product page", "Sun Home Saunas", "Product page specifications for variant capacities, dimensions, weight, heater technology and electrical requirements"],
  ["sun-home-eclipse-2-product", "https://sunhomesaunas.com/pages/eclipse", "Sun Home Eclipse Infrared Sauna product page", "Sun Home Saunas", "Product page specifications for 2-person capacity, dimensions, weight, temperature and electrical requirements"],
  ["sun-home-pod-product", "https://sunhomesaunas.com/blogs/news/pod-user-guide", "Sun Home Pod user guide", "Sun Home Saunas", "Manufacturer guide confirms one-person indoor infrared design and operating context"],
  ["sun-home-luminar-2-product", "https://sunhomesaunas.com/pages/luminar", "Sun Home Luminar Infrared Sauna product page", "Sun Home Saunas", "Product page specifications for outdoor construction, capacity, dimensions, weight and electrical requirements"],
  ["sun-home-nova-3-product", "https://sunhomesaunas.com/pages/craftsmanship", "Sun Home Nova 3 craftsmanship and sauna range page", "Sun Home Saunas", "Manufacturer page confirms Nova 3 traditional sauna, cedar construction and HUUM DROP heater"],
  ["sun-home-solaris-product", "https://sunhomesaunas.com/blogs/help-center/solaris-saunas", "Sun Home Solaris sauna help page", "Sun Home Saunas", "Manufacturer help page specifications for Solaris variants, capacity and electrical requirements"],
  ["redwood-cabin-4-product", "https://www.redwoodoutdoors.com/products/cabin-outdoor-sauna-4-person", "Redwood Outdoors Cabin Outdoor Sauna 4 Person product page", "Redwood Outdoors", "Product page specifications for capacity, material, seating and heater options"],
  ["redwood-cove-3-product", "https://www.redwoodoutdoors.com/products/3-person-cove-sauna", "Redwood Outdoors Cove Sauna 3 Person product page", "Redwood Outdoors", "Product page specifications for capacity, material, venting and heater options"],
  ["redwood-garden-8-product", "https://www.redwoodoutdoors.com/products/garden-outdoor-sauna-8-person", "Redwood Outdoors Garden Outdoor Sauna 8 Person product page", "Redwood Outdoors", "Product page specifications for capacity, material, seating and included heater"],
  ["redwood-grove-8-product", "https://www.redwoodoutdoors.com/products/grove-outdoor-sauna-8-person", "Redwood Outdoors Grove Outdoor Sauna 8 Person product page", "Redwood Outdoors", "Product page specifications for capacity, accessibility-focused layout and material"],
  ["redwood-vista-6-product", "https://www.redwoodoutdoors.com/products/vista-outdoor-sauna-6-person", "Redwood Outdoors Vista Outdoor Sauna 6 Person product page", "Redwood Outdoors", "Product page specifications for capacity, dimensions, material and heater options"],
  ["redwood-horizon-6-product", "https://www.redwoodoutdoors.com/products/horizon-outdoor-sauna-6-person-porch", "Redwood Outdoors Horizon Outdoor Sauna 6 Person product page", "Redwood Outdoors", "Exact manufacturer product page: Specifications and Heater Options & Power Requirements"],
  ["redwood-duo-2-product", "https://www.redwoodoutdoors.com/products/duo-outdoor-sauna-2-person", "Redwood Outdoors Duo Outdoor Sauna 2 Person product page", "Redwood Outdoors", "Manufacturer product listing for capacity, compact layout, material and heater options"],
  ["redwood-summit-6-product", "https://www.redwoodoutdoors.com/products/summit-outdoor-sauna-6-person", "Redwood Outdoors Summit Outdoor Sauna 6 Person product page", "Redwood Outdoors", "Exact manufacturer product page: Specifications and Heater Options & Power Requirements"],
  ["redwood-barrel-6-product", "https://www.redwoodoutdoors.com/products/6-person-barrel-sauna", "Redwood Outdoors Barrel Outdoor Sauna 6 Person product page", "Redwood Outdoors", "Product page specifications for capacity, dimensions, weight, material and heater options"],
  ["redwood-barrel-porch-6-product", "https://www.redwoodoutdoors.com/products/barrel-sauna-porch-6-person", "Redwood Outdoors Barrel Outdoor Sauna with Porch 6 Person product page", "Redwood Outdoors", "Product page specifications for capacity, porch layout, material and heater options"],
  ["redwood-extra-wide-6-product", "https://www.redwoodoutdoors.com/products/extra-wide-barrel-sauna-6-person", "Redwood Outdoors Extra-Wide Barrel Sauna 6 Person product page", "Redwood Outdoors", "Product page specifications for capacity, dimensions, weight, material and heater options"],
  ["thermory-luik-kodiak-product", "https://sauna.thermoryusa.com/products/", "Thermory Luik Kodiak sauna product catalog listing", "Thermory", "Official product catalog specifications for occupancy, dimensions, volume and materials"],
  ["thermory-luik-ash-product", "https://sauna.thermoryusa.com/products/", "Thermory Luik Ash sauna product catalog listing", "Thermory", "Official product catalog specifications for occupancy, dimensions, volume and materials"],
  ["thermory-traditional-mod6-product", "https://sauna.thermoryusa.com/products/traditional-mod-series/", "Thermory Traditional Mod6 product page", "Thermory", "Official product page specifications for occupancy, dimensions, construction and materials"],
  ["thermory-modern-mod6-product", "https://sauna.thermoryusa.com/products/modern-mod-series/", "Thermory Modern Mod6 product page", "Thermory", "Official product page specifications for occupancy, dimensions, construction and materials"],
  ["thermory-mod4-traditional-product", "https://sauna.thermoryusa.com/products/traditional-mod-series/", "Thermory Traditional Mod4 product page", "Thermory", "Official product page specifications for occupancy, dimensions, construction and materials"],
  ["thermory-mod4-modern-product", "https://sauna.thermoryusa.com/products/modern-mod-series/", "Thermory Modern Mod4 product page", "Thermory", "Official product page specifications for occupancy, dimensions, construction and materials"],
  ["thermory-sauna-square-product", "https://sauna.thermoryusa.com/products/", "Thermory Sauna Square product catalog listing", "Thermory", "Official product catalog specifications for occupancy, dimensions, volume and materials"],
  ["thermory-natural-barrel-product", "https://sauna.thermoryusa.com/outlive-the-rest/", "Thermory Natural Barrel sauna range page", "Thermory", "Official range specifications for occupancy, dimensions, bench length and volume"],
  ["thermory-ignite-barrel-product", "https://sauna.thermoryusa.com/outlive-the-rest/", "Thermory Ignite Barrel sauna range page", "Thermory", "Official range specifications for occupancy, dimensions, bench length and volume"],
  ["redwood-electric-heater-product", "https://www.redwoodoutdoors.com/", "Redwood Outdoors electric sauna heater options", "Redwood Outdoors", "Manufacturer heater information and compatibility context"],
  ["redwood-heater-fence-product", "https://www.redwoodoutdoors.com/", "Redwood Outdoors sauna heater fence accessory", "Redwood Outdoors", "Manufacturer accessory listing and intended heater-safety use"],
  ["redwood-lighting-product", "https://www.redwoodoutdoors.com/", "Redwood Outdoors sauna lighting accessory", "Redwood Outdoors", "Manufacturer accessory listing and sauna lighting context"],
  ["redwood-bench-extender-product", "https://www.redwoodoutdoors.com/", "Redwood Outdoors sauna bench extender accessory", "Redwood Outdoors", "Manufacturer accessory listing and seating-use context"],
  ["redwood-roof-shingles-product", "https://www.redwoodoutdoors.com/", "Redwood Outdoors sauna roof shingles accessory", "Redwood Outdoors", "Manufacturer accessory listing and outdoor-sauna roof-use context"],
  ["redwood-privacy-screen-product", "https://www.redwoodoutdoors.com/", "Redwood Outdoors privacy screen accessory", "Redwood Outdoors", "Manufacturer accessory listing and outdoor-sauna privacy context"],
  ["redwood-outdoor-shower-product", "https://www.redwoodoutdoors.com/", "Redwood Outdoors outdoor shower accessory", "Redwood Outdoors", "Manufacturer accessory listing and outdoor-sauna cooling context"],
  ["sunlighten-solo-system-product", "https://www.sunlighten.eu/en/solo-system", "Sunlighten Solo System product page", "Sunlighten", "Manufacturer page confirms portable infrared panel system and chromotherapy lighting"],
  ["sunlighten-solo-rise-product", "https://www.sunlighten.eu/en/solo-system", "Sunlighten Solo Rise product listing", "Sunlighten", "Manufacturer page confirms Solo range and portable infrared system context; variant details remain to be verified"],
  ["sunlighten-luminir-panel-product", "https://www.sunlighten.eu/en/heating-technology", "Sunlighten LuminIR panel technology page", "Sunlighten", "Manufacturer technology page confirms LuminIR infrared panel context; standalone product dimensions remain to be verified"],
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
  "peak-shasta": {
    source: "peak-shasta-product", evidence: "evidence-peak-shasta-product", configEvidence: "evidence-peak-shasta-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1, exterior: dimension(42, 40, 75), interior: dimension(38, 36, 67), weight: 305, material: ["Canadian Hemlock"], voltage: 120, ratedPower: 1800, current: 15, connection: "plug-in", plugType: "NEMA 5-15P",
    productRaw: "Shasta 1-Person Infrared Sauna; indoor full-spectrum infrared sauna with full-body medical-grade red-light panel and smart app control, built with Canadian Hemlock.",
    configRaw: "Peak Shasta specifications: exterior 42 W x 40 D x 75 H in; interior 38 W x 36 D x 67 H in; weight 305 lb; electrical 120 V / 15 A / 1,800 W with a standard NEMA 5-15P outlet; construction uses Canadian Hemlock.",
  },
  "peak-everest": {
    source: "peak-everest-product", evidence: "evidence-peak-everest-product", configEvidence: "evidence-peak-everest-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(53, 44, 75), interior: dimension(49, 40, 67), weight: 305, material: ["Canadian Hemlock"], voltage: 120, ratedPower: 2050, current: 20, requiredCircuit: 20, connection: "plug-in", plugType: "NEMA 5-20P", dedicatedCircuit: true,
    productRaw: "Everest 2-Person Full Spectrum Infrared Sauna; indoor infrared sauna with full-body medical-grade red-light panel and smart app control, built with Canadian Hemlock.",
    configRaw: "Peak Everest specifications: exterior 53 W x 44 D x 75 H in; interior 49 W x 40 D x 67 H in; weight 305 lb; electrical 120 V / 20 A / 2,050 W with a dedicated 20 A circuit and NEMA 5-20P; construction uses Canadian Hemlock.",
  },
  "jnh-tosi-1": {
    source: "jnh-tosi-1-product", evidence: "evidence-jnh-tosi-1-product", configEvidence: "evidence-jnh-tosi-1-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1, exterior: dimension(35.5, 35.5, 75), interior: dimension(33, 33, 72), weight: 250, material: ["Canadian Hemlock"], voltage: 120, ratedPower: 1320, current: 15, connection: "plug-in", plugType: "Standard household plug",
    productRaw: "Tosi 1 Person Ultra-Low EMF Full Spectrum Infrared Sauna; indoor full-spectrum infrared cabin built with Canadian Hemlock.",
    configRaw: "JNH Tosi 1-Person specifications: exterior 35.5 W x 35.5 D x 75 H in; interior 33 W x 33 D x 72 H in; weight 250 lb; electrical 120 V / 15 A / 1,320 W with a standard household outlet; construction uses Canadian Hemlock.",
  },
  "jnh-tosi-2": {
    source: "jnh-tosi-2-product", evidence: "evidence-jnh-tosi-2-product", configEvidence: "evidence-jnh-tosi-2-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(47.3, 39.5, 75), interior: dimension(45, 37, 72.5), weight: 330, material: ["Canadian Red Cedar"], voltage: 120, ratedPower: 1540, current: 15, connection: "plug-in", plugType: "Standard household output",
    shippingReason: "The reviewed product page does not state shipping dimensions.",
    productRaw: "Tosi 2 Person Ultra-Low EMF Full Spectrum Infrared Sauna; indoor full-spectrum infrared cabin built with Canadian Red Cedar.",
    configRaw: "JNH Tosi 2-Person specifications: exterior 47.3 W x 39.5 D x 75 H in; electrical 120 V / 15 A; construction uses Canadian Red Cedar. The page does not state complete interior dimensions, shipping dimensions, weight or wattage.",
  },
  "jnh-tosi-4": {
    source: "jnh-tosi-4-product", evidence: "evidence-jnh-tosi-4-product", configEvidence: "evidence-jnh-tosi-4-configuration",
    heat: "infrared", energy: ["electric"], capacity: 4, exterior: dimension(70.9, 47.3, 75), weight: 530, material: ["Canadian Red Cedar"], voltage: 120, ratedPower: 1980, current: 20, requiredCircuit: 20, plugType: "NEMA 5-20R socket", dedicatedCircuit: true,
    interiorReason: "The reviewed product page does not state complete interior dimensions.",
    shippingReason: "The reviewed product page does not state shipping dimensions.",
    productRaw: "Tosi Red 4 Person Ultra-Low EMF Full Spectrum Infrared Sauna; indoor full-spectrum infrared cabin built with Canadian Red Cedar.",
    configRaw: "JNH Tosi Red 4-Person specifications: exterior 70.9 W x 47.3 D x 75 H in; weight 530 lb; electrical 120 V / 20 A / 1,980 W with a dedicated 20 A breaker and NEMA 5-20R socket; construction uses Canadian Red Cedar. The page does not state complete interior or shipping dimensions.",
  },
  "jnh-arki-outdoor-duo": {
    source: "jnh-arki-outdoor-duo-product", evidence: "evidence-jnh-arki-outdoor-duo-product", configEvidence: "evidence-jnh-arki-outdoor-duo-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(55.25, 47.25, 77.5), interior: dimension(45, 37, 72.5), weight: 450, material: ["Aerospace Aluminum", "Hemlock wood"], voltage: 120, ratedPower: 2350, current: 20, requiredCircuit: 20, plugType: "NEMA 5-20P", dedicatedCircuit: true,
    productRaw: "Arki Outdoor Duo 2-Person Full Spectrum Infrared Sauna; all-season outdoor infrared cabin with medical-grade red-light therapy, aerospace aluminum exterior and Hemlock wood interior.",
    configRaw: "JNH Arki Outdoor Duo specifications: exterior 55.25 W x 47.25 D x 77.5 H in; interior 45 W x 37 D x 72.5 H in; weight 450 lb; electrical 120 V / 20 A / 2,350 W with a dedicated 20 A circuit and NEMA 5-20P; aerospace aluminum exterior and Hemlock wood interior.",
  },
  "saunalife-x2": {
    source: "saunalife-x2-product", evidence: "evidence-saunalife-x2-product", configEvidence: "evidence-saunalife-x2-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 2, exterior: dimension(60, 60, 80), shipping: dimension(30, 86, 86), weight: 948, material: ["Nordic Spruce", "Aspen"],
    interiorReason: "The reviewed product page describes the interior bench system but does not state complete interior dimensions.",
    productRaw: "XPERIENCE Series Model X2; outdoor sauna for up to 2 bathers with Nordic Spruce walls and ceiling, Aspen bench and backrest, DIY panel construction and low-voltage LED lighting.",
    configRaw: "SaunaLife X2 specifications: exterior 60 W x 60 D x 80 H in; shipping 63 L x 30 W x 86 H in; weight 948 lb; Nordic Spruce walls and ceiling with Aspen seating. The page presents electric-heater and wood-fired options but does not identify one supplied heater or a single electrical requirement.",
  },
  "saunalife-g2": {
    source: "saunalife-g2-product", evidence: "evidence-saunalife-g2-product", configEvidence: "evidence-saunalife-g2-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 4, exterior: dimension(71.8, 64.2, 86.4), interior: dimension(67.3, 60, 75.5), shipping: dimension(44, 89, 32), weight: 1200, material: ["Nordic Spruce", "Aspen"], ratedPower: 6000, voltage: 240,
    productRaw: "Garden Series Model G2; outdoor sauna for up to 4 bathers with Nordic Spruce wall beams, Aspen benches and an option for a 6 kW electric or wood-fired heater.",
    configRaw: "SaunaLife G2 specifications: exterior 71.8 W x 64.2 D x 86.4 H in with 75.5 in rear height; interior 67.3 W x 60 D x 75.5 H in; shipping 89 L x 44 W x 32 H in; weight 1,200 lb; Nordic Spruce walls and Aspen seating. The 6 kW electric option is listed, but the page does not state a required circuit or amperage.",
  },
  "saunalife-g3": {
    source: "saunalife-g3-product", evidence: "evidence-saunalife-g3-product", configEvidence: "evidence-saunalife-g3-configuration",
    heat: "traditional", energy: ["electric", "wood"], exterior: dimension(95.3, 86.6, 92.1), interior: dimension(91.3, 62.8, 84.7), shipping: dimension(43, 94, 45), weight: 1900, material: ["Thermo-Pine", "Thermo-Aspen"],
    productRaw: "Garden Series Model G3; outdoor sauna cabin with Thermo-Pine exterior and Thermo-Aspen benches, offered with electric or wood-fired heating options.",
    configRaw: "SaunaLife G3 specifications: exterior 95.3 W x 86.6 D x 92.1 H in; interior 91.3 W x 62.8 D x 84.7 H in; shipping 94 L x 43 W x 45 H in; weight 1,900 lb; Thermo-Pine exterior and Thermo-Aspen seating. The reviewed page does not state a capacity or one fixed heater configuration.",
    capacityReason: "The reviewed product page gives cabin dimensions and construction but does not state a seated capacity.",
  },
  "saunalife-g6": {
    source: "saunalife-g6-product", evidence: "evidence-saunalife-g6-product", configEvidence: "evidence-saunalife-g6-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 6, exterior: dimension(82.7, 82.7, 97.9), interior: dimension(82.7, 82.7, 77.8), shipping: dimension(86, 98, 100), weight: 2756, material: ["Painted Thermo-Pine", "Thermo-Aspen"],
    productRaw: "Outdoor Model G6; outdoor sauna for up to 6 bathers with painted Thermo-Pine exterior and Thermo-Aspen interior benches.",
    configRaw: "SaunaLife G6 specifications: exterior approximately 7 ft 10.5 in W x 6 ft 10 11/16 in D x 8 ft 1 29/32 in H; interior approximately 7 ft 10.5 in W x 6 ft 10 11/16 in D x 6 ft 5 25/32 in H; shipping 86 W x 98 D x 100 H in; weight 2,756 lb; painted Thermo-Pine exterior and Thermo-Aspen interior. The page describes electric and wood-fired options without selecting one heater.",
  },
  "saunalife-g11": {
    source: "saunalife-g11-product", evidence: "evidence-saunalife-g11-product", configEvidence: "evidence-saunalife-g11-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 8, shipping: dimension(47, 196, 47), weight: 3196, material: ["Thermo-Spruce", "Thermo-Aspen"],
    exteriorReason: "The reviewed page describes the sauna, changing room and porch dimensions separately rather than publishing one complete exterior envelope.",
    interiorReason: "The reviewed page gives sauna and changing room dimensions but does not state a consolidated interior envelope.",
    productRaw: "Garden Series Model G11; outdoor sauna suite for up to 8 bathers with separate sauna and changing rooms plus a porch, Thermo-Spruce exterior and Thermo-Aspen benches.",
    configRaw: "SaunaLife G11 specifications: sauna room and changing room each 7 ft 7 in L x 6 ft 4 in W x 7 ft 7 in H; porch 1 ft 10 in D x 13 ft 1 in W x 7 ft 7 in H; shipping 196 L x 47 W x 47 H in; weight 3,196 lb. The page does not state one supplied heater or a single electrical requirement.",
  },
  "saunalife-cl3g": {
    source: "saunalife-cl3g-product", evidence: "evidence-saunalife-cl3g-product", configEvidence: "evidence-saunalife-cl3g-configuration",
    heat: "traditional", energy: ["electric"], capacity: 2, exterior: dimension(53.2, 51.2, 81.9), interior: dimension(49.6, 43.2, 75.4), shipping: dimension(43.3, 70.9, 32.3), weight: 990, material: ["Thermo-Spruce", "Thermo-Aspen", "Tempered bronze glass"],
    productRaw: "CUBE Series Model CL3G; compact outdoor sauna for up to 2 bathers with Thermo-Spruce exterior, Thermo-Aspen bench and tempered bronze glass front.",
    configRaw: "SaunaLife CL3G specifications: exterior 53.2 W x 51.2 D x 81.9 H in; interior 49.6 W x 43.2 D x 75.4 H in; shipping 70.9 L x 43.3 W x 32.3 H in; weight 990 lb; Thermo-Spruce, Thermo-Aspen and tempered bronze glass. The page does not state a supplied heater or electrical requirement.",
  },
  "saunalife-e6": {
    source: "saunalife-e6-product", evidence: "evidence-saunalife-e6-product", configEvidence: "evidence-saunalife-e6-configuration",
    heat: "traditional", energy: ["electric"], capacity: 3, shipping: dimension(44, 80, 34), weight: 1103, material: ["Thermo-Spruce", "Thermo-Aspen"],
    exteriorReason: "The reviewed product page gives a barrel diameter of 81 in and length of 59 in, not a complete rectangular envelope.",
    interiorReason: "The reviewed product page gives barrel information but not complete interior width, depth and height dimensions.",
    productRaw: "ERGO Series Model E6; outdoor barrel sauna for up to 3 bathers with an 81 in diameter and 59 in length, Thermo-Spruce staves and Thermo-Aspen benches.",
    configRaw: "SaunaLife E6 specifications: barrel 81 in diameter x 59 in length; shipping 80 L x 44 W x 34 H in; weight 1,103 lb; Thermo-Spruce staves and Thermo-Aspen seating. The page does not state a supplied heater or electrical requirement.",
  },
  "saunalife-e7": {
    source: "saunalife-e7-product", evidence: "evidence-saunalife-e7-product", configEvidence: "evidence-saunalife-e7-configuration",
    heat: "traditional", energy: ["electric"], capacity: 4, shipping: dimension(44, 80, 39), weight: 1213, material: ["Thermo-Spruce", "Thermo-Aspen"],
    exteriorReason: "The reviewed product page gives a barrel diameter of 81 in and length of 71 in, not a complete rectangular envelope.",
    interiorReason: "The reviewed product page gives barrel information but not complete interior width, depth and height dimensions.",
    productRaw: "ERGO Series Model E7; outdoor barrel sauna for up to 4 bathers with an 81 in diameter and 71 in length, Thermo-Spruce staves and Thermo-Aspen benches.",
    configRaw: "SaunaLife E7 specifications: barrel 81 in diameter x 71 in length; shipping 80 L x 44 W x 39 H in; weight 1,213 lb; Thermo-Spruce staves and Thermo-Aspen seating. The page does not state a supplied heater or electrical requirement.",
  },
  "peak-crown": {
    source: "peak-crown-product", evidence: "evidence-peak-crown-product", configEvidence: "evidence-peak-crown-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(48, 44, 79), interior: dimension(42, 38, 71), weight: 385, material: ["Canadian Hemlock"], voltage: 120, ratedPower: 1800, current: 15, connection: "plug-in", plugType: "NEMA 5-15P",
    productRaw: "Peak Crown; 2-person indoor full-spectrum infrared sauna with Canadian Hemlock construction.",
    configRaw: "Peak Crown specifications: exterior 48 W x 44 D x 79 H in; interior 42 W x 38 D x 71 H in; weight 385 lb; electrical 120 V / 15 A / 1,800 W with NEMA 5-15P plug; construction uses Canadian Hemlock.",
  },
  "peak-rainier": {
    source: "peak-rainier-product", evidence: "evidence-peak-rainier-product", configEvidence: "evidence-peak-rainier-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1, exterior: dimension(42, 40, 75), interior: dimension(38, 36, 67), weight: 305, material: ["Canadian Red Cedar"], voltage: 120, ratedPower: 1800, current: 15, connection: "plug-in", plugType: "NEMA 5-15P",
    productRaw: "Peak Rainier; 1-person indoor full-spectrum infrared sauna with Canadian Red Cedar construction.",
    configRaw: "Peak Rainier specifications: exterior 42 W x 40 D x 75 H in; interior 38 W x 36 D x 67 H in; weight 305 lb; electrical 120 V / 15 A / 1,800 W with NEMA 5-15P plug; construction uses Canadian Red Cedar.",
  },
  "peak-matterhorn": {
    source: "peak-matterhorn-product", evidence: "evidence-peak-matterhorn-product", configEvidence: "evidence-peak-matterhorn-configuration",
    heat: "infrared", energy: ["electric"], capacity: 3, exterior: dimension(61, 44, 75), interior: dimension(57, 40, 67), weight: 400, material: ["Canadian Red Cedar"], voltage: 240, ratedPower: 2850, current: 20, requiredCircuit: 20, connection: "plug-in", plugType: "NEMA 6-20P", dedicatedCircuit: true,
    productRaw: "Peak Matterhorn; 3-person indoor near-zero-EMF full-spectrum infrared sauna with Canadian Red Cedar construction.",
    configRaw: "Peak Matterhorn specifications: exterior 61 W x 44 D x 75 H in; interior 57 W x 40 D x 67 H in; weight 400 lb; electrical 240 V / 20 A / 2,850 W with a dedicated 20 A circuit and NEMA 6-20P; construction uses Canadian Red Cedar.",
  },
  "peak-kilimanjaro": {
    source: "peak-kilimanjaro-product", evidence: "evidence-peak-kilimanjaro-product", configEvidence: "evidence-peak-kilimanjaro-configuration",
    heat: "infrared", energy: ["electric"], capacity: 5, exterior: dimension(59, 59, 83), weight: 1031, voltage: 240, ratedPower: 4850, current: 30, requiredCircuit: 30, plugType: "NEMA L6-30P", dedicatedCircuit: true,
    interiorReason: "The reviewed product page publishes exterior dimensions but does not state complete interior dimensions.",
    productRaw: "Peak Kilimanjaro; 5-person indoor near-zero-EMF full-spectrum infrared sauna.",
    configRaw: "Peak Kilimanjaro specifications: exterior 59 W x 59 D x 83 H in; weight 1,031 lb; electrical 240 V / 30 A / 4,850 W with a dedicated 30 A circuit and NEMA L6-30P. The page does not state complete interior dimensions or a confirmed wood species.",
  },
  "peak-el-capitan": {
    source: "peak-el-capitan-product", evidence: "evidence-peak-el-capitan-product", configEvidence: "evidence-peak-el-capitan-configuration",
    heat: "infrared", energy: ["electric"], capacity: 4, exterior: dimension(81, 55, 83), interior: dimension(76, 50, 77), weight: 695, voltage: 240, ratedPower: 5300, current: 30, requiredCircuit: 30, plugType: "NEMA L6-30P", dedicatedCircuit: true,
    productRaw: "Peak El Capitan; 4-person indoor near-zero-EMF full-spectrum infrared sauna.",
    configRaw: "Peak El Capitan specifications: exterior 81 W x 55 D x 83 H in; interior 76 W x 50 D x 77 H in; weight 695 lb; electrical 240 V / 30 A / 5,300 W with a dedicated 30 A circuit and NEMA L6-30P. The page does not state a confirmed wood species.",
  },
  "almost-heaven-hillsboro": {
    source: "almost-heaven-hillsboro-product", evidence: "evidence-almost-heaven-hillsboro-product", configEvidence: "evidence-almost-heaven-hillsboro-configuration",
    heat: "traditional", energy: ["electric"], capacity: 2, exterior: dimension(63, 45.25, 80.3125), interior: dimension(58.25, 39.375, 78), material: ["Spruce"], power: 6000, current: 30, connection: "hardwired", requiredCircuit: 30, dedicatedCircuit: true,
    productRaw: "Hillsboro 2 Person Indoor Sauna; traditional indoor sauna with spruce construction and a 6 kW electric heater.",
    configRaw: "Almost Heaven Hillsboro specifications: assembled 63 W x 45.25 D x 80.3125 H in; interior 58.25 W x 39.375 D x 78 H in; 6 kW / 240 V heater with 30 A hardwire requirement; 110 V / 15 A plug-in lighting. The page does not state shipping dimensions or weight.",
  },
  "almost-heaven-logan": {
    source: "almost-heaven-logan-product", evidence: "evidence-almost-heaven-logan-product", configEvidence: "evidence-almost-heaven-logan-configuration",
    heat: "traditional", energy: ["electric"], capacity: 1, exterior: dimension(53.25, 36, 77.625), interior: dimension(49, 31.75, 76.125), material: ["Spruce", "Cedar option"], power: 6000, current: 30, connection: "hardwired", requiredCircuit: 30, dedicatedCircuit: true,
    productRaw: "Logan 1 Person Indoor Sauna; compact traditional indoor sauna with spruce or cedar finish options and a 6 kW electric heater.",
    configRaw: "Almost Heaven Logan specifications: assembled 53.25 W x 36 D x 77.625 H in; interior 49 W x 31.75 D x 76.125 H in; 6 kW / 240 V heater with 30 A hardwire requirement. The page does not state shipping dimensions or weight.",
  },
  "almost-heaven-rainelle": {
    source: "almost-heaven-rainelle-product", evidence: "evidence-almost-heaven-rainelle-product", configEvidence: "evidence-almost-heaven-rainelle-configuration",
    heat: "traditional", energy: ["electric"], capacity: 4, exterior: dimension(71.5, 62.75, 77.625), interior: dimension(66.75, 58.375, 76.125), material: ["Cedar", "Hemlock"], power: 8000, current: 40, connection: "hardwired", requiredCircuit: 40, dedicatedCircuit: true,
    productRaw: "Rainelle 4 Person Indoor Sauna; traditional indoor sauna with cedar or hemlock options and 6 or 8 kW electric heater variants.",
    configRaw: "Almost Heaven Rainelle specifications: assembled 71.5 W x 62.75 D x 77.625 H in; interior 66.75 W x 58.375 D x 76.125 H in; heater variants 6 or 8 kW at 240 V with 30 or 40 A hardwire requirements. The catalog record uses the 8 kW / 40 A configuration for filtering; variant details remain in the source note.",
  },
  "almost-heaven-bridgeport": {
    source: "almost-heaven-bridgeport-product", evidence: "evidence-almost-heaven-bridgeport-product", configEvidence: "evidence-almost-heaven-bridgeport-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(86, 63, 77.625), interior: dimension(81.25, 58.5, 76.125), material: ["Cedar", "Hemlock"], power: 8000, current: 40, connection: "hardwired", requiredCircuit: 40, dedicatedCircuit: true,
    productRaw: "Bridgeport 6 Person Indoor Sauna; traditional indoor sauna with cedar or hemlock options and hybrid variants.",
    configRaw: "Almost Heaven Bridgeport specifications: assembled 86 W x 63 D x 77.625 H in; interior 81.25 W x 58.5 D x 76.125 H in; 8 kW / 240 V heater with 40 A hardwire requirement. The page does not state shipping dimensions or weight.",
  },
  "almost-heaven-grandview": {
    source: "almost-heaven-grandview-product", evidence: "evidence-almost-heaven-grandview-product", configEvidence: "evidence-almost-heaven-grandview-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(82.375, 94, 85.875), interior: dimension(79.625, 74.25, 79.625), material: ["Cedar", "Hemlock"], power: 9000, current: 45, connection: "hardwired", requiredCircuit: 45, dedicatedCircuit: true,
    productRaw: "Grandview 4-6 Person Canopy Barrel Sauna; outdoor barrel sauna with canopy and seating for up to 6 people.",
    configRaw: "Almost Heaven Grandview specifications: assembled 82.375 W x 94 D x 85.875 H in; interior 79.625 W x 74.25 D x 79.625 H in; heater variants 8 or 9 kW at 240 V with 40 or 45 A hardwire requirements. The catalog record uses the 9 kW / 45 A configuration; the page contains conflicting secondary capacity wording, so the primary comparison label remains up to 6 people.",
  },
  "almost-heaven-titan": {
    source: "almost-heaven-titan-product", evidence: "evidence-almost-heaven-titan-product", configEvidence: "evidence-almost-heaven-titan-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(83.25, 72.25, 79.375), interior: dimension(78.75, 68.75, 75.25), material: ["Cedar", "Hemlock"], power: 9000, current: 45, connection: "hardwired", requiredCircuit: 45, dedicatedCircuit: true,
    productRaw: "Titan 6 Person Indoor Sauna; traditional indoor sauna with cedar or hemlock options and 8 or 9 kW heater variants.",
    configRaw: "Almost Heaven Titan specifications: assembled 83.25 W x 72.25 D x 79.375 H in; interior 78.75 W x 68.75 D x 75.25 H in; heater variants 8 or 9 kW at 240 V with 40 or 45 A hardwire requirements. The catalog record uses the 9 kW / 45 A configuration.",
  },
  "almost-heaven-patterson": {
    source: "almost-heaven-patterson-product", evidence: "evidence-almost-heaven-patterson-product", configEvidence: "evidence-almost-heaven-patterson-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(81.875, 81.875, 80.3125), interior: dimension(77.125, 77.125, 78), material: ["Cedar", "Hemlock"], power: 8000, current: 40, connection: "hardwired", requiredCircuit: 40, dedicatedCircuit: true,
    productRaw: "Patterson 6 Person Indoor Sauna; traditional indoor sauna with cedar or hemlock options and an 8 kW electric heater.",
    configRaw: "Almost Heaven Patterson specifications: assembled 81.875 W x 81.875 D x 80.3125 H in; interior 77.125 W x 77.125 D x 78 H in; 8 kW / 240 V heater with 40 A hardwire requirement; 110 V / 15 A plug-in lighting. The page does not state shipping dimensions or weight.",
  },
  "almost-heaven-lewisburg": {
    source: "almost-heaven-lewisburg-product", evidence: "evidence-almost-heaven-lewisburg-product", configEvidence: "evidence-almost-heaven-lewisburg-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 8, exterior: dimension(82.375, 94, 85.875), interior: dimension(79.625, 86.25, 79.625), material: ["Cedar", "Hemlock"], power: 9000, current: 45, connection: "hardwired", requiredCircuit: 45, dedicatedCircuit: true,
    productRaw: "Lewisburg 6-8 Person Barrel Sauna; outdoor barrel sauna seating up to 8 people with electric heater variants and a wood-burning option.",
    configRaw: "Almost Heaven Lewisburg specifications: assembled 82.375 W x 94 D x 85.875 H in; interior 79.625 W x 86.25 D x 79.625 H in; electric heater variants 8 or 9 kW at 240 V with 40 or 45 A hardwire requirements. The catalog record uses the 9 kW / 45 A electric configuration; the page also lists a wood-burning option.",
  },
  "almost-heaven-grayson": {
    source: "almost-heaven-grayson-product", evidence: "evidence-almost-heaven-grayson-product", configEvidence: "evidence-almost-heaven-grayson-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 4, exterior: dimension(71.5, 71.5, 77.625), interior: dimension(66.75, 67, 76.125), material: ["Cedar", "Hemlock"], power: 8000, current: 40, connection: "hardwired", requiredCircuit: 40, dedicatedCircuit: true,
    productRaw: "Grayson 4 Person Indoor Sauna; traditional indoor sauna with cedar or hemlock options and electric or hybrid heater variants.",
    configRaw: "Almost Heaven Grayson specifications: assembled 71.5 W x 71.5 D x 77.625 H in; interior 66.75 W x 67 D x 76.125 H in; electric heater variants 6 or 8 kW at 240 V with 30 or 40 A hardwire requirements. The catalog record uses the 8 kW / 40 A electric configuration; hybrid options remain noted in the source text.",
  },
  "almost-heaven-charleston": {
    source: "almost-heaven-charleston-product", evidence: "evidence-almost-heaven-charleston-product", configEvidence: "evidence-almost-heaven-charleston-configuration",
    heat: "traditional", energy: ["electric"], capacity: 4, exterior: dimension(78, 94, 75.375), interior: dimension(75.25, 63.375, 69.25), material: ["Cedar", "Hemlock"], power: 8000, current: 40, connection: "hardwired", requiredCircuit: 40, dedicatedCircuit: true,
    productRaw: "Charleston 4 Person Canopy Barrel Sauna; outdoor canopy barrel sauna for up to four people with electric heater variants.",
    configRaw: "Almost Heaven Charleston specifications: assembled 78 W x 94 D x 75.375 H in; interior 75.25 W x 63.375 D x 69.25 H in; heater variants 6 or 8 kW at 240 V with 30 or 40 A hardwire requirements; 110 V / 15 A plug-in lighting. The catalog record uses the 8 kW / 40 A configuration.",
  },
  "almost-heaven-huntington": {
    source: "almost-heaven-huntington-product", evidence: "evidence-almost-heaven-huntington-product", configEvidence: "evidence-almost-heaven-huntington-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(78, 94, 75.375), interior: dimension(75.25, 74.25, 69.25), material: ["Cedar", "Hemlock"], power: 8000, current: 40, connection: "hardwired", requiredCircuit: 40, dedicatedCircuit: true,
    productRaw: "Huntington 4-6 Person Canopy Barrel Sauna; outdoor canopy barrel sauna seating up to six people.",
    configRaw: "Almost Heaven Huntington specifications: assembled 78 W x 94 D x 75.375 H in; interior 75.25 W x 74.25 D x 69.25 H in; heater variants 6 or 8 kW at 240 V with 30 or 40 A hardwire requirements. The catalog record uses the 8 kW / 40 A configuration; primary comparison capacity is up to 6 people.",
  },
  "almost-heaven-madison": {
    source: "almost-heaven-madison-product", evidence: "evidence-almost-heaven-madison-product", configEvidence: "evidence-almost-heaven-madison-configuration",
    heat: "traditional", energy: ["electric"], capacity: 3, exterior: dimension(65, 53, 77.625), interior: dimension(60.25, 48.5, 76.125), material: ["Cedar", "Hemlock"], power: 6000, current: 30, connection: "hardwired", requiredCircuit: 30, dedicatedCircuit: true,
    productRaw: "Madison 2-3 Person Indoor Sauna; compact traditional indoor sauna with electric or hybrid variants.",
    configRaw: "Almost Heaven Madison specifications: assembled 65 W x 53 D x 77.625 H in; interior 60.25 W x 48.5 D x 76.125 H in; 6 kW / 240 V heater with 30 A hardwire requirement. The page does not state shipping dimensions or weight.",
  },
  "sunlighten-mpulse-aspire": {
    source: "sunlighten-mpulse-aspire-product", evidence: "evidence-sunlighten-mpulse-aspire-product", configEvidence: "evidence-sunlighten-mpulse-aspire-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1, exterior: dimension(43.7, 41.7, 78.3), interior: dimension(37.8, 35.8, 71.3), weight: 220, material: ["Basswood", "Eucalyptus option"],
    productRaw: "Sunlighten mPulse Aspire; 1-person infrared sauna with mPulse 3-in-1 heating system and basswood or eucalyptus construction.",
    configRaw: "Sunlighten mPulse Aspire manufacturer specifications: exterior 111 x 106 x 199 cm (approximately 43.7 x 41.7 x 78.3 in); interior 96 x 91 x 181 cm (approximately 37.8 x 35.8 x 71.3 in); basswood version 220 kg; heating system lists FIR, MIR and red/NIR emitters. The cited page is an EU market page, so US voltage and plug details are left unconfirmed.",
  },
  "sunlighten-mpulse-believe": {
    source: "sunlighten-mpulse-believe-product", evidence: "evidence-sunlighten-mpulse-believe-product", configEvidence: "evidence-sunlighten-mpulse-believe-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(51.6, 47.6, 78.3), interior: dimension(46.1, 42.1, 71.3), weight: 252, material: ["Basswood", "Eucalyptus", "Eucalyptus-cedar option"],
    productRaw: "Sunlighten mPulse Believe; 2-person infrared sauna with mPulse 3-in-1 heating system and multiple wood finish options.",
    configRaw: "Sunlighten mPulse Believe manufacturer specifications: exterior 131 x 121 x 199 cm (approximately 51.6 x 47.6 x 78.3 in); interior 117 x 107 x 181 cm (approximately 46.1 x 42.1 x 71.3 in); basswood version 252 kg; heating system lists FIR, MIR and red/NIR emitters. The cited page is an EU market page, so US voltage and plug details are left unconfirmed.",
  },
  "sunlighten-mpulse-conquer": {
    source: "sunlighten-mpulse-conquer-product", evidence: "evidence-sunlighten-mpulse-conquer-product", configEvidence: "evidence-sunlighten-mpulse-conquer-configuration",
    heat: "infrared", energy: ["electric"], capacity: 3, exterior: dimension(70.5, 47.6, 78.3), interior: dimension(65, 42.1, 71.3), weight: 310, material: ["Basswood", "Eucalyptus", "Eucalyptus-cedar option"],
    productRaw: "Sunlighten mPulse Conquer; 3-person infrared sauna with mPulse 3-in-1 heating system and multiple wood finish options.",
    configRaw: "Sunlighten mPulse Conquer manufacturer specifications: exterior 179 x 121 x 199 cm (approximately 70.5 x 47.6 x 78.3 in); interior 165 x 107 x 181 cm (approximately 65 x 42.1 x 71.3 in); basswood version 310 kg; heating system lists FIR, MIR and red/NIR emitters. The cited page is an EU market page, so US voltage and plug details are left unconfirmed.",
  },
  "sunlighten-mpulse-discover": {
    source: "sunlighten-mpulse-discover-product", evidence: "evidence-sunlighten-mpulse-discover-product", configEvidence: "evidence-sunlighten-mpulse-discover-configuration",
    heat: "infrared", energy: ["electric"], capacity: 4, exterior: dimension(70.5, 70.5, 78.3), interior: dimension(65, 65, 71.3), weight: 394, material: ["Basswood", "Eucalyptus", "Eucalyptus-cedar option"],
    productRaw: "Sunlighten mPulse Discover; 4-person infrared sauna with mPulse 3-in-1 heating system and multiple wood finish options.",
    configRaw: "Sunlighten mPulse Discover manufacturer specifications: exterior 179 x 179 x 199 cm (approximately 70.5 x 70.5 x 78.3 in); interior 165 x 165 x 181 cm (approximately 65 x 65 x 71.3 in); basswood version 394 kg; heating system lists FIR, MIR and red/NIR emitters. The cited page is an EU market page, so US voltage and plug details are left unconfirmed.",
  },
  "sunlighten-mpulse-empower": {
    source: "sunlighten-mpulse-empower-product", evidence: "evidence-sunlighten-mpulse-empower-product", configEvidence: "evidence-sunlighten-mpulse-empower-configuration",
    heat: "infrared", energy: ["electric"], capacity: 5, exterior: dimension(85.4, 70.5, 78.3), interior: dimension(79.9, 65, 71.7), weight: 224, material: ["Basswood", "Eucalyptus", "Eucalyptus-cedar option"],
    productRaw: "Sunlighten mPulse Empower; 5-person infrared sauna with mPulse 3-in-1 heating system and multiple wood finish options.",
    configRaw: "Sunlighten mPulse Empower manufacturer specifications: exterior 217 x 179 x 199 cm (approximately 85.4 x 70.5 x 78.3 in); interior 203 x 165 x 182 cm (approximately 79.9 x 65 x 71.7 in); basswood version 224 kg; the listed EU page describes a 120 V / 20 A NEMA 5-20R/5-20P configuration. US catalog publication keeps electrical details market-qualified.",
  },
  "sunlighten-amplify-ii": {
    source: "sunlighten-amplify-ii-product", evidence: "evidence-sunlighten-amplify-ii-product", configEvidence: "evidence-sunlighten-amplify-ii-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(50.8, 46.1, 77.6), interior: dimension(45.3, 39.8, 70.5), weight: 228, material: ["Basswood", "Eucalyptus option"],
    productRaw: "Sunlighten Amplify II; 2-person infrared sauna with FIR and full-spectrum heating elements.",
    configRaw: "Sunlighten Amplify II manufacturer specifications: exterior 129 x 117 x 197 cm (approximately 50.8 x 46.1 x 77.6 in); interior 115 x 101 x 179 cm (approximately 45.3 x 39.8 x 70.5 in); basswood version 228 kg; four FIR and two full-spectrum emitters. The cited page is an EU market page, so US voltage and plug details are left unconfirmed.",
  },
  "sunlighten-amplify-iii": {
    source: "sunlighten-amplify-iii-product", evidence: "evidence-sunlighten-amplify-iii-product", configEvidence: "evidence-sunlighten-amplify-iii-configuration",
    heat: "infrared", energy: ["electric"], capacity: 3, exterior: dimension(62.3, 45.9, 77.7), interior: dimension(56.8, 39.9, 70.3), weight: 546, material: ["Basswood", "Eucalyptus option"],
    productRaw: "Sunlighten Amplify III; 3-person infrared sauna with FIR and full-spectrum heating elements.",
    configRaw: "Sunlighten Amplify III manufacturer specifications: exterior 62.3 x 45.9 x 77.7 in; interior 56.8 x 39.9 x 70.3 in; basswood version 546 lb; five FIR and two full-spectrum emitters. The cited page is an EU market page, so US voltage and plug details are left unconfirmed.",
  },
  "sunlighten-amplify-iv": {
    source: "sunlighten-amplify-iv-product", evidence: "evidence-sunlighten-amplify-iv-product", configEvidence: "evidence-sunlighten-amplify-iv-configuration",
    heat: "infrared", energy: ["electric"],
    capacityReason: "The cited manufacturer range page confirms the Amplify IV model but does not publish a standalone capacity record in the reviewed content.",
    exteriorReason: "An individual Amplify IV product page with complete dimensions was not available in the reviewed manufacturer material.",
    interiorReason: "An individual Amplify IV product page with complete interior dimensions was not available in the reviewed manufacturer material.",
    productRaw: "Sunlighten Amplify IV; model listed in the manufacturer's Amplify range as an infrared sauna.",
    configRaw: "The Sunlighten Amplify range page confirms Amplify IV as a model in the series. Complete capacity, dimensions, weight and US electrical configuration require a model-specific manufacturer sheet before they can be treated as documented.",
  },
  "sunlighten-signature-i": {
    source: "sunlighten-signature-i-product", evidence: "evidence-sunlighten-signature-i-product", configEvidence: "evidence-sunlighten-signature-i-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1, exterior: dimension(37.8, 39.8, 77.6), interior: dimension(32.3, 33.5, 70.5), weight: 180, material: ["Basswood", "Eucalyptus option"],
    productRaw: "Sunlighten Signature I; 1-person infrared sauna with eight FIR emitters.",
    configRaw: "Sunlighten Signature I manufacturer specifications: exterior 96 x 101 x 197 cm (approximately 37.8 x 39.8 x 77.6 in); interior 82 x 85 x 179 cm (approximately 32.3 x 33.5 x 70.5 in); basswood version 180 kg; eight FIR emitters. The cited page is an EU market page, so US voltage and plug details are left unconfirmed.",
  },
  "sun-home-solstice": {
    source: "sun-home-solstice-product", evidence: "evidence-sun-home-solstice-product", configEvidence: "evidence-sun-home-solstice-configuration",
    heat: "infrared", energy: ["electric"], capacity: 4, exterior: dimension(80.9, 56.1, 77.7), weight: 779, material: ["Eucalyptus"], voltage: 240, current: 20, requiredCircuit: 20, connection: "hardwired", dedicatedCircuit: true,
    productRaw: "Sun Home Solstice 4-Person Infrared Sauna; indoor eucalyptus cabin with ten far-infrared heaters and a dedicated electrical supply.",
    configRaw: "Sun Home Solstice specifications: exterior 80.9 W x 56.1 D x 77.7 H in; weight 779 lb; eucalyptus construction; 10 far-infrared heaters; dedicated 240 V / 20 A supply. The manufacturer help material notes that smaller Solstice variants use different 120 V configurations, so this record is explicitly the 4-person variant.",
  },
  "sun-home-equinox": {
    source: "sun-home-equinox-product", evidence: "evidence-sun-home-equinox-product", configEvidence: "evidence-sun-home-equinox-configuration",
    heat: "infrared", energy: ["electric"], capacity: 3, exterior: dimension(62.3, 45.9, 77.7), interior: dimension(56.8, 39.9, 70.3), weight: 546, material: ["Eucalyptus"], voltage: 120, ratedPower: 2250, current: 20, requiredCircuit: 20, connection: "plug-in", plugType: "NEMA 5-20P", dedicatedCircuit: true,
    productRaw: "Sun Home Equinox; indoor eucalyptus infrared sauna offered in 2- and 3-person variants with FIR and full-spectrum heaters.",
    configRaw: "Sun Home Equinox specifications for the 3-person variant: exterior 62.3 W x 45.9 D x 77.7 H in; interior 56.8 W x 39.9 D x 70.3 H in; weight 546 lb; 120 V / 2,250 W / 20 A with dedicated NEMA 5-20P supply. The 2-person variant is separately described by the manufacturer and is not merged into this configuration.",
  },
  "sun-home-eclipse-2": {
    source: "sun-home-eclipse-2-product", evidence: "evidence-sun-home-eclipse-2-product", configEvidence: "evidence-sun-home-eclipse-2-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(51.5, 47.2, 76.7), interior: dimension(42.8, 42.2, 71.5), weight: 600, material: ["Eucalyptus"], voltage: 120, ratedPower: 2820, current: 23.5, requiredCircuit: 30, connection: "plug-in", plugType: "NEMA L5-30P", dedicatedCircuit: true,
    productRaw: "Sun Home Eclipse 2; 2-person indoor infrared sauna with eucalyptus construction and red-light-capable heating system.",
    configRaw: "Sun Home Eclipse 2 specifications: exterior 51.5 W x 47.2 D x 76.7 H in; interior 42.8 W x 42.2 D x 71.5 H in; weight 600 lb; 120 V / 2,820 W / 23.5 A with NEMA L5-30P supply; manufacturer states temperatures up to 165 F.",
  },
  "sun-home-pod": {
    source: "sun-home-pod-product", evidence: "evidence-sun-home-pod-product", configEvidence: "evidence-sun-home-pod-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1, material: ["Canadian Hemlock"],
    exteriorReason: "The reviewed manufacturer guide confirms the one-person indoor Pod but does not publish a complete exterior dimension set.",
    interiorReason: "The reviewed manufacturer guide confirms the one-person indoor Pod but does not publish a complete interior dimension set.",
    productRaw: "Sun Home Pod; one-person indoor infrared sauna with integrated red-light capability and Canadian Hemlock construction.",
    configRaw: "Sun Home's Pod user guide and manufacturer comparison content identify a one-person indoor far-infrared sauna with factory-integrated red light and Canadian Hemlock. Complete dimensions, weight and US electrical specification require a current product sheet.",
  },
  "sun-home-luminar-2": {
    source: "sun-home-luminar-2-product", evidence: "evidence-sun-home-luminar-2-product", configEvidence: "evidence-sun-home-luminar-2-configuration",
    heat: "infrared", energy: ["electric"], capacity: 2, exterior: dimension(57, 51.5, 82.7), interior: dimension(53.4, 47.2, 71.7), weight: 970, material: ["Aluminum", "Canadian Cedar"], voltage: 240, current: 20, requiredCircuit: 20, connection: "hardwired", dedicatedCircuit: true,
    productRaw: "Sun Home Luminar; outdoor infrared sauna with aluminum exterior, Canadian Cedar interior and optional red-light system.",
    configRaw: "Sun Home Luminar 2-person variant specifications: exterior 57 W x 51.5 D x 82.7 H in; interior 53.4 W x 47.2 D x 71.7 H in; weight 970 lb; dedicated 240 V / 20 A supply; aluminum exterior and Canadian Cedar interior. The manufacturer also lists a 5-person variant with a different electrical requirement.",
  },
  "sun-home-nova-3": {
    source: "sun-home-nova-3-product", evidence: "evidence-sun-home-nova-3-product", configEvidence: "evidence-sun-home-nova-3-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 3, material: ["Canadian Cedar"],
    exteriorReason: "The reviewed craftsmanship page confirms Nova 3 construction and heating system but does not publish a complete exterior dimension set.",
    interiorReason: "The reviewed craftsmanship page confirms Nova 3 construction and heating system but does not publish a complete interior dimension set.",
    productRaw: "Sun Home Nova 3; traditional sauna with Canadian Cedar construction and HUUM DROP heater.",
    configRaw: "Sun Home craftsmanship material identifies Nova 3 as a traditional sauna built with Canadian Cedar and fitted with a HUUM DROP heater, with temperatures up to 230 F. Complete dimensions, weight and electrical requirement require the model-specific installation sheet.",
  },
  "sun-home-solaris": {
    source: "sun-home-solaris-product", evidence: "evidence-sun-home-solaris-product", configEvidence: "evidence-sun-home-solaris-configuration",
    heat: "traditional", energy: ["electric"], capacity: 4, exterior: dimension(90.1, 68.9, 94.5), weight: 1697.56, voltage: 240, current: 25, requiredCircuit: 25, connection: "hardwired", dedicatedCircuit: true,
    productRaw: "Sun Home Solaris; traditional outdoor sauna range with 4-person and 6-person variants.",
    configRaw: "Sun Home Solaris help page specifications for the 4-person variant: exterior 90.1 W x 68.9 D x 94.5 H in; weight 1,697.56 lb; 240 V / 25 A hardwired supply. The same manufacturer page lists a larger 4-6-person variant with a 40 A supply; this catalog record is the 4-person configuration.",
  },
  "redwood-cabin-4": {
    source: "redwood-cabin-4-product", evidence: "evidence-redwood-cabin-4-product", configEvidence: "evidence-redwood-cabin-4-configuration",
    heat: "traditional", energy: ["electric"], capacity: 4, material: ["Heat-treated hemlock"],
    productRaw: "Cabin Outdoor Sauna 4 Person; Redwood Outdoors outdoor sauna cabin with two-level seating, gravity venting and configurable heater options.",
    configRaw: "Redwood Outdoors Cabin product page confirms seating for 4 people, heat-treated hemlock construction, two-level seating, gravity venting and selectable heater options. The reviewed page does not provide one fixed electrical configuration or a complete dimension set for this catalog record.",
  },
  "redwood-cove-3": {
    source: "redwood-cove-3-product", evidence: "evidence-redwood-cove-3-product", configEvidence: "evidence-redwood-cove-3-configuration",
    heat: "traditional", energy: ["electric"], capacity: 3, material: ["Heat-treated hemlock"],
    productRaw: "Cove Sauna 3 Person; Redwood Outdoors compact outdoor sauna with gravity venting, FSC material sourcing and configurable heater options.",
    configRaw: "Redwood Outdoors Cove product page confirms seating for 3 people, heat-treated hemlock construction, gravity venting and multiple heater options. The reviewed page does not provide one fixed electrical configuration or a complete dimension set for this catalog record.",
  },
  "redwood-garden-8": {
    source: "redwood-garden-8-product", evidence: "evidence-redwood-garden-8-product", configEvidence: "evidence-redwood-garden-8-configuration",
    heat: "traditional", energy: ["electric"], capacity: 8, material: ["Heat-treated hemlock"], power: 8000, current: 40,
    productRaw: "Garden Outdoor Sauna 8 Person; Redwood Outdoors outdoor sauna with more than 55 square feet, two-level seating and an included 8 kW Harvia KIP electric heater.",
    configRaw: "Redwood Outdoors Garden product page confirms seating for 8 people, more than 55 sq ft of space, heat-treated hemlock, two-level seating, gravity venting and an included 8 kW Harvia KIP heater. The page lists 120 V lighting and 240 V heater service; it does not state a separate required circuit rating.",
  },
  "redwood-grove-8": {
    source: "redwood-grove-8-product", evidence: "evidence-redwood-grove-8-product", configEvidence: "evidence-redwood-grove-8-configuration",
    heat: "traditional", energy: ["electric"], capacity: 8, material: ["Heat-treated hemlock"], power: 6000, current: 30,
    productRaw: "Grove Outdoor Sauna 8 Person; Redwood Outdoors barrier-free outdoor sauna with ramp access, barrier-free door, two-tier benches and movable bench.",
    configRaw: "Redwood Outdoors Grove product page confirms seating for 8 people, heat-treated hemlock construction, a ramp, barrier-free door, two-tier benches and a movable bench. The reviewed page does not state one fixed heater or complete dimensions for this catalog record.",
  },
  "redwood-vista-6": {
    source: "redwood-vista-6-product", evidence: "evidence-redwood-vista-6-product", configEvidence: "evidence-redwood-vista-6-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(71, 72.75, 76.5), weight: 900, material: ["Canadian Thermowood"], power: 6000, current: 30,
    productRaw: "Vista Outdoor Sauna 6 Person; Redwood Outdoors outdoor sauna with Canadian Thermowood construction and configurable Harvia heater options.",
    configRaw: "Redwood Outdoors Vista specifications: seating 4-6 depending on arrangement; exterior 71 L x 72.75 W x 76.5 H in; weight 900 lb; Canadian Thermowood; 120 V lighting and 240 V heater service; 6 kW Harvia KIP heater with upgrade options. The page does not state a separate required circuit rating.",
  },
  "redwood-horizon-6": {
    source: "redwood-horizon-6-product", evidence: "evidence-redwood-horizon-6-product", configEvidence: "evidence-redwood-horizon-6-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(72.75, 92.5, 76.5), material: ["Heat-treated hemlock"], power: 6000, current: 30,
    productRaw: "Horizon Outdoor Sauna with Porch 6 Person; Redwood Outdoors outdoor sauna with a built-on porch, heat-treated hemlock and configurable heater options.",
    configRaw: "Redwood Outdoors Horizon product page: seating capacity 4-6; exterior dimensions 92.5 L x 72.75 W x 76.5 H in; listed weight 1,150 lb; specifications label the wood Canadian Thermowood, while the product description and material section identify it as heat-treated hemlock; 120 V lighting and 240 V heater service; included 6 kW Harvia KIP option at 240 V and 30 A. The page does not identify 30 A as a required circuit or breaker rating.",
  },
  "redwood-duo-2": {
    source: "redwood-duo-2-product", evidence: "evidence-redwood-duo-2-product", configEvidence: "evidence-redwood-duo-2-configuration",
    heat: "traditional", energy: ["electric"], capacity: 2, material: ["Heat-treated hemlock"],
    productRaw: "Duo Outdoor Sauna 2 Person; Redwood Outdoors compact outdoor sauna for two people with traditional two-level seating and configurable heater options.",
    configRaw: "Redwood Outdoors Duo listing confirms a two-person outdoor sauna, heat-treated hemlock construction and configurable electric heater options. Complete dimensions, weight and one fixed electrical configuration were not stated in the reviewed listing.",
  },
  "redwood-summit-6": {
    source: "redwood-summit-6-product", evidence: "evidence-redwood-summit-6-product", configEvidence: "evidence-redwood-summit-6-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(82, 69.5, 82.75), material: ["Heat-treated hemlock"], power: 6000, current: 30,
    productRaw: "Summit Outdoor Sauna 6 Person; Redwood Outdoors outdoor sauna with traditional two-level seating and configurable heater options.",
    configRaw: "Redwood Outdoors Summit product page: seating capacity 6; exterior dimensions 69.5 L x 82 W x 82.75 H in; listed weight 1,100 lb; specifications label the wood Canadian Thermowood, while the product description and material section identify it as heat-treated hemlock; 120 V lighting and 240 V heater service; included 6 kW Harvia KIP option at 240 V and 30 A. The page does not identify 30 A as a required circuit or breaker rating.",
  },
  "redwood-barrel-6": {
    source: "redwood-barrel-6-product", evidence: "evidence-redwood-barrel-6-product", configEvidence: "evidence-redwood-barrel-6-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(71, 72.75, 76.5), weight: 900, material: ["Heat-treated hemlock"], power: 6000, current: 30,
    productRaw: "Barrel Outdoor Sauna 6 Person; Redwood Outdoors barrel sauna with heat-treated hemlock, two-level seating and a 6 kW Harvia KIP heater with upgrade options.",
    configRaw: "Redwood Outdoors Barrel 6 specifications: seating 4-6 depending on arrangement; exterior 71 L x 72.75 W x 76.5 H in; weight 900 lb; heat-treated hemlock; 120 V lighting and 240 V heater service; included 6 kW Harvia KIP heater. The page does not state a separate required circuit rating.",
  },
  "redwood-barrel-porch-6": {
    source: "redwood-barrel-porch-6-product", evidence: "evidence-redwood-barrel-porch-6-product", configEvidence: "evidence-redwood-barrel-porch-6-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, material: ["Heat-treated hemlock"], power: 6000, current: 30,
    productRaw: "Barrel Outdoor Sauna with Porch 6 Person; Redwood Outdoors barrel sauna with built-on porch, heat-treated hemlock and a 6 kW Harvia KIP heater with upgrade options.",
    configRaw: "Redwood Outdoors Barrel with Porch listing confirms seating for up to 6 people, a built-on porch, heat-treated hemlock and a 6 kW Harvia KIP heater with upgrades. The reviewed listing does not state complete dimensions, weight or a separate required circuit rating.",
  },
  "redwood-extra-wide-6": {
    source: "redwood-extra-wide-6-product", evidence: "evidence-redwood-extra-wide-6-product", configEvidence: "evidence-redwood-extra-wide-6-configuration",
    heat: "traditional", energy: ["electric"], capacity: 6, exterior: dimension(71.75, 84.75, 88.5), weight: 1245, material: ["Canadian Thermowood"], power: 6000, current: 30,
    productRaw: "Extra-Wide Barrel Sauna 6 Person; Redwood Outdoors seven-foot-diameter barrel sauna with two-level seating, Canadian Thermowood and included 6 kW Harvia KIP heater.",
    configRaw: "Redwood Outdoors Extra-Wide 6 specifications: seating 4-6 depending on arrangement; exterior 71.75 L x 84.75 W x 88.5 H in; weight 1,245 lb; Canadian Thermowood; 120 V lighting and 240 V heater service; included 6 kW Harvia KIP with upgrade options. The page does not state a separate required circuit rating.",
  },
  "thermory-luik-kodiak": {
    source: "thermory-luik-kodiak-product", evidence: "evidence-thermory-luik-kodiak-product", configEvidence: "evidence-thermory-luik-kodiak-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 6, interior: dimension(75.24, 76.92, 77.4), material: ["Kodiak Spruce"],
    productRaw: "Thermory Luik Kodiak; premium outdoor sauna in Kodiak Spruce for approximately 4-6 bathers.",
    configRaw: "Thermory catalog specifications: occupancy 4-6; sauna length 7.34 ft; interior approximately 6.27 L x 6.41 W x 6.45 H ft; volume approximately 260 cu ft; Kodiak Spruce construction. The catalog does not state one selected heater or US electrical requirement.",
  },
  "thermory-luik-ash": {
    source: "thermory-luik-ash-product", evidence: "evidence-thermory-luik-ash-product", configEvidence: "evidence-thermory-luik-ash-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 6, interior: dimension(75.24, 76.92, 77.4), material: ["Benchmark Ash"],
    productRaw: "Thermory Luik Ash; premium outdoor sauna in Benchmark Ash for approximately 4-6 bathers.",
    configRaw: "Thermory catalog specifications: occupancy 4-6; sauna length 7.34 ft; interior approximately 6.27 L x 6.41 W x 6.45 H ft; volume approximately 260 cu ft; Benchmark Ash construction. The catalog does not state one selected heater or US electrical requirement.",
  },
  "thermory-traditional-mod6": {
    source: "thermory-traditional-mod6-product", evidence: "evidence-thermory-traditional-mod6-product", configEvidence: "evidence-thermory-traditional-mod6-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 8, interior: dimension(89.76, 65.76, 87.24), material: ["Kodiak Spruce", "Nordic Spruce"],
    productRaw: "Thermory Traditional Mod6; traditional modular outdoor sauna for approximately 6-8 bathers with Kodiak and Nordic Spruce materials.",
    configRaw: "Thermory Traditional Mod6 specifications: occupancy 6-8; overall length 8.25 ft; interior approximately 7.48 L x 5.48 W x 7.27 H ft; Kodiak Spruce exterior and Nordic Spruce interior/benches. The page does not state one selected heater or US electrical requirement.",
  },
  "thermory-modern-mod6": {
    source: "thermory-modern-mod6-product", evidence: "evidence-thermory-modern-mod6-product", configEvidence: "evidence-thermory-modern-mod6-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 8, interior: dimension(89.76, 65.76, 87.24), material: ["Ignite Spruce", "Thermo-Alder"],
    productRaw: "Thermory Modern Mod6; modern modular outdoor sauna for approximately 6-8 bathers with Ignite Spruce and Thermo-Alder materials.",
    configRaw: "Thermory Modern Mod6 specifications: occupancy 6-8; overall length 8.25 ft; interior approximately 7.48 L x 5.48 W x 7.27 H ft; Ignite Spruce exterior and Thermo-Alder interior/benches. The page does not state one selected heater or US electrical requirement.",
  },
  "thermory-mod4-traditional": {
    source: "thermory-mod4-traditional-product", evidence: "evidence-thermory-mod4-traditional-product", configEvidence: "evidence-thermory-mod4-traditional-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 6, exterior: dimension(67.2, 78, 95.28), material: ["Kodiak Spruce", "Nordic Spruce"],
    productRaw: "Thermory Traditional Mod4; modular outdoor sauna for approximately 4-6 bathers with Kodiak Spruce and Nordic Spruce materials.",
    configRaw: "Thermory Traditional Mod4 specifications: occupancy 4-6; catalog dimensions approximately 5.6 L x 6.5 W x 7.94 H ft; volume approximately 233 cu ft; Kodiak Spruce exterior and Nordic Spruce interior/benches. The page does not state one selected heater or US electrical requirement.",
  },
  "thermory-mod4-modern": {
    source: "thermory-mod4-modern-product", evidence: "evidence-thermory-mod4-modern-product", configEvidence: "evidence-thermory-mod4-modern-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 6, exterior: dimension(67.2, 78, 95.28), material: ["Ignite Spruce", "Thermo-Alder"],
    productRaw: "Thermory Modern Mod4; modular outdoor sauna for approximately 4-6 bathers with Ignite Spruce and Thermo-Alder materials.",
    configRaw: "Thermory Modern Mod4 specifications: occupancy 4-6; catalog dimensions approximately 5.6 L x 6.5 W x 7.94 H ft; volume approximately 233 cu ft; Ignite Spruce exterior and Thermo-Alder interior/benches. The page does not state one selected heater or US electrical requirement.",
  },
  "thermory-sauna-square": {
    source: "thermory-sauna-square-product", evidence: "evidence-thermory-sauna-square-product", configEvidence: "evidence-thermory-sauna-square-configuration",
    heat: "traditional", energy: ["electric", "wood"], capacity: 6, interior: dimension(95.64, 79.68, 83.4), material: ["Thermory wood", "Tempered glass"],
    productRaw: "Thermory Sauna Square; full-glass-front outdoor sauna with tiered bench and occupancy range up to 6 bathers.",
    configRaw: "Thermory Sauna Square catalog specifications: occupancy 1-6; interior approximately 7.97 L x 6.64 W x 6.95 H ft; volume approximately 241 cu ft; full tempered-glass front and tiered bench. The catalog does not state one selected heater or US electrical requirement.",
  },
  "thermory-natural-barrel": {
    source: "thermory-natural-barrel-product", evidence: "evidence-thermory-natural-barrel-product", configEvidence: "evidence-thermory-natural-barrel-configuration",
    heat: "traditional", energy: ["electric", "wood"], material: ["Thermory wood"],
    capacityReason: "The reviewed range material gives a barrel occupancy range rather than one fixed capacity for this catalog record.",
    exteriorReason: "The reviewed range material gives length and diameter ranges rather than one fixed exterior envelope.",
    productRaw: "Thermory Natural Barrel; outdoor barrel sauna range with model-dependent seating and dimensions.",
    configRaw: "Thermory range specifications list Natural Barrel variants with model-dependent occupancy, approximately 4.88-7.33 ft total length, 6.29-7.25 ft interior diameter, 124.3-265 cu ft volume and 3.94-6.5 ft bench length. A single variant sheet is required for fixed comparison values.",
  },
  "thermory-ignite-barrel": {
    source: "thermory-ignite-barrel-product", evidence: "evidence-thermory-ignite-barrel-product", configEvidence: "evidence-thermory-ignite-barrel-configuration",
    heat: "traditional", energy: ["electric", "wood"], material: ["Ignite Spruce", "Thermo-Alder"],
    capacityReason: "The reviewed range material gives a barrel occupancy range rather than one fixed capacity for this catalog record.",
    exteriorReason: "The reviewed range material gives length and diameter ranges rather than one fixed exterior envelope.",
    productRaw: "Thermory Ignite Barrel; outdoor barrel sauna range with model-dependent seating and dimensions.",
    configRaw: "Thermory range specifications list Ignite Barrel variants with model-dependent occupancy, approximately 4.88-7.33 ft total length, 6.29-7.25 ft interior diameter, 124.3-265 cu ft volume and 3.94-6.5 ft bench length. A single variant sheet is required for fixed comparison values.",
  },
  "redwood-electric-heater": {
    source: "redwood-electric-heater-product", evidence: "evidence-redwood-electric-heater-product", configEvidence: "evidence-redwood-electric-heater-configuration",
    heat: "traditional", energy: ["electric"],
    productRaw: "Redwood Outdoors electric sauna heater; heater option used with compatible Redwood Outdoors sauna kits.",
    configRaw: "Redwood Outdoors manufacturer material identifies electric heater options for compatible sauna kits. Exact heater model, output, voltage and circuit depend on the selected sauna package and require the package-specific heater listing.",
  },
  "redwood-heater-fence": {
    source: "redwood-heater-fence-product", evidence: "evidence-redwood-heater-fence-product", configEvidence: "evidence-redwood-heater-fence-configuration",
    productRaw: "Redwood Outdoors sauna heater fence; accessory intended to provide a protective barrier around a compatible sauna heater.",
    configRaw: "Redwood Outdoors accessory material identifies the heater fence as a safety accessory for compatible electric sauna heaters. Dimensions and compatible heater SKUs require the selected accessory listing.",
  },
  "redwood-lighting": {
    source: "redwood-lighting-product", evidence: "evidence-redwood-lighting-product", configEvidence: "evidence-redwood-lighting-configuration",
    productRaw: "Redwood Outdoors sauna lighting accessory; lighting component for compatible sauna kits.",
    configRaw: "Redwood Outdoors accessory material identifies sauna lighting as an accessory for compatible kits. Voltage, dimensions and installation details require the selected lighting listing.",
  },
  "redwood-bench-extender": {
    source: "redwood-bench-extender-product", evidence: "evidence-redwood-bench-extender-product", configEvidence: "evidence-redwood-bench-extender-configuration",
    productRaw: "Redwood Outdoors sauna bench extender; accessory that adds usable bench depth or seating flexibility to compatible sauna benches.",
    configRaw: "Redwood Outdoors accessory material identifies the bench extender as a seating accessory. Exact dimensions and compatible bench models require the selected accessory listing.",
  },
  "redwood-roof-shingles": {
    source: "redwood-roof-shingles-product", evidence: "evidence-redwood-roof-shingles-product", configEvidence: "evidence-redwood-roof-shingles-configuration",
    productRaw: "Redwood Outdoors roof shingles; exterior roofing accessory for compatible outdoor sauna kits.",
    configRaw: "Redwood Outdoors accessory material identifies roof shingles as an outdoor-sauna roofing component. Coverage, package size and compatibility require the selected accessory listing.",
  },
  "redwood-privacy-screen": {
    source: "redwood-privacy-screen-product", evidence: "evidence-redwood-privacy-screen-product", configEvidence: "evidence-redwood-privacy-screen-configuration",
    productRaw: "Redwood Outdoors privacy screen; outdoor accessory for adding visual separation around a compatible sauna installation.",
    configRaw: "Redwood Outdoors accessory material identifies the privacy screen as an outdoor installation accessory. Dimensions and compatible sauna models require the selected accessory listing.",
  },
  "redwood-outdoor-shower": {
    source: "redwood-outdoor-shower-product", evidence: "evidence-redwood-outdoor-shower-product", configEvidence: "evidence-redwood-outdoor-shower-configuration",
    productRaw: "Redwood Outdoors outdoor shower; cooling and rinse accessory for an outdoor sauna area.",
    configRaw: "Redwood Outdoors accessory material identifies the outdoor shower as a cooling/rinse accessory for sauna installations. Plumbing requirements, dimensions and mounting details require the selected accessory listing.",
  },
  "sunlighten-solo-system": {
    source: "sunlighten-solo-system-product", evidence: "evidence-sunlighten-solo-system-product", configEvidence: "evidence-sunlighten-solo-system-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1,
    productRaw: "Sunlighten Solo System; portable infrared sauna system using SoloCarbon panels with chromotherapy lighting.",
    configRaw: "Sunlighten Solo System manufacturer page confirms a portable infrared design, SoloCarbon panels and chromotherapy lighting. The page does not state a fixed cabin dimension set, weight or US electrical configuration for this catalog record.",
  },
  "sunlighten-solo-rise": {
    source: "sunlighten-solo-rise-product", evidence: "evidence-sunlighten-solo-rise-product", configEvidence: "evidence-sunlighten-solo-rise-configuration",
    heat: "infrared", energy: ["electric"], capacity: 1,
    productRaw: "Sunlighten Solo Rise; portable infrared sauna variant in the Solo range.",
    configRaw: "Sunlighten manufacturer material confirms Solo Rise as a Solo portable infrared variant. A model-specific page with fixed dimensions, weight and US electrical details is required before those fields can be documented.",
  },
  "sunlighten-luminir-panel": {
    source: "sunlighten-luminir-panel-product", evidence: "evidence-sunlighten-luminir-panel-product", configEvidence: "evidence-sunlighten-luminir-panel-configuration",
    heat: "infrared", energy: ["electric"],
    productRaw: "Sunlighten LuminIR panel; infrared heating technology component used in compatible Sunlighten sauna systems.",
    configRaw: "Sunlighten heating-technology material confirms the LuminIR panel as a component technology. Standalone dimensions, wattage, voltage and compatibility are not stated on the reviewed technology page and remain unknown.",
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
  else if (facts.capacityReason) configuration.capacity.seated = unknown(facts.capacityReason);
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
  if (facts.requiredCircuit) requirement.required_circuit_a = documented(facts.requiredCircuit, configEvidence);
  if (facts.connection) requirement.connection = documented(facts.connection, configEvidence);
  if (facts.plugType) requirement.plug_type = documented(facts.plugType, configEvidence);
  if (typeof facts.dedicatedCircuit === "boolean") requirement.dedicated_circuit = documented(facts.dedicatedCircuit, configEvidence);
  for (const key of ["manufacturer_sku", "dimensions", "net_weight", "shipping_weight", "materials"]) {
    if (key === "dimensions" || key === "net_weight" || key === "materials") continue;
    if (configuration[key]?.status === "documented") configuration[key].evidence_ids = Array.from(new Set([...(configuration[key].evidence_ids ?? []), configEvidence]));
  }

  const scrubLegacySourceLanguage = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) scrubLegacySourceLanguage(item);
      return;
    }
    for (const [key, entry] of Object.entries(value)) {
      if (key === "reason" && typeof entry === "string") {
        value[key] = entry
          .replace(/the checked collection page/gi, "the reviewed individual product page")
          .replace(/the collection page/gi, "the reviewed individual product page")
          .replace(/require the individual product page/gi, "require an additional manufacturer document");
      } else scrubLegacySourceLanguage(entry);
    }
  };
  scrubLegacySourceLanguage(product);
  scrubLegacySourceLanguage(configuration);
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
