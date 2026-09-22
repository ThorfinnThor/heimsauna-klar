import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const load = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const save = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");

const entries = [
  {
    product_id: "peak-rainier",
    eyebrow: "One-person indoor infrared cabin",
    heading: "Rainier keeps a full-spectrum cabin within a 42-inch width",
    summary: "Peak Rainier is a one-person indoor infrared cabin measuring 42 × 40 × 75 inches with a documented 120 V, 1,800 W and 15 A supply.",
    paragraphs: [
      "Rainier is the narrowest of the four Peak records in this wave. Its 42-inch exterior width and 40-inch depth describe the cabinet itself, while the listed 75-inch height still needs to be checked against the room, access route and ventilation plan.",
      "The source record identifies Canadian Red Cedar and a 120-volt, 1,800-watt infrared system rated at 15 amps with a NEMA 5-15P plug. That gives a clear electrical starting point without turning the product page into an installation approval.",
    ],
    decision_points: [
      "The 42-inch width is the useful comparison value for a compact indoor location.",
      "Canadian Red Cedar is the documented cabinet material.",
      "The 15-amp plug-in supply is recorded for this model rather than inferred from another Peak cabin.",
    ],
    limitations: [
      "The reviewed product record does not state shipping dimensions or complete minimum clearances.",
      "A local electrical check and the manufacturer's installation instructions remain necessary.",
    ],
    source_ids: ["peak-rainier-product"],
  },
  {
    product_id: "peak-matterhorn",
    eyebrow: "Three-person indoor infrared cabin",
    heading: "Matterhorn adds capacity and a 240-volt planning question",
    summary: "Peak Matterhorn seats three in a 61 × 44 × 75-inch indoor infrared cabin with a documented 240 V, 2,850 W and 20 A supply.",
    paragraphs: [
      "Matterhorn moves beyond the compact one- and two-seat cabins in the Peak set. The 61-inch width and 44-inch depth describe the exterior cabinet, which leaves the surrounding room, door movement and service access to be planned separately.",
      "Peak lists Canadian Red Cedar and a 240-volt, 2,850-watt infrared system rated at 20 amps with a NEMA 6-20P plug. The voltage and current values belong to this three-person configuration and should not be substituted with the smaller models' 120-volt entries.",
    ],
    decision_points: [
      "The 61-inch width marks a different room layout from Rainier and the smaller Peak cabins.",
      "Three seats are documented for the exact Matterhorn configuration.",
      "The 240-volt, 20-amp connection is the main electrical distinction in this group.",
    ],
    limitations: [
      "The source does not provide a complete delivery or clearance schedule.",
      "The page compares documented facts and does not certify a receptacle or circuit installation.",
    ],
    source_ids: ["peak-matterhorn-product"],
  },
  {
    product_id: "peak-kilimanjaro",
    eyebrow: "Five-person outdoor infrared cabin",
    heading: "Kilimanjaro is an outdoor cabin with a square 59-inch footprint",
    summary: "Peak Kilimanjaro is a five-person outdoor infrared cabin measuring 59 × 59 × 83 inches with a documented 240 V, 4,850 W and 30 A supply.",
    paragraphs: [
      "Kilimanjaro has the square exterior footprint that often simplifies orientation, but the 59-inch cabinet dimensions do not describe the complete outdoor site. A base, weather exposure, access route and the manufacturer's working clearances still need to be checked.",
      "The record lists aerospace-grade aluminum and Canadian Hemlock, plus a 240-volt, 4,850-watt infrared system rated at 30 amps with a NEMA L6-30P plug. Its five-person capacity is tied to this outdoor model and is not a family-level estimate.",
    ],
    decision_points: [
      "The square 59 × 59 inch footprint is the first placement constraint.",
      "Aerospace-grade aluminum and Canadian Hemlock are both documented in the construction record.",
      "The 30-amp, 240-volt supply needs an outdoor-rated installation review.",
    ],
    limitations: [
      "The reviewed source does not state complete interior dimensions or a foundation specification.",
      "Outdoor placement, weather protection and local electrical work are not covered by the catalog entry.",
    ],
    source_ids: ["peak-kilimanjaro-product"],
  },
  {
    product_id: "peak-el-capitan",
    eyebrow: "Four-person outdoor infrared cabin",
    heading: "El Capitan needs a wider outdoor envelope than the compact Peak cabins",
    summary: "Peak El Capitan seats four in an 81 × 55 × 83-inch outdoor infrared cabin with a documented 240 V, 5,300 W and 30 A supply.",
    paragraphs: [
      "El Capitan is the widest Peak cabin in this wave. Its 81-inch exterior width and 55-inch depth describe a four-person outdoor cabinet, so the usable site must also account for a base, access, door movement and the space needed around the enclosure.",
      "The documented construction combines aerospace-grade aluminum with Canadian Hemlock. Peak lists 5,300 watts at 240 volts and 30 amps with a NEMA L6-30P plug. Those values are useful for comparing the model with Kilimanjaro, but they do not replace the installation instructions.",
    ],
    decision_points: [
      "The 81-inch width is the dominant layout value for a four-person outdoor location.",
      "The material record distinguishes the aluminum exterior from the Hemlock interior.",
      "The electrical entry is 240 volts and 30 amps for this exact cabin.",
    ],
    limitations: [
      "The reviewed page does not state a complete outdoor foundation or clearance plan.",
      "No delivery, assembly or local-code approval is implied by the comparison record.",
    ],
    source_ids: ["peak-el-capitan-product"],
  },
  {
    product_id: "almost-heaven-hillsboro",
    eyebrow: "Two-person indoor traditional kit",
    heading: "Hillsboro uses a compact indoor footprint with a 6 kW heater entry",
    summary: "Almost Heaven Hillsboro is a two-person indoor sauna kit measuring 63 × 45.25 × 80.3125 inches, with a documented 240 V, 6 kW and 30 A heater supply.",
    paragraphs: [
      "Hillsboro is sized for two people and keeps its exterior width to 63 inches. The source lists spruce and an interior height of 78 inches, useful figures for checking the room before the kit is considered a fit.",
      "The model record documents a traditional heater supply of 6 kW at 240 volts and 30 amps. It does not describe that electrical value as a plug-in connection, so wiring, controls, ventilation and the manufacturer's clearances remain part of the installation work.",
    ],
    decision_points: [
      "The 63-inch width and 45.25-inch depth define the cabinet footprint.",
      "Spruce is the documented material in the reviewed record.",
      "The 6 kW, 240-volt and 30-amp values apply to the heater entry for Hillsboro.",
    ],
    limitations: [
      "The catalog does not state shipping dimensions or a complete clearance schedule.",
      "A sauna kit's cabinet dimensions do not include the full working and service area.",
    ],
    source_ids: ["almost-heaven-hillsboro-product"],
  },
  {
    product_id: "almost-heaven-pinnacle",
    eyebrow: "Four-person outdoor barrel kit",
    heading: "Pinnacle trades a compact room for a 78-inch barrel width",
    summary: "Almost Heaven Pinnacle is a four-person outdoor barrel sauna kit measuring 78 × 71 × 81.5 inches with a documented 240 V, 6 kW and 30 A heater supply.",
    paragraphs: [
      "Pinnacle's barrel form gives the four-person kit a 78-inch exterior width and 71-inch depth. The listed interior dimensions are smaller than the assembled envelope, which is why a garden plan needs room for the base, entry and maintenance access as well.",
      "The source record lists Rustic Red Cedar and Onyx options and a 6 kW traditional heater at 240 volts and 30 amps. A required circuit value is not stated in the normalized record, so the rated current should not be treated as a complete wiring instruction.",
    ],
    decision_points: [
      "The 78-inch width and barrel depth are more useful for placement than the four-person label alone.",
      "Rustic Red Cedar and Onyx are the documented finish or material options.",
      "The 30-amp rated heater entry is recorded, while the required circuit remains open.",
    ],
    limitations: [
      "The reviewed page does not state shipping dimensions or a full foundation and clearance plan.",
      "Outdoor weather protection and electrical work need model instructions and local review.",
    ],
    source_ids: ["almost-heaven-pinnacle-product"],
  },
  {
    product_id: "almost-heaven-logan",
    eyebrow: "One-person indoor traditional kit",
    heading: "Logan is the smallest indoor Almost Heaven kit in this wave",
    summary: "Almost Heaven Logan is a one-person indoor sauna kit measuring 53.25 × 36 × 77.625 inches with a documented 240 V, 6 kW and 30 A heater supply.",
    paragraphs: [
      "Logan places one person in a 53.25-inch-wide indoor kit with a 36-inch exterior depth. The source records spruce with a cedar option and an interior height just over 76 inches, so ceiling height and the approach to the door deserve attention before assembly.",
      "Its traditional heater entry is documented at 6 kW, 240 volts and 30 amps. The record separates the heater's electrical values from the cabinet dimensions and does not infer a plug or dedicated circuit where the source is silent.",
    ],
    decision_points: [
      "The 53.25-inch width makes Logan the compact indoor kit in this Almost Heaven group.",
      "Spruce and a cedar option are recorded for the construction.",
      "The 6 kW heater entry is documented at 240 volts and 30 amps.",
    ],
    limitations: [
      "Shipping dimensions and minimum clearances are not stated in the reviewed record.",
      "The catalog cannot confirm whether a specific room or circuit meets local requirements.",
    ],
    source_ids: ["almost-heaven-logan-product"],
  },
  {
    product_id: "almost-heaven-princeton",
    eyebrow: "Six-person outdoor barrel kit",
    heading: "Princeton stretches to a 94-inch outdoor depth",
    summary: "Almost Heaven Princeton is a six-person outdoor barrel sauna kit measuring 78 × 94 × 75.375 inches with a documented 240 V, 8 kW and 40 A heater supply.",
    paragraphs: [
      "Princeton has a 94-inch exterior depth, making it one of the longer outdoor kits in this group. The four-person label is not appropriate here: the source documents seating for six and a 75.25 by 86.375 inch interior room.",
      "The traditional heater entry is listed at 8 kW, 240 volts and 40 amps. Rustic Red Cedar and Onyx appear in the source record. A separate required-circuit value is not documented, so the electrical comparison stops at the published figures.",
    ],
    decision_points: [
      "The 94-inch depth is the key constraint for a garden or terrace layout.",
      "Six-person capacity and the barrel interior are documented for Princeton itself.",
      "The heater record shows 8 kW at 240 volts and 40 amps.",
    ],
    limitations: [
      "The source does not give shipping dimensions or the full outdoor foundation envelope.",
      "The page does not substitute for the heater and assembly instructions.",
    ],
    source_ids: ["almost-heaven-princeton-product"],
  },
  {
    product_id: "almost-heaven-rainelle",
    eyebrow: "Four-person indoor traditional kit",
    heading: "Rainelle is a broad indoor kit with a 40-amp heater entry",
    summary: "Almost Heaven Rainelle seats four in a 71.5 × 62.75 × 77.625-inch indoor kit with a documented 240 V, 8 kW and 40 A heater supply.",
    paragraphs: [
      "Rainelle uses a 71.5-inch exterior width and 62.75-inch depth to create a four-person indoor room. The source lists a 66.75 by 58.375 inch interior and cedar or Hemlock construction, so the usable room is not the same as the assembled footprint.",
      "The documented traditional heater entry is 8 kW at 240 volts and 40 amps. Because the source does not give a plug type or another connection detail, this page keeps the electrical field descriptive rather than turning it into wiring advice.",
    ],
    decision_points: [
      "The exterior width and depth should be checked against the room before kit assembly.",
      "Cedar and Hemlock are the documented construction options.",
      "The 8 kW, 240-volt and 40-amp heater values belong to Rainelle.",
    ],
    limitations: [
      "Shipping dimensions and access requirements are not part of the reviewed source record.",
      "Clearances and electrical compliance still depend on the installation documents and local rules.",
    ],
    source_ids: ["almost-heaven-rainelle-product"],
  },
  {
    product_id: "almost-heaven-audra",
    eyebrow: "Two-to-four-person outdoor barrel kit",
    heading: "Audra keeps the barrel footprint short while leaving the canopy outside the room",
    summary: "Almost Heaven Audra is a two-to-four-person outdoor barrel kit measuring 78 × 71 × 75.375 inches with a documented 240 V, 6 kW and 30 A heater supply.",
    paragraphs: [
      "Audra is documented for two to four people and uses the same 78 by 71 inch assembled envelope as several Almost Heaven barrel formats, but its canopy changes the way the entry and weather-protection area are used. The interior depth is 51.25 inches.",
      "The record lists Rustic Red Cedar and Onyx options with a traditional heater entry of 6 kW at 240 volts and 30 amps. No required-circuit value is stated in the normalized source, so the rating remains a comparison fact rather than a complete installation instruction.",
    ],
    decision_points: [
      "The two-to-four-person range is documented for Audra and should not be flattened to one number.",
      "The canopy affects the usable outdoor access zone beyond the barrel dimensions.",
      "The heater entry is 6 kW at 240 volts and 30 amps.",
    ],
    limitations: [
      "The reviewed record does not state shipping dimensions or canopy clearances.",
      "A base, weather protection and local electrical review remain open planning items.",
    ],
    source_ids: ["almost-heaven-audra-product"],
  },
  {
    product_id: "almost-heaven-bridgeport",
    eyebrow: "Six-person indoor traditional kit",
    heading: "Bridgeport needs an 86-inch-wide indoor room envelope",
    summary: "Almost Heaven Bridgeport is a six-person indoor sauna kit measuring 86 × 63 × 77.625 inches with a documented 240 V, 8 kW and 40 A heater supply.",
    paragraphs: [
      "Bridgeport is one of the widest indoor kits in this wave. The 86-inch exterior width and 63-inch depth enclose a documented 81.25 by 58.5 inch interior, with the remaining room reserved for assembly, access and ventilation rather than seating alone.",
      "The source lists cedar and Hemlock construction and an 8 kW traditional heater at 240 volts and 40 amps. It does not state a plug or a different connection method, so those details remain open in the catalog.",
    ],
    decision_points: [
      "The 86-inch width is the decisive placement check for Bridgeport.",
      "Six seats are documented, with cedar and Hemlock listed for the kit.",
      "The 8 kW heater entry is recorded at 240 volts and 40 amps.",
    ],
    limitations: [
      "The source does not document shipping dimensions or a complete clearance schedule.",
      "The product entry does not certify the room, wiring or ventilation arrangement.",
    ],
    source_ids: ["almost-heaven-bridgeport-product"],
  },
  {
    product_id: "almost-heaven-grandview",
    eyebrow: "Four-to-six-person canopy barrel kit",
    heading: "Grandview combines a canopy entry with a 9 kW heater record",
    summary: "Almost Heaven Grandview is a four-to-six-person outdoor canopy barrel kit measuring 82.375 × 94 × 85.875 inches with a 240 V, 9 kW and 45 A heater entry.",
    paragraphs: [
      "Grandview is documented for four to six people and reaches 94 inches in exterior depth. Its canopy and 85.875-inch height make the site envelope larger than the bathing room alone, especially where a roof, access path or maintenance side is needed.",
      "Cedar and Hemlock are listed in the construction record. The traditional heater entry is 9 kW at 240 volts and 45 amps, with the current record also carrying the 79.625 by 74.25 inch interior dimensions.",
    ],
    decision_points: [
      "The four-to-six-person range is preserved because the source does not reduce it to a single capacity.",
      "The canopy and 94-inch depth affect the outdoor plan beyond the cabin room.",
      "The 9 kW and 45-amp heater values are specific to Grandview.",
    ],
    limitations: [
      "Shipping dimensions and complete canopy clearances are not stated in the reviewed record.",
      "Outdoor foundation, weather protection and electrical work require separate confirmation.",
    ],
    source_ids: ["almost-heaven-grandview-product"],
  },
  {
    product_id: "almost-heaven-titan",
    eyebrow: "Six-person indoor traditional kit",
    heading: "Titan is a deep indoor kit with a 9 kW heater entry",
    summary: "Almost Heaven Titan seats six in an 83.25 × 72.25 × 79.375-inch indoor kit with a documented 240 V, 9 kW and 45 A heater supply.",
    paragraphs: [
      "Titan uses an 83.25-inch exterior width and 72.25-inch depth for a six-person indoor room. The interior measures 78.75 by 68.75 inches, while cedar and Hemlock are the documented construction options.",
      "The traditional heater record lists 9 kW at 240 volts and 45 amps. That figure is useful when comparing Titan with the smaller 6 and 8 kW kits, but the product page does not state a plug or override the installation manual.",
    ],
    decision_points: [
      "The 83.25-inch width and 72.25-inch depth require a substantial indoor footprint.",
      "Six-person capacity and cedar or Hemlock construction are tied to Titan.",
      "The 9 kW, 240-volt, 45-amp entry is model-specific.",
    ],
    limitations: [
      "Shipping dimensions and minimum clearances are not documented in the catalog record.",
      "Room fit and electrical compliance still need the supplied documentation and a local check.",
    ],
    source_ids: ["almost-heaven-titan-product"],
  },
  {
    product_id: "almost-heaven-patterson",
    eyebrow: "Six-person indoor traditional kit",
    heading: "Patterson uses a nearly square indoor footprint",
    summary: "Almost Heaven Patterson is a six-person indoor sauna kit measuring 81.875 × 81.875 × 80.3125 inches with a documented 240 V, 8 kW and 40 A heater supply.",
    paragraphs: [
      "Patterson's equal 81.875-inch width and depth make it the square-footprint option in this indoor group. The interior is also nearly square at 77.125 by 77.125 inches, which changes how benches, the door and service access compete for space.",
      "The source lists cedar and Hemlock and an 8 kW traditional heater at 240 volts and 40 amps. It does not publish a plug type or a separate circuit instruction in the normalized record.",
    ],
    decision_points: [
      "The equal width and depth make room geometry more important than a single side measurement.",
      "Six seats, cedar and Hemlock are documented for Patterson.",
      "The heater entry is 8 kW at 240 volts and 40 amps.",
    ],
    limitations: [
      "The reviewed source does not state shipping dimensions or complete working clearances.",
      "The catalog does not determine whether a specific room or electrical panel is suitable.",
    ],
    source_ids: ["almost-heaven-patterson-product"],
  },
  {
    product_id: "almost-heaven-lewisburg",
    eyebrow: "Six-to-eight-person outdoor barrel kit",
    heading: "Lewisburg is the largest capacity range in this Almost Heaven wave",
    summary: "Almost Heaven Lewisburg is a six-to-eight-person outdoor barrel kit measuring 82.375 × 94 × 85.875 inches with a documented 240 V, 9 kW and 45 A heater supply.",
    paragraphs: [
      "Lewisburg carries a six-to-eight-person range and a 94-inch exterior depth. The listed interior depth is 86.25 inches, so the barrel needs a generous outdoor plan even before the base, entry path and maintenance space are added.",
      "Cedar and Hemlock are documented in the construction record. Its traditional heater entry is 9 kW at 240 volts and 45 amps. The catalog keeps the range and the electrical values separate from any assumption about how the site will be wired.",
    ],
    decision_points: [
      "The capacity range is retained because the source documents six to eight users.",
      "The 94-inch depth is the main outdoor placement constraint.",
      "The heater record shows 9 kW at 240 volts and 45 amps.",
    ],
    limitations: [
      "Shipping dimensions, foundation requirements and complete clearances are not stated here.",
      "Outdoor assembly and electrical work require the model instructions and local review.",
    ],
    source_ids: ["almost-heaven-lewisburg-product"],
  },
  {
    product_id: "almost-heaven-grayson",
    eyebrow: "Four-person indoor traditional kit",
    heading: "Grayson fits a square 71.5-inch indoor cabinet footprint",
    summary: "Almost Heaven Grayson seats four in a 71.5 × 71.5 × 77.625-inch indoor kit with a documented 240 V, 8 kW and 40 A heater supply.",
    paragraphs: [
      "Grayson uses the same 71.5-inch width and depth, creating a square indoor footprint for four people. The source lists a 66.75 by 67 inch interior and cedar or Hemlock construction, leaving a clear distinction between cabinet size and usable room.",
      "The traditional heater entry is documented at 8 kW, 240 volts and 40 amps. No plug type or alternate connection is stated in the current record, so the page keeps those fields open instead of borrowing details from another kit.",
    ],
    decision_points: [
      "The square footprint makes the room's door and bench arrangement especially relevant.",
      "Cedar and Hemlock are both recorded for the kit.",
      "The 8 kW heater value is paired with a documented 240-volt, 40-amp supply.",
    ],
    limitations: [
      "The source does not state shipping dimensions or minimum installation clearances.",
      "A four-person label does not determine the required working or ventilation area.",
    ],
    source_ids: ["almost-heaven-grayson-product"],
  },
  {
    product_id: "almost-heaven-charleston",
    eyebrow: "Four-person outdoor canopy barrel kit",
    heading: "Charleston combines a canopy with a 94-inch outdoor depth",
    summary: "Almost Heaven Charleston is a four-person outdoor canopy barrel kit measuring 78 × 94 × 75.375 inches with a documented 240 V, 8 kW and 40 A heater supply.",
    paragraphs: [
      "Charleston's 78-inch width and 94-inch depth describe a four-person outdoor barrel with a canopy. The canopy changes the approach to the entrance and the protected space around it, while the interior depth is listed at 63.375 inches.",
      "The record documents cedar and Hemlock construction and an 8 kW traditional heater at 240 volts and 40 amps. A separate required-circuit value is not stated, so the electrical section remains deliberately limited to the documented facts.",
    ],
    decision_points: [
      "The canopy and 94-inch depth need to be included in the garden layout.",
      "Four-person seating and the cedar or Hemlock options belong to Charleston's record.",
      "The heater entry is 8 kW at 240 volts and 40 amps.",
    ],
    limitations: [
      "Shipping dimensions and complete canopy clearances are not documented in the reviewed source.",
      "The catalog does not include a foundation, delivery or local wiring assessment.",
    ],
    source_ids: ["almost-heaven-charleston-product"],
  },
  {
    product_id: "almost-heaven-huntington",
    eyebrow: "Four-to-six-person outdoor canopy barrel kit",
    heading: "Huntington leaves more interior depth than the shorter canopy kits",
    summary: "Almost Heaven Huntington is a four-to-six-person outdoor canopy barrel kit measuring 78 × 94 × 75.375 inches with a 240 V, 8 kW and 40 A heater entry.",
    paragraphs: [
      "Huntington shares the 78 by 94 inch assembled envelope of several canopy barrels but records a 74.25-inch interior depth. The source documents four to six people, so the range should remain visible when comparing the model with Charleston and Audra.",
      "Cedar and Hemlock are listed for construction, and the traditional heater entry is 8 kW at 240 volts and 40 amps. The current record does not state a separate required-circuit value or a plug type.",
    ],
    decision_points: [
      "The four-to-six-person range is more informative than a single headline capacity.",
      "The 74.25-inch interior depth distinguishes Huntington from the shorter canopy records.",
      "The documented heater entry is 8 kW, 240 volts and 40 amps.",
    ],
    limitations: [
      "The source does not provide shipping dimensions or the canopy's complete clearance needs.",
      "Site, foundation and electrical planning remain outside the catalog comparison.",
    ],
    source_ids: ["almost-heaven-huntington-product"],
  },
  {
    product_id: "almost-heaven-madison",
    eyebrow: "Two-to-three-person indoor traditional kit",
    heading: "Madison sits between the compact and family-size indoor kits",
    summary: "Almost Heaven Madison is a two-to-three-person indoor sauna kit measuring 65 × 53 × 77.625 inches with a documented 240 V, 6 kW and 30 A heater supply.",
    paragraphs: [
      "Madison is documented for two to three people and uses a 65-inch exterior width with a 53-inch depth. Its interior measures 60.25 by 48.5 inches, while cedar and Hemlock are the recorded construction options.",
      "The traditional heater entry is 6 kW at 240 volts and 30 amps. The source does not state a plug type or add a circuit instruction, so those details remain open for the installation review rather than being inferred from Hillsboro or Logan.",
    ],
    decision_points: [
      "The two-to-three-person range reflects the documented configuration.",
      "A 65 by 53 inch exterior footprint places Madison between the smaller and larger indoor kits.",
      "The heater record documents 6 kW at 240 volts and 30 amps.",
    ],
    limitations: [
      "Shipping dimensions and minimum clearances are not stated in the reviewed product record.",
      "The catalog cannot approve a room layout or electrical installation.",
    ],
    source_ids: ["almost-heaven-madison-product"],
  },
  {
    product_id: "sun-home-equinox",
    eyebrow: "Three-person indoor infrared cabin",
    heading: "Equinox pairs a three-seat cabin with a 20-amp supply",
    summary: "Sun Home Equinox is a three-person indoor infrared cabin measuring 62.3 × 45.9 × 77.7 inches with a documented 120 V, 2,250 W and 20 A supply.",
    paragraphs: [
      "Equinox is the larger of the two Sun Home indoor cabins in this wave. Its 62.3-inch width and 45.9-inch depth enclose a documented three-person configuration, with Eucalyptus listed as the material and 77.7 inches as the exterior height.",
      "The model page records 2,250 watts at 120 volts and 20 amps with a NEMA 5-20P plug. The supply figures make Equinox different from smaller 15-amp cabins, but the surrounding room, ventilation and local circuit still require their own checks.",
    ],
    decision_points: [
      "The 62.3-inch width is the main indoor placement value for Equinox.",
      "Eucalyptus and three-person seating are documented for this exact model.",
      "The 20-amp, 120-volt entry is paired with a NEMA 5-20P plug.",
    ],
    limitations: [
      "The reviewed record does not provide a complete clearance or shipping schedule.",
      "The catalog does not certify a household receptacle or local electrical code compliance.",
    ],
    source_ids: ["sun-home-equinox-product"],
  },
  {
    product_id: "sun-home-eclipse-2",
    eyebrow: "Two-person indoor infrared cabin",
    heading: "Eclipse 2 uses a compact cabinet with a higher current entry",
    summary: "Sun Home Eclipse 2 is a two-person indoor infrared cabin measuring 51.5 × 47.2 × 76.7 inches with a documented 120 V, 2,820 W and 23.5 A supply.",
    paragraphs: [
      "Eclipse 2 keeps its exterior width to 51.5 inches and documents seating for two. The 47.2-inch depth and 76.7-inch height belong to the cabinet, while Eucalyptus is the recorded material for the indoor infrared model.",
      "Sun Home lists 2,820 watts at 120 volts and 23.5 amps with a NEMA L5-30P plug and a documented 30-amp circuit entry. This is not interchangeable with a standard 15-amp comparison, even though the nominal voltage is the same.",
    ],
    decision_points: [
      "The 51.5-inch width is the useful first check for a two-person indoor layout.",
      "Eucalyptus and two-person capacity are tied to Eclipse 2.",
      "The 23.5-amp rating and 30-amp circuit entry are the key electrical constraints.",
    ],
    limitations: [
      "Shipping dimensions and complete minimum clearances are not stated in the reviewed record.",
      "A local electrician must confirm the circuit and connection arrangement.",
    ],
    source_ids: ["sun-home-eclipse-2-product"],
  },
  {
    product_id: "redwood-garden-8",
    eyebrow: "Eight-person outdoor traditional kit",
    heading: "Garden 8 needs a broad base before the room can be assessed",
    summary: "Redwood Outdoors Garden Outdoor Sauna 8 Person measures 90.5 × 90.875 × 87.25 inches and has a documented 240 V, 8 kW heater entry.",
    paragraphs: [
      "Garden 8 is an eight-person outdoor kit with an exterior footprint just over 90 inches in both directions. The source identifies heat-treated Hemlock and documents the seating and heater information, but the reviewed record does not provide complete interior dimensions.",
      "The traditional heater entry is listed at 8 kW and 240 volts with a 40-amp rating. That is enough to compare the model's scale and electrical class, not enough to approve the foundation, clearances or final wiring route.",
    ],
    decision_points: [
      "The roughly 90-inch square footprint is the first site-planning constraint.",
      "Heat-treated Hemlock is the documented material.",
      "The record lists an 8 kW, 240-volt and 40-amp heater entry.",
    ],
    limitations: [
      "Complete interior and shipping dimensions are not stated in the reviewed product record.",
      "Foundation, working clearances and the final electrical method remain open.",
    ],
    source_ids: ["redwood-garden-8-product"],
  },
  {
    product_id: "redwood-grove-8",
    eyebrow: "Eight-person outdoor traditional kit",
    heading: "Grove 8 is the largest Redwood footprint in this first wave",
    summary: "Redwood Outdoors Grove Outdoor Sauna 8 Person measures 96.25 × 96.25 × 94.875 inches and has a documented 240 V, 6 kW heater entry.",
    paragraphs: [
      "Grove 8 uses a 96.25-inch square exterior footprint and reaches nearly 95 inches in height. The source documents eight-person seating and heat-treated Hemlock, while the catalog deliberately leaves interior dimensions open where the reviewed page does not state them.",
      "The heater entry is documented at 6 kW, 240 volts and 30 amps. Grove therefore differs from Garden 8 in both overall size and listed heater power, although neither value includes the extra area needed for access, foundation and service.",
    ],
    decision_points: [
      "The 96.25-inch square footprint needs a generous outdoor base.",
      "Heat-treated Hemlock is the documented construction material.",
      "The 6 kW, 240-volt and 30-amp entry is specific to Grove 8.",
    ],
    limitations: [
      "The reviewed source does not give complete interior or shipping dimensions.",
      "Outdoor installation, drainage, clearances and electrical work need separate documentation.",
    ],
    source_ids: ["redwood-grove-8-product"],
  },
  {
    product_id: "redwood-vista-6",
    eyebrow: "Six-person outdoor traditional kit",
    heading: "Vista 6 is a lower-profile outdoor kit with a 71-inch width",
    summary: "Redwood Outdoors Vista Outdoor Sauna 6 Person measures 71 × 72.75 × 76.5 inches and has a documented 240 V, 6 kW heater entry.",
    paragraphs: [
      "Vista 6 is the more compact rectangular option among Redwood's outdoor kits in this wave. Its 71-inch width, 72.75-inch depth and 76.5-inch height define the documented exterior envelope, while Canadian Thermowood is the recorded material.",
      "The source lists a 6 kW traditional heater at 240 volts and 30 amps, with heater options handled separately from the cabin dimensions. The site plan still needs room for access, base construction and the model's clearance requirements.",
    ],
    decision_points: [
      "The 71-inch width and 72.75-inch depth suit a different site shape from the square Grove.",
      "Canadian Thermowood is the documented material.",
      "The heater entry is 6 kW at 240 volts and 30 amps.",
    ],
    limitations: [
      "Interior and shipping dimensions are not complete in the reviewed catalog record.",
      "The heater option and electrical installation need the manufacturer's instructions and local review.",
    ],
    source_ids: ["redwood-vista-6-product"],
  },
  {
    product_id: "redwood-barrel-6",
    eyebrow: "Six-person outdoor barrel kit",
    heading: "Redwood's standard barrel keeps the exterior envelope compact",
    summary: "Redwood Outdoors Barrel Outdoor Sauna 6 Person measures 71 × 72.75 × 76.5 inches and has a documented 240 V, 6 kW heater entry.",
    paragraphs: [
      "The six-person Redwood barrel uses a 71 by 72.75 inch exterior footprint and reaches 76.5 inches in height. Heat-treated Hemlock is the documented material, and the rounded form changes the interior arrangement even though its outside measurements match Vista 6 in this record.",
      "Redwood lists a 6 kW traditional heater at 240 volts and 30 amps. The product entry keeps heater options distinct from the barrel shell and does not infer the final circuit or base from those headline values.",
    ],
    decision_points: [
      "The matching exterior footprint does not make Barrel 6 and Vista 6 the same interior layout.",
      "Heat-treated Hemlock is the documented material for the barrel.",
      "The 6 kW, 240-volt and 30-amp heater entry is recorded for this model.",
    ],
    limitations: [
      "Complete interior and shipping dimensions are not stated in the reviewed record.",
      "The catalog does not decide the foundation, access route or final wiring method.",
    ],
    source_ids: ["redwood-barrel-6-product"],
  },
  {
    product_id: "redwood-barrel-porch-6",
    eyebrow: "Six-person outdoor barrel kit with porch",
    heading: "The porch changes the site envelope more than the barrel width",
    summary: "Redwood Outdoors Barrel Outdoor Sauna with Porch 6 Person measures 72.75 × 92.5 × 76.5 inches and has a documented 240 V, 6 kW heater entry.",
    paragraphs: [
      "The porch version extends the documented exterior depth to 92.5 inches while keeping the width at 72.75 inches. That extra zone is part of the outdoor planning conversation even though the sauna room itself remains a six-person barrel made with heat-treated Hemlock.",
      "The source lists a 6 kW traditional heater at 240 volts and 30 amps. It documents the porch layout but does not provide a complete porch clearance, shipping or foundation schedule in the normalized record.",
    ],
    decision_points: [
      "The 92.5-inch depth includes the porch-related envelope and should not be reduced to the barrel alone.",
      "Heat-treated Hemlock is the documented material.",
      "The heater entry is 6 kW at 240 volts and 30 amps.",
    ],
    limitations: [
      "The reviewed record does not provide complete interior or shipping dimensions.",
      "Porch access, foundation and final electrical work need separate model documentation.",
    ],
    source_ids: ["redwood-barrel-porch-6-product"],
  },
  {
    product_id: "redwood-extra-wide-6",
    eyebrow: "Six-person extra-wide outdoor barrel kit",
    heading: "Extra-Wide adds height and depth without changing the six-person brief",
    summary: "Redwood Outdoors Extra-Wide Outdoor Barrel Sauna 6 Person measures 71.75 × 84.75 × 88.5 inches and has a documented 240 V, 6 kW heater entry.",
    paragraphs: [
      "Extra-Wide keeps the documented capacity at six people but grows to 84.75 inches in depth and 88.5 inches in height. Canadian Thermowood is the listed material, and those dimensions make roof clearance and delivery access more important than the capacity label alone suggests.",
      "The source record lists a 6 kW traditional heater at 240 volts and 30 amps. Redwood's heater options remain separate from the shell dimensions, so the final circuit, base and outdoor clearances are not inferred here.",
    ],
    decision_points: [
      "The 88.5-inch height is the key distinction when a garden location has overhead limits.",
      "Canadian Thermowood is the documented material.",
      "The heater entry is 6 kW at 240 volts and 30 amps.",
    ],
    limitations: [
      "Complete interior and shipping dimensions are not stated in the reviewed record.",
      "The product page does not replace the assembly, foundation or electrical instructions.",
    ],
    source_ids: ["redwood-extra-wide-6-product"],
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
console.log(`Prepared ${entries.length} product-specific editorial records; product publication statuses remain unchanged.`);
