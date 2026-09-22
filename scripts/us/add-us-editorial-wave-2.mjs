import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const load = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const save = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");

// Each entry is written for the exact model and source record. Shared fields are
// presentation primitives; the decision angle, evidence and limitations remain
// product-specific so these pages do not become interchangeable catalog copy.
const entries = [
  {
    product_id: "redwood-horizon-6",
    eyebrow: "Four-to-six-person outdoor sauna with porch",
    heading: "Horizon makes the porch part of the footprint decision",
    summary: "Redwood Outdoors Horizon seats four to six and measures 72.75 × 92.5 × 76.5 inches, with a documented 240 V, 6 kW and 30 A heater entry.",
    paragraphs: [
      "Horizon is not simply a barrel with a decorative step. Its documented 92.5-inch depth includes a porch-oriented layout that affects the base, approach and usable space in front of the sauna. The 72.75-inch width, four-to-six-person capacity and heat-treated Hemlock construction belong to this exact model.",
      "The source records a 6 kW heater option at 240 volts and 30 amps. Those figures establish the model's electrical scale, while the final circuit, outdoor disconnect, working clearances and foundation still depend on the installation documents and the chosen site.",
    ],
    decision_points: [
      "Reserve the full 92.5-inch documented depth before adding an access path or service space.",
      "Heat-treated Hemlock is the recorded construction material.",
      "The heater entry is 6 kW at 240 volts and 30 amps for this configuration.",
    ],
    limitations: [
      "Interior and shipping dimensions are not complete in the normalized record.",
      "Porch access, drainage, foundation and electrical installation require separate planning.",
    ],
    source_ids: ["redwood-horizon-6-product"],
  },
  {
    product_id: "redwood-summit-6",
    eyebrow: "Six-person rectangular outdoor sauna",
    heading: "Summit uses width where Horizon uses porch depth",
    summary: "Redwood Outdoors Summit is a six-person traditional outdoor kit measuring 82 × 69.5 × 82.75 inches with a documented 240 V, 6 kW and 30 A heater entry.",
    paragraphs: [
      "Summit's 82-inch width makes it a different site-planning proposition from the longer porch models. Its 69.5-inch depth may suit a shallower location, but the cabinet dimensions still exclude the route to the door, construction access and the manufacturer's surrounding clearances.",
      "Heat-treated Hemlock is documented for the cabin. Redwood lists a 6 kW heater entry at 240 volts and 30 amps, enough to compare the electrical class with other kits without assuming a finished outdoor branch circuit.",
    ],
    decision_points: [
      "The 82-inch width is the first constraint for a narrow side yard or terrace.",
      "The rectangular plan is shallower than the porch-equipped Redwood records in this cohort.",
      "The documented electrical entry is 240 V, 6 kW and 30 A.",
    ],
    limitations: [
      "The reviewed record does not provide complete interior or delivery dimensions.",
      "Roof exposure, base construction and wiring are not resolved by the exterior measurements.",
    ],
    source_ids: ["redwood-summit-6-product"],
  },
  {
    product_id: "redwood-extra-wide-porch-6",
    eyebrow: "Extra-wide six-person barrel with porch",
    heading: "Extra-Wide with Porch needs room in all three directions",
    summary: "This Redwood Outdoors six-person barrel kit measures 84.75 × 92.5 × 88.5 inches and carries a documented 240 V, 6 kW and 30 A heater entry.",
    paragraphs: [
      "The name is reflected in the measurements. At 84.75 inches wide and 88.5 inches high, this is not just the standard barrel extended by a porch. The full 92.5-inch depth also matters for the base and approach, while Canadian heat-treated Hemlock is the documented material.",
      "A 6 kW heater entry is recorded at 240 volts and 30 amps. The catalog does not turn that rating into a circuit design, and the porch, curved roof and delivery path still need to be evaluated around the actual location.",
    ],
    decision_points: [
      "Check the 88.5-inch height where eaves, branches or a shelter limit overhead space.",
      "The 84.75-inch width distinguishes this model from Redwood's standard barrels.",
      "The recorded heater class is 6 kW, 240 V and 30 A.",
    ],
    limitations: [
      "Complete interior, packaging and model-clearance data are not in the normalized record.",
      "The porch and outdoor foundation require more space than the sauna room alone.",
    ],
    source_ids: ["redwood-extra-wide-porch-6-product"],
  },
  {
    product_id: "redwood-barrel-8",
    eyebrow: "Eight-person outdoor barrel kit",
    heading: "Barrel 8 raises the heater class without widening the shell",
    summary: "Redwood Outdoors Barrel 8 is an eight-person traditional kit measuring 72.75 × 92.5 × 76.5 inches with a documented 240 V, 8 kW and 40 A heater entry.",
    paragraphs: [
      "The documented width remains 72.75 inches, while the 92.5-inch depth carries the longer eight-person arrangement. Canadian Thermowood is listed for the cabin. Capacity is a manufacturer figure and does not describe bench length, personal space or the working area outside the barrel.",
      "Its heater entry rises to 8 kW at 240 volts and 40 amps. That is the practical difference when comparing the model with Redwood's six-person 6 kW barrels, but installation details still require the selected heater documentation.",
    ],
    decision_points: [
      "The 92.5-inch depth, rather than the familiar barrel width, drives the site plan.",
      "Canadian Thermowood is documented for the exact eight-person model.",
      "The electrical record is 8 kW at 240 volts and 40 amps.",
    ],
    limitations: [
      "Interior bench dimensions and shipping measurements are not complete in the record.",
      "Eight-person capacity should not be read as a comfort guarantee for every group.",
    ],
    source_ids: ["redwood-barrel-8-product"],
  },
  {
    product_id: "redwood-noctra-8",
    eyebrow: "Black-stained eight-person outdoor sauna",
    heading: "Noctra 8 combines a tall rectangular envelope with an 8 kW heater",
    summary: "Redwood Outdoors Noctra 8 measures 75.5 × 89.75 × 85.75 inches and has a documented 240 V, 8 kW and 40 A heater entry.",
    paragraphs: [
      "Noctra's 85.75-inch height and 89.75-inch depth create a different envelope from Redwood's lower barrel models. The source identifies heat-treated Hemlock with a black stain, which describes the documented finish but not a maintenance schedule for a particular climate.",
      "The eight-person configuration carries an 8 kW heater entry at 240 volts and 40 amps. The model page establishes those comparison values; the final base, weather exposure, cable route and local electrical requirements remain site work.",
    ],
    decision_points: [
      "The 85.75-inch height needs to be checked against any cover or roof overhang.",
      "Black-stained heat-treated Hemlock is the documented material treatment.",
      "The exact configuration records an 8 kW, 240 V, 40 A heater entry.",
    ],
    limitations: [
      "The normalized record does not include complete interior or packaged dimensions.",
      "Finish durability and maintenance frequency depend on exposure and manufacturer care guidance.",
    ],
    source_ids: ["redwood-noctra-8-product"],
  },
  {
    product_id: "finnleo-is565-infrasauna-9805-0840",
    eyebrow: "Five-person indoor hybrid cabin",
    heading: "IS565 puts infrared and traditional heat in one 74-inch-wide cabin",
    summary: "Finnleo IS565 InfraSauna is a five-person indoor hybrid cabin measuring 73.75 × 61.75 × 80 inches with a documented 240 V, 6 kW and 30 A supply.",
    paragraphs: [
      "IS565 is the hybrid entry in this cohort. Its Hemlock interior and exterior, five-person capacity and 73.75-inch width are documented for the exact model rather than inferred from the broader InfraSauna range. The 80-inch cabinet height still leaves ceiling and service clearances to be checked.",
      "The source records a 240-volt, 6 kW and 30-amp electrical requirement. Because a hybrid cabin contains more than one heating mode, the installation manual and supplied control package remain authoritative for connection and operating details.",
    ],
    decision_points: [
      "The 73.75 × 61.75 inch footprint suits a different room than the narrower NorthStar cabins.",
      "Both infrared and traditional heat are documented for IS565.",
      "The electrical entry is 240 V, 6 kW and 30 A for the exact configuration.",
    ],
    limitations: [
      "Complete interior, shipping and minimum-clearance dimensions are not normalized.",
      "The catalog does not describe simultaneous-mode operation or replace Finnleo's electrical instructions.",
    ],
    source_ids: ["source-finnleo-is565-infrasauna-9805-0840-product"],
  },
  {
    product_id: "finnleo-northstar-indoor-sauna-4-x-6-9630-2263",
    eyebrow: "Two-person 4 × 6 indoor sauna",
    heading: "NorthStar 4 × 6 uses a 48-inch depth and a 4.5 kW heater",
    summary: "Finnleo NorthStar 4 × 6 is a two-person indoor traditional cabin measuring 72 × 48 × 84 inches with a documented 240 V, 4.5 kW and 30 A heater entry.",
    paragraphs: [
      "The 4 × 6 name maps to a six-foot width and four-foot depth in the documented exterior measurements. Nordic White Spruce is listed for the interior and exterior, with clear Abachi or Aspen used for benches and backrests.",
      "This smaller NorthStar uses a 4.5 kW heater entry at 240 volts and 30 amps. Its current rating matches the larger 5 × 6 model in the catalog, so room size and heater output should be compared together rather than by amperage alone.",
    ],
    decision_points: [
      "The 48-inch depth is the defining space advantage of this NorthStar size.",
      "Two-person capacity is documented for the exact 4 × 6 cabin.",
      "The heater entry is 4.5 kW at 240 V and 30 A.",
    ],
    limitations: [
      "The record does not state complete interior or shipping dimensions.",
      "The 4 × 6 label is a model size, not a substitute for installation clearances.",
    ],
    source_ids: ["source-finnleo-northstar-indoor-sauna-4-x-6-9630-2263-product"],
  },
  {
    product_id: "finnleo-northstar-indoor-sauna-5-x-6-9630-2264",
    eyebrow: "Two-person 5 × 6 indoor sauna",
    heading: "NorthStar 5 × 6 adds a foot of depth and moves to 6 kW",
    summary: "Finnleo NorthStar 5 × 6 measures 72 × 60 × 84 inches, seats two and has a documented 240 V, 6 kW and 30 A heater entry.",
    paragraphs: [
      "Compared with the 4 × 6 model, this cabin keeps the 72-inch width and 84-inch height but increases depth from 48 to 60 inches. The additional foot changes the room footprint even though the documented seated capacity remains two.",
      "Nordic White Spruce and clear Aspen or Abachi benches are listed for the construction. The heater record rises to 6 kW at 240 volts and 30 amps, which is a model-specific value rather than a NorthStar family assumption.",
    ],
    decision_points: [
      "The extra 12 inches of depth are the main layout difference from NorthStar 4 × 6.",
      "Capacity remains two people in the reviewed model record.",
      "The documented heater output is 6 kW at 240 V and 30 A.",
    ],
    limitations: [
      "Interior measurements and the complete access envelope are not in the normalized record.",
      "Bench comfort and room fit cannot be judged from the capacity label alone.",
    ],
    source_ids: ["source-finnleo-northstar-indoor-sauna-5-x-6-9630-2264-product"],
  },
  {
    product_id: "finnleo-northstar-indoor-sauna-5-x-7-9630-2265",
    eyebrow: "Four-to-five-person 5 × 7 indoor sauna",
    heading: "NorthStar 5 × 7 turns the longer wall into usable capacity",
    summary: "Finnleo NorthStar 5 × 7 is a four-to-five-person indoor cabin measuring 84 × 60 × 84 inches with a documented 240 V, 6 kW and 30 A heater entry.",
    paragraphs: [
      "The 84-inch width distinguishes this model from the narrower 5 × 6 while the 60-inch depth remains the same. Finnleo documents a four-to-five-person range, Nordic White Spruce surfaces and clear Abachi or Aspen benches and backrests for the exact cabin.",
      "The heater entry remains 6 kW at 240 volts and 30 amps. That makes the larger seating claim particularly dependent on the documented cabin layout and heater selection, not on simply scaling the smaller NorthStar description.",
    ],
    decision_points: [
      "The seven-foot width needs a broader wall and delivery route than the 5 × 6 model.",
      "Finnleo states a four-to-five-person range; the catalog stores five only as the documented upper bound for filtering.",
      "Its normalized heater record is 6 kW, 240 V and 30 A.",
    ],
    limitations: [
      "Interior bench dimensions and minimum clearances are not complete in the record.",
      "The upper bound of five does not establish the same comfort level for every group or session.",
    ],
    source_ids: ["source-finnleo-northstar-indoor-sauna-5-x-7-9630-2265-product"],
  },
  {
    product_id: "sunray-bristow",
    eyebrow: "Two-person outdoor wet/dry cabin",
    heading: "Bristow is compact on the ground and unusually tall",
    summary: "SunRay Bristow is a two-person outdoor traditional sauna measuring 50 × 50 × 98 inches with a 220 V, 4.5 kW and 30 A hardwired heater entry.",
    paragraphs: [
      "The square 50-inch footprint is compact, but the documented 98-inch exterior height makes overhead clearance a central planning question. Inside, SunRay lists 45 × 45 × 73 inches. Canadian Hemlock and a metal roof are the recorded materials.",
      "A 4.5 kW Harvia heater is included in the normalized configuration, with a hardwired 220-volt, 30-amp supply. Chromotherapy lighting and a Bluetooth speaker system are also documented, though none of these features resolves the outdoor base or cable route.",
    ],
    decision_points: [
      "Check the 98-inch exterior height before treating Bristow as a compact outdoor model.",
      "The interior narrows to 45 × 45 inches for the documented two-person capacity.",
      "The included heater entry is hardwired at 220 V, 4.5 kW and 30 A.",
    ],
    limitations: [
      "Shipping dimensions and site-specific minimum clearances are not stated.",
      "The catalog does not verify a foundation, weather exposure or local electrical installation.",
    ],
    source_ids: ["source-sunray-bristow-product"],
  },
  {
    product_id: "sunray-aurora",
    eyebrow: "Two-to-four-person cedar barrel sauna",
    heading: "Aurora's roof and floor kit make it more than a bare barrel shell",
    summary: "SunRay Aurora is a two-to-four-person traditional barrel sauna measuring 72 × 61 × 76 inches with a 220 V, 6 kW and 30 A hardwired heater entry.",
    paragraphs: [
      "Aurora's 72-inch width and 61-inch depth enclose a documented 69 × 51 × 69-inch interior. Western Red Cedar, tempered glass and stainless-steel hardware are listed, along with a flat floor kit and shingled roof in the normalized configuration.",
      "The included Harvia heater is recorded at 6 kW with stones and a hardwired 220-volt, 30-amp supply. The source permits indoor or outdoor placement, but those two settings have different base, moisture and clearance questions that the shared dimensions cannot answer.",
    ],
    decision_points: [
      "The documented capacity is a two-to-four-person range, not a fixed comfort claim.",
      "A floor kit and shingled roof are included in the reviewed configuration.",
      "The heater entry is hardwired at 220 V, 6 kW and 30 A.",
    ],
    limitations: [
      "Indoor and outdoor use require different site checks despite sharing one product record.",
      "Complete shipping and installation-clearance data are not normalized.",
    ],
    source_ids: ["source-sunray-aurora-product"],
  },
  {
    product_id: "salus-ally",
    eyebrow: "Two-person cedar indoor sauna",
    heading: "Ally's one-piece front wall affects the route into the room",
    summary: "Salus Ally is a two-person indoor traditional sauna measuring 60 × 46 × 83 inches with a 240 V, 6 kW and 30 A hardwired heater entry.",
    paragraphs: [
      "The cabinet dimensions are only part of Ally's fit question. Salus states that the 59.1-inch-wide by 78-inch-high front wall arrives as one piece and cannot be disassembled. Doorways, stairs and turns on the delivery route can therefore rule out a room that would otherwise hold the assembled 60 × 46-inch footprint.",
      "Pacific Clear Cedar is listed outside and Red Cedar for the benches. The included Harvia KIP 6 kW stove requires a hardwired 220/240-volt, 30-amp connection; touchscreen, FM and Bluetooth controls are also documented.",
    ],
    decision_points: [
      "Measure the delivery route for the one-piece front wall, not only the finished sauna location.",
      "The interior is documented at 56 × 38 × 78 inches for two people.",
      "The included 6 kW heater is hardwired at 240 V and 30 A in the normalized record.",
    ],
    limitations: [
      "The current manufacturer page marks the product unavailable, so availability must be rechecked.",
      "A licensed electrician and the supplied heater instructions govern the connection.",
    ],
    source_ids: ["source-salus-ally-product"],
  },
  {
    product_id: "tylo-lulea-4",
    eyebrow: "Three-to-four-person outdoor hemlock cabin",
    heading: "Lulea 4's roof is wider than its 86-inch foundation",
    summary: "Tylo Lulea 4 seats three to four and has an 86 × 61 × 94-inch foundation with a documented 240 V, 8 kW and 35 A heater entry.",
    paragraphs: [
      "The foundation dimensions do not describe the widest part of Lulea 4. Tylo's source also records an 85 × 102-inch roof, so a fence line, wall or cover must be checked against the overhang rather than the 86-inch cabin width alone. Clear Hemlock and tinted tempered glass are documented.",
      "A Sense Bliss 8 heater, Bliss controls and app support are included in the configuration record. The electrical figures are 240 volts, 8 kW and 35 amps; the normalized source does not state the final connection method.",
    ],
    decision_points: [
      "Plan around the 102-inch roof width, not only the 86-inch foundation width.",
      "Clear Hemlock and tinted tempered glass define the documented material set.",
      "The heater entry is 8 kW at 240 V and 35 A.",
    ],
    limitations: [
      "Interior dimensions and the connection method are not stated in the normalized record.",
      "Roof load, base design and weather exposure require the current Tylo installation documents.",
    ],
    source_ids: ["source-tylo-lulea-4-product"],
  },
  {
    product_id: "geyser-hekla",
    eyebrow: "Two-to-three-person traditional cabin",
    heading: "Hekla is traditional in its base configuration; infrared is an add-on",
    summary: "GeyserSteam Hekla measures 57 × 55 × 83 inches, seats two to three and has a documented 220 V, 6 kW and 30 A traditional heater entry.",
    paragraphs: [
      "The current product title mentions traditional and infrared heat, but the specification table describes a Finnish dry sauna with a 6 kW lava-rock heater. GeyserSteam presents infrared panels and red light as additional options with separate power needs, so this catalog record classifies the reviewed base configuration as traditional.",
      "Scandinavian Thermowood, tempered glass and an aluminum frame are documented for indoor or outdoor use. The compact 57 × 55-inch footprint does not include the site base, door approach or any electrical demand created by optional add-ons.",
    ],
    decision_points: [
      "Compare the included traditional heater separately from optional infrared and red-light packages.",
      "The exact page documents a two-to-three-person capacity and two-level benches.",
      "The base heater entry is 220 V, 6 kW and 30 A; the connection method is not stated.",
    ],
    limitations: [
      "Optional infrared panels require additional power that is not included in the base electrical record.",
      "Interior, shipping and minimum-clearance dimensions are not fully documented.",
    ],
    source_ids: ["source-geyser-hekla-product"],
  },
  {
    product_id: "geyser-lukaku",
    eyebrow: "Six-to-eight-person traditional cabin",
    heading: "Lukaku's 13.5 kW heater sets a different electrical scale",
    summary: "GeyserSteam Lukaku is an indoor/outdoor traditional sauna measuring 86 × 87 × 86 inches with a documented 240 V, 13.5 kW and 65 A heater entry.",
    paragraphs: [
      "Lukaku is documented for six to eight people in an almost square exterior envelope. Thermowood and tempered glass are listed, together with a 13.5 kW Vevor heater. The page offers infrared as an add-on rather than showing it as part of the reviewed base equipment.",
      "The 240-volt, 65-amp electrical service is substantially above the smaller cabins in this cohort and needs early site review. The catalog preserves the manufacturer's published figure, while conductor sizing, protection and code compliance remain professional electrical work.",
    ],
    decision_points: [
      "The 86 × 87-inch footprint needs a broad base before external working space is added.",
      "Infrared is optional and is not counted as included in the base configuration.",
      "The traditional heater entry is 13.5 kW at 240 V and 65 A.",
    ],
    limitations: [
      "The manufacturer page does not provide complete interior or shipping dimensions.",
      "The published 65 A figure must be checked against the current installation documentation before purchase.",
    ],
    source_ids: ["source-geyser-lukaku-product"],
  },
  {
    product_id: "geyser-valera",
    eyebrow: "Four-to-five-person traditional cabin",
    heading: "Valera shortens the depth while retaining a 9 kW heater",
    summary: "GeyserSteam Valera measures 86 × 60 × 86 inches, seats four to five and has a documented 220 V, 9 kW and 40 A traditional heater entry.",
    paragraphs: [
      "Valera keeps the 86-inch width and height seen in larger GeyserSteam cabins but reduces the documented depth to 60 inches. Thermowood and tempered glass are recorded, with a floor kit and LED lighting included in the normalized configuration.",
      "The base equipment uses a 9 kW Vevor heater at 220 volts and 40 amps. Infrared and red-light systems are listed as optional add-ons, so their equipment and power requirements are not silently folded into the traditional configuration.",
    ],
    decision_points: [
      "The 60-inch depth is Valera's main footprint difference from the larger Lukaku shell.",
      "Four-to-five-person capacity is the current manufacturer range.",
      "The base heater entry is 220 V, 9 kW and 40 A; the connection method is not stated.",
    ],
    limitations: [
      "Optional infrared and red-light equipment would change the technical plan.",
      "Interior dimensions, shipping size and minimum clearances remain open.",
    ],
    source_ids: ["source-geyser-valera-product"],
  },
  {
    product_id: "geyser-balerion",
    eyebrow: "Six-to-eight-person full-spectrum infrared cabin",
    heading: "Balerion is the infrared counterpart to GeyserSteam's large traditional cabin",
    summary: "GeyserSteam Balerion is an indoor/outdoor infrared sauna measuring 86 × 87 × 86 inches with a documented 240 V, 5 kW and 30 A supply.",
    paragraphs: [
      "Balerion shares the broad 86 × 87-inch exterior envelope used by the large GeyserSteam cabin format, but its heating system is different. Full-spectrum infrared panels and rods are included, with Thermowood, tempered glass, ventilation openings and two-level benches documented on the current product page.",
      "The infrared system is listed at 5,000 watts on 240 volts with a 30-amp breaker. The manufacturer's live page identifies the model as Balerion even though its older Shopify URL still contains another handle; this record follows the current page identity and specifications.",
    ],
    decision_points: [
      "Balerion is an infrared model and should not inherit the 13.5 kW traditional-heater data from Lukaku.",
      "The current capacity range is six to eight people.",
      "The included infrared system is recorded at 240 V, 5 kW and 30 A.",
    ],
    limitations: [
      "The reviewed page does not state complete interior or delivery dimensions.",
      "The retained legacy URL handle is not evidence of a second model or configuration.",
    ],
    source_ids: ["source-geyser-balerion-product"],
  },
];

const document = await load("content/us/product-editorial.json");
const existingByProductId = new Map(document.entries.map((entry) => [entry.product_id, entry]));
for (const entry of entries) {
  existingByProductId.set(entry.product_id, {
    id: `${entry.product_id}-editorial`,
    status: "published",
    ...entry,
  });
}
document.entries = [...existingByProductId.values()];
await save("content/us/product-editorial.json", document);
console.log(`Prepared ${entries.length} source-bound editorial records; product publication statuses remain candidates.`);
