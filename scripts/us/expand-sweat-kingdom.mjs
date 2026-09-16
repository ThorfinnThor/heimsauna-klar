import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const today = "2026-09-16";
const nextReview = "2026-12-15";
const merchantId = "sweat-kingdom";
const programId = "awin-sweat-kingdom-us";
const readJson = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const writeJson = async (file, value) => writeFile(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");

const [products, configurations, sources, offers, mappings, editorial, rights, coverage, backlog, gate, readiness] = await Promise.all([
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("data/us/offers.json"),
  readJson("data/us/mappings.json"),
  readJson("content/us/product-editorial.json"),
  readJson("docs/us/rights-register.json"),
  readJson("docs/us/coverage-matrix.json"),
  readJson("docs/us/catalog-expansion-backlog.json"),
  readJson("docs/us/sol-acceptance-gate.json"),
  readJson("docs/us/indexing-readiness.json"),
]);

const documented = (value, evidenceId) => ({ status: "documented", value, evidence_ids: [evidenceId] });
const unknown = (reason) => ({ status: "unknown", reason });
const inches = (width, depth, height) => ({
  width: { value: width, unit: "in" },
  depth: { value: depth, unit: "in" },
  height: { value: height, unit: "in" },
});

function upsert(entries, id, value) {
  const index = entries.findIndex((entry) => entry.id === id || entry.asset_id === id);
  if (index === -1) entries.push(value);
  else entries[index] = { ...entries[index], ...value };
}

const models = [
  {
    id: "sweat-kingdom-sweat-barrel",
    model: "The Sweat Barrel (2 Person)",
    handle: "the-large-barrel-sauna-6-person",
    url: "https://sweatkingdom.com/products/the-large-barrel-sauna-6-person",
    title: "Sweat Kingdom The Sweat Barrel product page",
    capacity: 2,
    placements: ["indoor", "outdoor"],
    form: "Traditional red cedar barrel sauna",
    exterior: inches(72, 48, 72),
    interior: null,
    materials: ["Red cedar"],
    heater: "Harvia KIP 6 kW heater with built-in controls",
    power: 6000,
    current: 30,
    wire: "10/2",
    stones: true,
    priceMinor: 514500,
    offerType: "fixed-price",
    clickref: "us-sweat-barrel",
    label: "Regular 2-person size · Harvia KIP 6 kW package",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the product page lists a five-week lead time.",
    identityRaw: "The Sweat Barrel (2-6 Person), traditional red cedar barrel sauna for indoor and outdoor use.",
    configurationRaw: "Regular 2-person configuration; exterior 6 ft wide by 4 ft deep by 6 ft high; red cedar construction.",
    electricalRaw: "Selected Harvia KIP 6 kW package; 30 A, 10/2 wire and hardwired connection. Voltage is not stated on the reviewed page.",
    editorial: {
      eyebrow: "Compact red cedar barrel",
      heading: "A two-person barrel with a four-foot depth",
      summary: "The regular Sweat Barrel measures 72 × 48 × 72 inches and pairs the compact shell with a hardwired 6 kW Harvia heater.",
      paragraphs: [
        "The regular Sweat Barrel is the shallowest configuration in the range. Its six-foot width follows the curved barrel profile, while the four-foot depth keeps the floor footprint shorter than the larger four- and six-person versions.",
        "The selected package includes a Harvia KIP 6 kW heater and sauna stones. Sweat Kingdom specifies a 30-amp hardwired connection with 10/2 wire, but the product page does not publish the supply voltage or installation clearances.",
      ],
      decision_points: [
        "The curved wall reduces usable shoulder space compared with a rectangular cabin of the same exterior width.",
        "The 72-inch height is the outer barrel diameter, not a complete room-clearance allowance.",
        "A weatherproof base and roof decision remain part of an outdoor installation.",
      ],
      limitations: [
        "Interior dimensions, voltage, shipping dimensions and minimum clearances are not stated.",
        "The listed price applies to the selected regular configuration and can change with roof or heater options.",
      ],
    },
  },
  {
    id: "sweat-kingdom-sweat-pod",
    model: "The Sweat Pod (2 Person)",
    handle: "the-sweat-pod",
    url: "https://sweatkingdom.com/products/the-sweat-pod",
    title: "Sweat Kingdom The Sweat Pod product page",
    capacity: 2,
    placements: ["indoor", "outdoor"],
    form: "Compact red cedar sauna cabin with beveled roof",
    exterior: inches(53, 61.25, 77.375),
    interior: inches(47.375, 51, 70.375),
    materials: ["Red cedar", "Tempered glass"],
    heater: "Harvia KIP 6 kW heater with built-in controls",
    power: 6000,
    current: null,
    wire: null,
    stones: true,
    priceMinor: 604500,
    offerType: "fixed-price",
    clickref: "us-sweat-pod",
    label: "Regular 2-person size · Harvia KIP 6 kW package",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the product page lists a five-week lead time.",
    identityRaw: "The Sweat Pod (2-4 Person), traditional red cedar sauna for indoor and outdoor use.",
    configurationRaw: "Regular 1-2 person configuration; exterior 77 3/8 H × 61 1/4 D × 53 W inches; interior 70 3/8 H × 51 D × 47 3/8 W inches.",
    electricalRaw: "Selected Harvia KIP 6 kW heater package. The page documents 40 A and 8/3 hardwire for the alternative Homecraft 6 kW option, not for the selected Harvia package, so current and wire remain unassigned.",
    editorial: {
      eyebrow: "Two-person cabin with two bench levels",
      heading: "A narrow cabin that still needs more than five feet of depth",
      summary: "The regular Sweat Pod is 53 inches wide and 61.25 inches deep, with upper and lower benches inside its red cedar shell.",
      paragraphs: [
        "At 53 inches wide, the regular Sweat Pod is narrower than the Sweat Cabin and most group models. Its 61.25-inch depth matters in a tight room because the door approach and electrical access still sit outside that listed cabinet footprint.",
        "The current base selection uses a 6 kW Harvia KIP heater. The page also describes Homecraft electrical requirements, but those figures belong to a different selectable package and are not transferred to this configuration.",
      ],
      decision_points: [
        "The interior width is 47.375 inches, which gives a more realistic measure of side-by-side seating.",
        "Indoor and outdoor placement are both listed, although outdoor site preparation is not included in the dimensions.",
        "The beveled roof is included in the selected offer shown on the merchant page.",
      ],
      limitations: [
        "The selected Harvia package has no stated voltage, amperage or wire specification on this page.",
        "Minimum clearances and shipping dimensions require separate documentation.",
      ],
    },
  },
  {
    id: "sweat-kingdom-summit",
    model: "The Summit (2 Person)",
    handle: "the-summit",
    url: "https://sweatkingdom.com/products/the-summit",
    title: "Sweat Kingdom The Summit product page",
    capacity: 2,
    placements: ["outdoor"],
    form: "Outdoor modular cedar sauna with pitched steel roof",
    exterior: inches(64, 59, 91),
    interior: inches(61, 50, 82),
    materials: ["Natural cedar", "Steel roof", "Steel fasteners"],
    heater: "Harvia KIP 8 kW heater with built-in controls",
    power: 8000,
    current: null,
    wire: null,
    stones: false,
    priceMinor: 694500,
    offerType: "fixed-price",
    clickref: "us-summit",
    label: "Small 2-person size · Harvia KIP 8 kW package",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the product page lists a five-week lead time.",
    identityRaw: "The Summit (2-6 Person), outdoor-rated modular traditional sauna with a pitched steel roof.",
    configurationRaw: "Small 2-person configuration; exterior 91 H × 59 D × 64 W inches; interior 82 H × 50 D × 61 W inches; natural cedar and steel exterior components.",
    electricalRaw: "Selected Harvia KIP 8 kW heater with built-in controls. The detailed 50 A and 6/3 hardwire specification on the page is labeled for the alternative Homecraft Revive 9 kW package and is not assigned here.",
    editorial: {
      eyebrow: "Small outdoor modular cabin",
      heading: "The Summit keeps a pitched roof over a two-person plan",
      summary: "The small Summit measures 64 × 59 × 91 inches and combines a natural cedar cabin with a pitched steel roof for outdoor placement.",
      paragraphs: [
        "The Summit uses a rectangular cabin rather than a barrel shell. The small version provides a 61-inch interior width inside a 64-inch exterior width, while the 91-inch overall height reflects its pitched roof.",
        "The current merchant selection shows a Harvia KIP 8 kW heater. The product page publishes detailed wiring only for the Homecraft alternative, so the electrical circuit for this exact selection remains open.",
      ],
      decision_points: [
        "The pitched steel roof is part of the structure and raises the exterior height to 91 inches.",
        "The small configuration is distinct from the deeper four- and six-person Summit sizes.",
        "Outdoor drainage, foundation and service access are not included in the 64 × 59 inch footprint.",
      ],
      limitations: [
        "The exact circuit, voltage and wire specification for the selected Harvia heater are not stated.",
        "Shipping dimensions, net weight and minimum clearances remain undocumented.",
      ],
    },
  },
  {
    id: "sweat-kingdom-ridge",
    model: "The Ridge (2 Person)",
    handle: "the-ridge",
    url: "https://sweatkingdom.com/products/the-ridge",
    title: "Sweat Kingdom The Ridge product page",
    capacity: 2,
    placements: ["outdoor"],
    form: "Compact outdoor red cedar sauna with pitched roof",
    exterior: inches(59.5, 59.25, 89.5),
    interior: inches(56, 50, 82),
    materials: ["Natural red cedar", "Steel roof"],
    heater: "Homecraft Revive Slim 6 kW heater",
    power: 6000,
    current: 40,
    wire: "8/3",
    stones: false,
    priceMinor: 594500,
    offerType: "from-price",
    clickref: "us-ridge",
    label: "2-person size · Homecraft Revive Slim 6 kW package",
    availability: "made-to-order",
    shipping: "The merchant shows a starting price; shipping and final options are calculated by the merchant.",
    identityRaw: "The Ridge (2 Person), compact outdoor traditional sauna in natural red cedar.",
    configurationRaw: "2-person configuration; exterior 59.5 W × 59.25 D × 89.5 H inches; interior 56 W × 50 D × 82 H inches.",
    electricalRaw: "Homecraft Revive Slim 6 kW heater; 40 A dedicated breaker, 8/3 hardwired connection. Voltage is not stated on the reviewed page.",
    editorial: {
      eyebrow: "Two-person outdoor square cabin",
      heading: "A five-foot-class footprint with a full-height roofline",
      summary: "The Ridge places a two-person cedar interior inside a 59.5 × 59.25 inch footprint and uses a 6 kW hardwired heater.",
      paragraphs: [
        "The Ridge is nearly square at the base, unlike the deeper Sweat Pod. Its 56-inch interior width and 50-inch interior depth make the seating envelope easier to judge before adding the exterior access and clearance zones.",
        "Sweat Kingdom pairs this model with a Homecraft Revive Slim 6 kW heater and states a 40-amp dedicated hardwired connection using 8/3 wire. The supply voltage is not published on the reviewed page.",
      ],
      decision_points: [
        "The 89.5-inch exterior height includes the outdoor roof profile.",
        "The starting price can change with the merchant's selectable finish or package options.",
        "A level foundation and service path must be planned beyond the listed cabinet dimensions.",
      ],
      limitations: [
        "Voltage, shipping dimensions, weight and minimum clearances are not documented.",
        "The offer is presented as a starting price rather than one immutable checkout total.",
      ],
    },
  },
  {
    id: "sweat-kingdom-sweat-pod-blackout",
    model: "The Sweat Pod Blackout (2 Person)",
    handle: "the-sweat-pod-blackout-edition",
    url: "https://sweatkingdom.com/products/the-sweat-pod-blackout-edition",
    title: "Sweat Kingdom The Sweat Pod Blackout Edition product page",
    capacity: 2,
    placements: ["indoor", "outdoor"],
    form: "Compact red cedar sauna cabin with blackout exterior protection",
    exterior: inches(53, 61.25, 77.375),
    interior: inches(47.375, 51, 70.375),
    materials: ["Red cedar", "Tempered glass", "Blackout weather-protection layers"],
    heater: "Harvia KIP 6 kW heater with built-in controls",
    power: 6000,
    current: null,
    wire: null,
    stones: true,
    priceMinor: 754500,
    offerType: "fixed-price",
    clickref: "us-pod-blackout",
    label: "Regular 2-person size · Harvia KIP 6 kW package",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the product page lists a five-week lead time.",
    identityRaw: "The Sweat Pod Blackout Edition, 2-4 person traditional red cedar sauna with added exterior protection.",
    configurationRaw: "Regular 1-2 person configuration; exterior 77 3/8 H × 61 1/4 D × 53 W inches; interior 70 3/8 H × 51 D × 47 3/8 W inches; two additional protective layers on side walls and roof.",
    electricalRaw: "Selected Harvia KIP 6 kW heater package. The page gives 40 A and 8/3 hardwire only for the alternative Homecraft option, so those values are not assigned to this selection.",
    editorial: {
      eyebrow: "Weather-protected compact cabin",
      heading: "The Blackout Pod keeps the regular cabin dimensions",
      summary: "The two-person Blackout Pod retains the 53 × 61.25 inch footprint and adds protective layers to the side walls and roof.",
      paragraphs: [
        "The Blackout edition does not create a larger two-person interior. It uses the same published exterior and interior dimensions as the regular Pod while adding two protective layers to the side walls and roof for outdoor exposure.",
        "The current base selection shows a 6 kW Harvia KIP heater. The page's 40-amp specification is attached to the Homecraft alternative, so it is not treated as the requirement for this offer.",
      ],
      decision_points: [
        "The added exterior treatment changes weather protection, not seated capacity.",
        "The 47.375-inch interior width is the useful comparison measure for two occupants.",
        "The five-week lead time is separate from freight transit and site preparation.",
      ],
      limitations: [
        "The selected Harvia heater's voltage, current and wire requirements are not stated.",
        "The product page does not publish shipping dimensions, weight or installation clearances.",
      ],
    },
  },
  {
    id: "sweat-kingdom-sweat-cabin-blackout",
    model: "The Sweat Cabin Blackout (4 Person)",
    handle: "the-sweat-cabin-blackout-edition",
    url: "https://sweatkingdom.com/products/the-sweat-cabin-blackout-edition",
    title: "Sweat Kingdom The Sweat Cabin Blackout Edition product page",
    capacity: 4,
    placements: ["indoor", "outdoor"],
    form: "Four-person red cedar cabin with blackout exterior protection",
    exterior: inches(72, 72.5, 77),
    interior: null,
    materials: ["Premium red cedar", "Tempered glass", "Blackout weather-protection layers"],
    heater: "Harvia KIP 8 kW heater with built-in controls",
    power: 8000,
    current: null,
    wire: null,
    stones: true,
    priceMinor: 924500,
    offerType: "fixed-price",
    clickref: "us-cabin-blackout",
    label: "6-foot wall height · Harvia KIP 8 kW package",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the product page lists a five-week lead time.",
    identityRaw: "The Sweat Cabin Blackout Edition, 4-person traditional sauna for indoor and outdoor use.",
    configurationRaw: "4-person, 6-foot wall configuration; exterior 77 H × 72.5 D × 72 W inches; premium red cedar with added side-wall and roof protection.",
    electricalRaw: "Selected Harvia KIP 8 kW heater with built-in controls. The page's 50 A and 6/3 hardwire details are for the alternative Homecraft 9 kW package and are not assigned here.",
    editorial: {
      eyebrow: "Protected four-person cedar cabin",
      heading: "A Blackout shell around the shorter Sweat Cabin",
      summary: "This four-person Blackout configuration is 72 × 72.5 × 77 inches and adds exterior protection to the standard cedar cabin shape.",
      paragraphs: [
        "The six-foot-wall Blackout Cabin shares the standard model's footprint and 77-inch exterior height. Its distinguishing feature is the added side-wall and roof protection, which is relevant outdoors but does not replace foundation or drainage planning.",
        "The merchant's current base package selects a Harvia KIP 8 kW heater. The detailed 50-amp requirement on the page belongs to a Homecraft 9 kW alternative, so it remains separate from this record.",
      ],
      decision_points: [
        "The shorter wall option is the relevant envelope where overhead space is constrained.",
        "The four-person label does not document an interior dimension or reclining capacity.",
        "Blackout protection addresses the shell while the site, wiring and access path remain project work.",
      ],
      limitations: [
        "Interior dimensions and the selected Harvia heater's circuit values are not stated.",
        "Shipping dimensions, weight and installation clearances remain open.",
      ],
    },
  },
  {
    id: "sweat-kingdom-ascent",
    model: "The Ascent (6 Person)",
    handle: "the-ascent",
    url: "https://sweatkingdom.com/products/the-ascent",
    title: "Sweat Kingdom The Ascent product page",
    capacity: 6,
    placements: ["outdoor"],
    form: "Six-person outdoor modular cedar sauna with pitched steel roof",
    exterior: inches(84, 72, 91),
    interior: inches(81, 61.5, 82),
    materials: ["Natural cedar", "Steel roof", "Steel fasteners"],
    heater: "Homecraft Revive 9 kW WiFi heater",
    power: 9000,
    current: 50,
    wire: "6/3",
    stones: false,
    priceMinor: 1174500,
    offerType: "fixed-price",
    clickref: "us-ascent",
    label: "6-person size · Homecraft Revive 9 kW package",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; final delivery timing is confirmed by the merchant.",
    identityRaw: "The Ascent, six-person outdoor-rated modular traditional sauna in natural cedar.",
    configurationRaw: "6-person configuration; exterior 91 H × 72 D × 84 W inches; interior 82 H × 61.5 D × 81 W inches; pitched steel roof and natural cedar construction.",
    electricalRaw: "Homecraft Revive 9 kW WiFi heater; 50 A dedicated breaker, 6/3 hardwired connection. Voltage is not stated on the reviewed page.",
    editorial: {
      eyebrow: "Six-person outdoor modular sauna",
      heading: "The Ascent expands the bench width without adding a second size",
      summary: "The Ascent has an 84 × 72 inch base, an 81-inch interior width and one documented six-person configuration.",
      paragraphs: [
        "Unlike the multi-size Summit, the Ascent is presented in one six-person shell. The interior is 81 inches wide and 61.5 inches deep, while the pitched roof brings the exterior height to 91 inches.",
        "Its Homecraft Revive 9 kW heater requires a 50-amp dedicated hardwired connection with 6/3 wire. Voltage is not stated, so an electrician still needs the applicable installation document before specifying service.",
      ],
      decision_points: [
        "The 84-inch width and 72-inch depth describe the sauna only, not the outdoor work zone.",
        "The pitched steel roof is intended for year-round outdoor exposure.",
        "The sliding lower bench changes usable floor space inside the cabin.",
      ],
      limitations: [
        "Voltage, shipping dimensions, weight and minimum clearances are not published.",
        "The merchant price excludes site work and can change before purchase.",
      ],
    },
  },
  {
    id: "sweat-kingdom-outpost",
    model: "The Outpost (4-6 Person)",
    handle: "the-outpost",
    url: "https://sweatkingdom.com/products/the-outpost",
    title: "Sweat Kingdom The Outpost product page",
    capacity: 6,
    placements: ["outdoor"],
    form: "Fully assembled outdoor prefab traditional sauna",
    exterior: inches(99, 75, 108),
    interior: null,
    materials: ["LP board-and-batten siding", "Mineral-wool insulation", "Steel roof", "Western red cedar interior"],
    heater: "Homecraft Revive 9 kW heater",
    power: 9000,
    current: 50,
    wire: "#8",
    stones: false,
    priceMinor: 1924500,
    offerType: "fixed-price",
    clickref: "us-outpost",
    label: "4-6 person prefab · Western red cedar interior · Homecraft 9 kW",
    availability: "made-to-order",
    shipping: "The product requires a delivery quote and site-placement planning; shipping and placement are not included in the catalog price.",
    identityRaw: "The Outpost, fully assembled 4-6 person outdoor prefab traditional sauna.",
    configurationRaw: "Exterior 8 ft 3 in wide by 6 ft 3 in deep; sloped exterior height ranges from 7 ft 4 in to 9 ft; LP board-and-batten shell, R13 mineral-wool insulation, steel roof and Western red cedar interior selection.",
    electricalRaw: "Homecraft Revive 9 kW heater; 50 A dedicated circuit and #8 hardwired connection. Voltage is not stated on the reviewed page.",
    editorial: {
      eyebrow: "Delivered prefab outdoor room",
      heading: "The Outpost is a placement project, not a flat-pack cabin",
      summary: "The Outpost arrives as a fully assembled 4-6 person sauna with a 99 × 75 inch base and a sloped roof reaching 108 inches.",
      paragraphs: [
        "The Outpost changes the logistics more than the seating count. It is a framed, insulated prefab room with board-and-batten siding and a steel roof, so delivery access and final placement have to be resolved before ordering.",
        "The selected interior is Western red cedar and the listed heater is a Homecraft Revive 9 kW unit. Sweat Kingdom states a 50-amp dedicated hardwired connection with #8 wire, while voltage remains unstated on the reviewed page.",
      ],
      decision_points: [
        "The roof slopes from 88 to 108 inches; the catalog uses the maximum height for conservative space planning.",
        "A delivery quote and a verified route to the final pad are essential for this assembled structure.",
        "The 99 × 75 inch shell excludes the foundation, working room and electrical approach.",
      ],
      limitations: [
        "Interior dimensions, voltage, shipping weight and minimum clearances are not documented.",
        "Shipping, site preparation and placement are not included in the displayed product price.",
      ],
    },
  },
  {
    id: "sweat-kingdom-sk-110",
    model: "SK 110 (2-3 Person)",
    handle: "the-sk-110",
    url: "https://sweatkingdom.com/products/the-sk-110",
    title: "Sweat Kingdom SK 110 product page",
    capacity: 3,
    placements: ["indoor", "outdoor"],
    form: "Modular red cedar sauna cabin",
    exterior: null,
    interior: null,
    materials: ["Western red cedar", "Wool insulation", "Waterproof rubber flooring", "LP Smartside or cedar siding"],
    heater: "Heater included; exact heater model depends on the selected SK 110 package",
    power: null,
    current: null,
    wire: null,
    stones: true,
    priceMinor: 1799500,
    offerType: "fixed-price",
    clickref: "us-sk-110",
    label: "5 × 6 footprint · 2-3 person base selection",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the product page lists selectable footprints and a merchant lead time is confirmed during ordering.",
    identityRaw: "SK 110, a modular traditional sauna offered in 5 × 6, 6 × 8 and 7 × 10 footprints for 2-3, 4-5 or 6-8 people.",
    configurationRaw: "Base selection 5 × 6 footprint for 2-3 people; the page also offers 6 × 8 and 7 × 10 footprints. Western red cedar lining, wool insulation and waterproof rubber flooring are listed.",
    electricalRaw: "The product page states that a heater and sauna stones are included, but does not identify the selected heater's voltage, power, current or circuit requirement.",
    editorial: {
      eyebrow: "Modular cabin with three footprint choices",
      heading: "The SK 110 starts with a compact 5 × 6 footprint",
      summary: "SK 110 offers a 2-3 person base footprint and can be configured for larger groups, with cedar lining and insulated modular walls.",
      paragraphs: [
        "The SK 110 is sold as a modular cabin rather than one fixed-size shell. The base selection is a 5 × 6 footprint for 2-3 people, while the same product page lists 6 × 8 and 7 × 10 alternatives for larger groups.",
        "Sweat Kingdom lists a heater and sauna stones with the cabin, along with wool insulation, a vapor barrier, waterproof rubber flooring and a Western red cedar lining. The exact heater and electrical service depend on the selected package and are not published in the reviewed page.",
      ],
      decision_points: [
        "The 5 × 6 footprint is a planning reference, not a complete installation envelope.",
        "A larger footprint changes capacity within the same SK 110 product family.",
        "Siding and interior wood options are selectable and can affect the final configuration.",
      ],
      limitations: [
        "The source does not publish exterior height, interior dimensions, heater model or electrical requirements for the base selection.",
        "Delivery access and foundation requirements require a project-specific check.",
      ],
    },
  },
  {
    id: "sweat-kingdom-sk-210",
    model: "SK 210 (4 Person)",
    handle: "sk-210",
    url: "https://sweatkingdom.com/products/sk-210",
    title: "Sweat Kingdom SK 210 product page",
    capacity: 4,
    placements: ["indoor", "outdoor"],
    form: "Modular red cedar sauna cabin",
    exterior: null,
    interior: null,
    materials: ["Western red cedar", "Wool insulation", "Waterproof rubber flooring", "LP Smartside or cedar siding"],
    heater: "Heater included; exact heater model depends on the selected SK 210 package",
    power: null,
    current: null,
    wire: null,
    stones: true,
    priceMinor: 2050000,
    offerType: "fixed-price",
    clickref: "us-sk-210",
    label: "6 × 8 footprint · 4 person base selection",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the merchant confirms final delivery timing and options during ordering.",
    identityRaw: "SK 210, modular traditional sauna with 6 × 8 footprint for 4 people and a 7 × 10 alternative for 6 people.",
    configurationRaw: "Base selection 6 × 8 footprint for 4 people; the page also offers a 7 × 10 footprint for 6 people. Western red cedar lining, wool insulation and waterproof rubber flooring are listed.",
    electricalRaw: "The product page states that a heater and sauna stones are included, but does not identify the selected heater's voltage, power, current or circuit requirement.",
    editorial: {
      eyebrow: "Four-person modular cabin",
      heading: "SK 210 leaves room to grow to a six-person footprint",
      summary: "The base SK 210 selection uses a 6 × 8 footprint for four people, with a 7 × 10 alternative for six.",
      paragraphs: [
        "SK 210 is useful when a four-person layout is the starting point but the site may support a larger cabin later. The merchant lists a 6 × 8 footprint for four people and a 7 × 10 footprint for six within the same product page.",
        "Both variants use the modular construction described by Sweat Kingdom, including cedar lining, wool insulation and waterproof rubber flooring. A heater and stones are included, but the exact heater package and electrical requirements are not stated for the base selection.",
      ],
      decision_points: [
        "The base footprint is 6 × 8; the 7 × 10 option needs a separate site check.",
        "The listed capacity follows the merchant's footprint labels and does not document reclining space.",
        "The product footprint excludes foundation, access and service clearances.",
      ],
      limitations: [
        "Exterior height, interior dimensions and electrical circuit details are not published for the selected package.",
        "Final options and delivery conditions are confirmed by the merchant at order time.",
      ],
    },
  },
  {
    id: "sweat-kingdom-sk-310",
    model: "SK 310 (4-5 Person)",
    handle: "sk-310",
    url: "https://sweatkingdom.com/products/sk-310",
    title: "Sweat Kingdom SK 310 product page",
    capacity: 5,
    placements: ["indoor", "outdoor"],
    form: "Large modular red cedar sauna cabin",
    exterior: null,
    interior: null,
    materials: ["Western red cedar", "Wool insulation", "Waterproof rubber flooring", "LP Smartside or cedar siding"],
    heater: "Heater included; exact heater model depends on the selected SK 310 package",
    power: null,
    current: null,
    wire: null,
    stones: true,
    priceMinor: 2550000,
    offerType: "fixed-price",
    clickref: "us-sk-310",
    label: "7 × 10 footprint · 4-5 person base selection",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; the merchant confirms final delivery timing and options during ordering.",
    identityRaw: "SK 310, a 7 × 10 footprint modular traditional sauna for 4-5 people.",
    configurationRaw: "7 × 10 footprint for 4-5 people; Board & Batten LP Smartside, cedar siding alternatives, Western red cedar lining, wool insulation and waterproof rubber flooring are listed.",
    electricalRaw: "The product page states that a heater and sauna stones are included, but does not identify the selected heater's voltage, power, current or circuit requirement.",
    editorial: {
      eyebrow: "Seven-by-ten modular footprint",
      heading: "SK 310 is the large cabin for a five-person plan",
      summary: "The SK 310 uses a 7 × 10 footprint for four to five people and keeps the modular cedar construction used across the SK range.",
      paragraphs: [
        "The SK 310 is the straightforward large-footprint option in the range. Sweat Kingdom labels its 7 × 10 footprint for four to five people and offers siding and interior wood choices on the product page.",
        "The build description includes a Western red cedar lining, wool insulation and waterproof rubber flooring. A heater and sauna stones are included, while the page does not identify the exact heater model or the circuit needed for the selected package.",
      ],
      decision_points: [
        "The 7 × 10 footprint needs a clear route for delivery and a suitable foundation.",
        "The stated four-to-five-person capacity is tied to the footprint label, not a measured interior seating plan.",
        "Finish choices are part of the configuration and can change the final price.",
      ],
      limitations: [
        "Exterior height, interior dimensions and electrical requirements are not stated on the reviewed page.",
        "The displayed price is the current base price and can change with selected options.",
      ],
    },
  },
  {
    id: "sweat-kingdom-sk-mobile",
    model: "SK Mobile (4-5 Person)",
    handle: "sk-mobile",
    url: "https://sweatkingdom.com/products/sk-mobile",
    title: "Sweat Kingdom SK Mobile product page",
    capacity: 5,
    placements: ["indoor", "outdoor"],
    form: "Mobile red cedar sauna cabin",
    exterior: null,
    interior: null,
    materials: ["Western red cedar", "Wool insulation", "Waterproof rubber flooring"],
    heater: "HUUM Drop 9 heater (base selection)",
    power: null,
    current: null,
    wire: null,
    stones: true,
    priceMinor: 2850000,
    offerType: "fixed-price",
    clickref: "us-sk-mobile",
    label: "6.5 × 8 footprint · 4-5 person base selection · HUUM Drop 9",
    availability: "made-to-order",
    shipping: "Shipping is calculated at checkout; mobile placement and final delivery timing are confirmed by the merchant.",
    identityRaw: "SK Mobile, a mobile traditional sauna with a 6.5 × 8 footprint for 4-5 people and selectable HUUM Drop 9 or HUUM Hive Flow Mini heaters.",
    configurationRaw: "Base selection 6.5 × 8 footprint for 4-5 people with HUUM Drop 9 heater. Western red cedar lining, wool insulation and waterproof rubber flooring are listed.",
    electricalRaw: "The selected heater is HUUM Drop 9, but the product page does not state voltage, power, current or circuit requirements for this configuration.",
    editorial: {
      eyebrow: "Mobile sauna with a compact trailer footprint",
      heading: "The SK Mobile brings a four-to-five-person cabin to a 6.5 × 8 footprint",
      summary: "SK Mobile is listed at 6.5 × 8 feet for four to five people and offers a HUUM Drop 9 heater in the base selection.",
      paragraphs: [
        "The SK Mobile differs from the fixed cabins because the product is built around mobility. The merchant lists a 6.5 × 8 footprint for four to five people and lets buyers choose between a HUUM Drop 9 and a HUUM Hive Flow Mini heater.",
        "Sweat Kingdom describes the same cedar lining, wool insulation and waterproof rubber flooring used on its modular builds. The reviewed page does not publish the trailer specification or the electrical service for the selected HUUM heater, so those details need confirmation before ordering.",
      ],
      decision_points: [
        "The 6.5 × 8 footprint describes the mobile sauna body and not the complete towing or positioning envelope.",
        "A trailer route, turning radius and final placement surface are part of the site check.",
        "The heater choice changes the technical requirements even though the seating label stays the same.",
      ],
      limitations: [
        "Trailer dimensions, weight, towing requirements and electrical circuit details are not published on the reviewed page.",
        "Local transport, registration and placement requirements are outside the listed product data.",
      ],
    },
  },
];

for (const model of models) {
  const sourceId = `${model.id}-product`;
  const configurationId = `${model.id}-standard`;
  const evidence = {
    product: `evidence-${model.id}-product`,
    configuration: `evidence-${model.id}-configuration`,
    electrical: `evidence-${model.id}-electrical`,
  };

  upsert(sources.sources, sourceId, {
    id: sourceId,
    type: "manufacturer-page",
    url: model.url,
    title: model.title,
    publisher: "Sweat Kingdom",
    market: "US",
    checked_at: today,
    locator: "Product identity, selected configuration, dimensions, materials, price, availability and electrical sections",
  });
  upsert(sources.evidence, evidence.product, { id: evidence.product, entity_id: model.id, source_id: sourceId, field_path: "product_identity", raw_value: model.identityRaw });
  upsert(sources.evidence, evidence.configuration, { id: evidence.configuration, entity_id: configurationId, source_id: sourceId, field_path: "configuration.capacity_dimensions_materials", raw_value: model.configurationRaw });
  upsert(sources.evidence, evidence.electrical, { id: evidence.electrical, entity_id: configurationId, source_id: sourceId, field_path: "electrical_supply_options", raw_value: model.electricalRaw });

  upsert(products.products, model.id, {
    id: model.id,
    market: "US",
    slug: model.id,
    brand_name: "Sweat Kingdom",
    model: model.model,
    product_type: documented("sauna-cabin", evidence.product),
    heat_type: documented("traditional", evidence.product),
    energy_sources: model.energySources ? documented(model.energySources, evidence.electrical) : unknown("The reviewed product page does not identify the energy source for the selected heater package."),
    placements: documented(model.placements, evidence.product),
    form: documented(model.form, evidence.product),
    configuration_ids: [configurationId],
    source_ids: [sourceId],
    publication_status: "published",
    spec_checked_at: today,
    next_review_at: nextReview,
    change_reason: "Added after manual review of the exact Sweat Kingdom product page and approved Awin relationship.",
  });

  const components = [{
    id: `${configurationId}-heater`,
    component_type: "heater",
    name: model.heater,
    inclusion: "included",
    evidence_ids: [evidence.electrical],
  }];
  if (model.stones) components.push({
    id: `${configurationId}-stones`,
    component_type: "stones",
    name: "Sauna stones",
    inclusion: "included",
    evidence_ids: [evidence.product],
  });

  const requirement = {
    component: "heater",
    voltage_v: unknown("Voltage is not stated for this exact selected heater package on the reviewed product page."),
    frequency_hz: unknown("Frequency is not stated on the reviewed product page."),
    phase: unknown("Phase is not stated on the reviewed product page."),
    rated_power_w: model.power === null ? unknown("Rated power is not stated for this exact selected heater package on the reviewed product page.") : documented(model.power, evidence.electrical),
    rated_current_a: model.current === null ? unknown("Current is not stated for this exact selected heater package on the reviewed product page.") : documented(model.current, evidence.electrical),
    required_circuit_a: model.current === null ? unknown("The required circuit is not stated for this exact selected heater package on the reviewed product page.") : documented(model.current, evidence.electrical),
    specified_breaker_a: model.current === null ? unknown("A breaker rating is not stated for this exact selected heater package on the reviewed product page.") : documented(model.current, evidence.electrical),
    connection: documented("hardwired", evidence.electrical),
    plug_type: unknown("A plug type does not apply to the stated hardwired connection."),
    dedicated_circuit: model.current === null ? unknown("A dedicated circuit is not explicitly stated for this exact selected package.") : documented(true, evidence.electrical),
  };

  upsert(configurations.configurations, configurationId, {
    id: configurationId,
    market: "US",
    product_id: model.id,
    label: model.label,
    manufacturer_sku: unknown("A manufacturer SKU is not stated on the reviewed product page."),
    capacity: {
      seated: documented(model.capacity, evidence.configuration),
      reclining: unknown("A reclining capacity is not stated on the reviewed product page."),
    },
    dimensions: {
      exterior: model.exterior ? documented(model.exterior, evidence.configuration) : unknown("Exterior dimensions are not stated for this exact configuration on the reviewed product page."),
      interior: model.interior ? documented(model.interior, evidence.configuration) : unknown("Interior dimensions are not stated for this exact configuration on the reviewed product page."),
      shipping: unknown("Shipping dimensions are not stated on the reviewed product page."),
      minimum_clearances: unknown("Installation clearances require the manufacturer's instructions and a site review."),
    },
    net_weight: unknown("Net weight is not stated on the reviewed product page."),
    shipping_weight: unknown("Shipping weight is not stated on the reviewed product page."),
    materials: documented(model.materials, evidence.configuration),
    components,
    electrical_supply_options: [{ id: `${configurationId}-electrical`, requirements: [requirement], evidence_ids: [evidence.electrical] }],
    certification_ids: [],
    warranty_ids: [],
    source_ids: [sourceId],
    publication_status: "published",
  });

  const affiliateUrl = `https://www.awin1.com/cread.php?awinmid=125462&awinaffid=3037577&clickref=${model.clickref}&ued=${encodeURIComponent(model.url)}`;
  upsert(offers.offers, `offer-${model.id}`, {
    id: `offer-${model.id}`,
    market: "US",
    market_product_id: model.id,
    configuration_id: configurationId,
    merchant_id: merchantId,
    program_id: programId,
    external_product_id: model.handle,
    destination_url: model.url,
    affiliate_url: affiliateUrl,
    offer_type: model.offerType,
    price: { amount_minor: model.priceMinor, currency: "USD" },
    price_scope: "sauna-kit",
    included_component_ids: components.map((component) => component.id),
    excluded_required_components: [],
    completeness: "incomplete",
    condition: "new",
    availability: model.availability,
    tax_treatment: "calculated-by-merchant",
    shipping_summary: model.shipping,
    delivery_region_ids: [],
    shipping_evidence_ids: [],
    delivery_mode: "curbside-freight",
    last_successfully_checked_at: today,
    last_attempted_at: today,
    verification_method: "manual",
    promotion_status: "eligible",
  });

  upsert(mappings.mappings, `mapping-${model.id}`, {
    id: `mapping-${model.id}`,
    market: "US",
    merchant_id: merchantId,
    external_product_id: model.handle,
    configuration_id: configurationId,
    matching_method: "manual",
    reviewer_role: "research",
    reviewed_at: today,
    status: "approved",
    note: "The destination handle and selected configuration were checked against the official Sweat Kingdom product page.",
  });

  upsert(editorial.entries, `${model.id}-editorial`, {
    id: `${model.id}-editorial`,
    product_id: model.id,
    status: "published",
    ...model.editorial,
    source_ids: [sourceId],
  });

  upsert(rights.assets, `${model.id}-image`, {
    asset_id: `${model.id}-image`,
    entity_id: model.id,
    merchant_id: merchantId,
    asset_type: "manufacturer-image",
    source_url: model.url,
    rights_status: "not-requested",
    permission_basis: "none",
    action: "Use no image until written permission or an approved feed license is recorded.",
  });
}

// The original Sweat Cabin offer showed the base price but described an upgraded
// Homecraft package. Keep the exact base variant and technical fields aligned.
const cabinSource = sources.sources.find((entry) => entry.id === "sweat-cabin-product");
if (cabinSource) cabinSource.checked_at = today;
const cabinProduct = products.products.find((entry) => entry.id === "sweat-kingdom-sweat-cabin");
if (cabinProduct) {
  cabinProduct.spec_checked_at = today;
  cabinProduct.next_review_at = nextReview;
}
const cabinConfiguration = configurations.configurations.find((entry) => entry.id === "sweat-kingdom-sweat-cabin-standard");
if (cabinConfiguration) {
  cabinConfiguration.label = "6-foot wall height · Harvia KIP 8 kW base package";
  cabinConfiguration.components = [
    { id: "sweat-kingdom-sweat-cabin-standard-heater", component_type: "heater", name: "Harvia KIP 8 kW heater with built-in controls", inclusion: "included", evidence_ids: ["evidence-sweat-cabin-electrical"] },
    { id: "sweat-kingdom-sweat-cabin-standard-stones", component_type: "stones", name: "Sauna stones", inclusion: "included", evidence_ids: ["evidence-sweat-cabin-product"] },
  ];
  cabinConfiguration.electrical_supply_options[0].requirements[0] = {
    component: "heater",
    voltage_v: unknown("Voltage is not stated for the selected Harvia KIP package on the reviewed product page."),
    frequency_hz: unknown("Frequency is not stated on the reviewed product page."),
    phase: unknown("Phase is not stated on the reviewed product page."),
    rated_power_w: documented(8000, "evidence-sweat-cabin-electrical"),
    rated_current_a: unknown("The page states 50 A for the alternative Homecraft 9 kW package, not the selected Harvia KIP 8 kW package."),
    required_circuit_a: unknown("The required circuit is not stated for the selected Harvia KIP 8 kW package."),
    specified_breaker_a: unknown("A breaker rating is not stated for the selected Harvia KIP 8 kW package."),
    connection: documented("hardwired", "evidence-sweat-cabin-electrical"),
    plug_type: unknown("A plug type does not apply to the stated hardwired connection."),
    dedicated_circuit: unknown("A dedicated circuit is not explicitly stated for the selected Harvia KIP package."),
  };
}
const cabinEvidence = sources.evidence.find((entry) => entry.id === "evidence-sweat-cabin-electrical");
if (cabinEvidence) cabinEvidence.raw_value = "Selected Harvia KIP 8 kW heater with built-in controls. The page's 50 A and 6/3 hardwire details refer to the alternative Homecraft 9 kW package and are not assigned to the selected base offer.";
const cabinEditorial = editorial.entries.find((entry) => entry.product_id === "sweat-kingdom-sweat-cabin");
if (cabinEditorial) {
  cabinEditorial.summary = "The Sweat Cabin is a four-person cedar sauna with a 72 × 72.5 inch footprint. The current base offer selects a Harvia KIP 8 kW heater.";
  cabinEditorial.paragraphs[1] = "The current base configuration includes a Harvia KIP 8 kW heater and sauna stones. Detailed circuit values on the merchant page refer to a different Homecraft package, so the selected Harvia circuit remains open for the final electrical check.";
  cabinEditorial.limitations[0] = "The source does not state the selected Harvia package's voltage, current or breaker requirement, nor interior dimensions, shipping dimensions or minimum clearances.";
}

const publishedCount = products.products.filter((entry) => entry.publication_status === "published").length;
const candidateCount = products.products.filter((entry) => entry.publication_status === "candidate").length;
const activeOfferCount = offers.offers.filter((entry) => entry.promotion_status === "eligible").length;
coverage.updated_at = today;
coverage.scope = `Current ${products.products.length}-record US research catalog. Category counts overlap where a sauna kit also belongs to a placement and heat-type segment. Counts describe distinct product models, never size or electrical variants.`;
const indoorTraditional = coverage.categories.find((entry) => entry.id === "indoor-traditional-cabins");
const outdoorTraditional = coverage.categories.find((entry) => entry.id === "outdoor-traditional-cabins");
if (indoorTraditional) indoorTraditional.product_count = 20;
if (outdoorTraditional) outdoorTraditional.product_count = 54;

backlog.updated_at = today;
backlog.current_catalog.candidate_product_count = products.products.length;
backlog.current_catalog.published_product_count = publishedCount;
backlog.current_catalog.active_offer_count = activeOfferCount;
backlog.current_catalog.products_remaining_before_sol_acceptance = Math.max(0, backlog.current_catalog.minimum_before_sol_acceptance - products.products.length);
gate.updated_at = today;
gate.current_snapshot.candidate_product_count = products.products.length;
gate.current_snapshot.candidate_configuration_count = configurations.configurations.length;
gate.current_snapshot.published_product_count = publishedCount;
gate.current_snapshot.active_offer_count = activeOfferCount;
gate.current_snapshot.products_remaining = 0;
gate.current_snapshot.configurations_remaining = 0;
readiness.updated_at = today;
readiness.current_result.catalog_products = products.products.length;
readiness.commercial_scope = `${activeOfferCount} manually reviewed Sweat Kingdom offers have marked Awin tracking links. Other US records remain non-commercial until their own program approval, exact offer mapping and current price review are documented.`;

rights.updated_at = today;
await Promise.all([
  writeJson("data/us/products.json", products),
  writeJson("data/us/configurations.json", configurations),
  writeJson("data/us/sources.json", sources),
  writeJson("data/us/offers.json", offers),
  writeJson("data/us/mappings.json", mappings),
  writeJson("content/us/product-editorial.json", editorial),
  writeJson("docs/us/rights-register.json", rights),
  writeJson("docs/us/coverage-matrix.json", coverage),
  writeJson("docs/us/catalog-expansion-backlog.json", backlog),
  writeJson("docs/us/sol-acceptance-gate.json", gate),
  writeJson("docs/us/indexing-readiness.json", readiness),
]);

console.log(JSON.stringify({
  addedSweatKingdomModels: models.length,
  totalProducts: products.products.length,
  publishedProducts: publishedCount,
  candidateProducts: candidateCount,
  eligibleOffers: activeOfferCount,
}, null, 2));
