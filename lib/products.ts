import productData from "@/data/products.json";

export type Product = {
  product_id: string;
  brand: string;
  model: string;
  family: { id: string; name: string; variant: string } | null;
  category: "indoor" | "outdoor" | "infrared" | "portable" | "tent";
  status: "draft" | "verified" | "archived";
  dimensions_cm: { width: number; depth: number; height: number };
  people: { min: number; max: number; seats: number; lying_places: number };
  power: {
    voltage: number | "wood" | "none";
    kw: number | null;
    plug_type: string | null;
    electrician_required: boolean;
    notes: string;
  };
  sauna: {
    type: string;
    indoor_outdoor: "indoor" | "outdoor";
    heater_type: string;
    max_temp_c: number | null;
    heat_up_time_min: number | null;
    wood_type: string;
  };
  commercial: {
    currency: string;
    price_status: "from" | "current" | "unavailable";
    offers: Array<{
      merchant: string;
      price: number;
      availability: string;
      url: string;
      affiliate: boolean;
      last_checked: string;
      configuration?: string;
      selection_required?: boolean;
    }>;
  };
  editorial: {
    pros: string[];
    cons: string[];
    ideal_for: string[];
    not_for: string[];
    test_status: "not_tested" | "hands_on" | "lab_tested";
    editorial_score: number | null;
    disclosure: string;
  };
  sources: Array<{ type: string; title: string; url: string; checked_at: string }>;
  updated_at: string;
};

export const products = (productData as Product[]).filter((product) => product.status === "verified");

export type FinderFilters = {
  place: "indoor" | "outdoor" | "mobile";
  people: "1" | "2" | "4" | "flex";
  footprint: "compact" | "standard" | "open";
  power: "230" | "400" | "unknown";
  budget: "lean" | "mid" | "open";
};

export type FinderMatch = {
  product: Product;
  footprintM2: number;
  reasons: string[];
};

export type FinderRelaxation = {
  key: "people" | "footprint" | "power" | "budget";
  value: FinderFilters["people"] | FinderFilters["footprint"] | FinderFilters["power"] | FinderFilters["budget"];
  label: string;
  matchCount: number;
};

export type FinderResult = {
  matches: FinderMatch[];
  featuredMatches: FinderMatch[];
  relaxations: FinderRelaxation[];
};

export function getProduct(productId: string) {
  return products.find((product) => product.product_id === productId);
}

export function getProductFamily(product: Product) {
  if (!product.family) return [];
  return products.filter((candidate) => candidate.family?.id === product.family?.id);
}

export function getLowestOffer(product: Product) {
  return product.commercial.offers.reduce<Product["commercial"]["offers"][number] | undefined>(
    (lowest, offer) => !lowest || offer.price < lowest.price ? offer : lowest,
    undefined,
  );
}

export function formatOfferPrice(offer: Product["commercial"]["offers"][number], currency: string) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(offer.price);
}

export function formatPrice(product: Product) {
  const offer = getLowestOffer(product);
  if (!offer) return "Preis nicht verfügbar";
  const value = formatOfferPrice(offer, product.commercial.currency);
  return product.commercial.price_status === "from" ? `ab ${value}` : value;
}

export function formatVoltage(voltage: Product["power"]["voltage"]) {
  if (typeof voltage === "number") return `${voltage} V`;
  if (voltage === "wood") return "Holz";
  return "nicht ausgewiesen";
}

export function formatPower(kw: Product["power"]["kw"]) {
  if (kw === null) return "nicht ausgewiesen";
  return `${kw.toLocaleString("de-DE", { maximumFractionDigits: 2 })} kW`;
}

export function formatGermanDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function getLatestOfferCheck(productList: Product[]) {
  return productList
    .flatMap((product) => product.commercial.offers.map((offer) => offer.last_checked))
    .sort((a, b) => b.localeCompare(a))[0] ?? null;
}

const footprintLimits = { compact: 3, standard: 6 } as const;
const budgetLimits = { lean: 2500, mid: 6000 } as const;

function getFootprintM2(product: Product) {
  return product.dimensions_cm.width * product.dimensions_cm.depth / 10_000;
}

function getLowestPrice(product: Product) {
  if (product.commercial.offers.length === 0) return null;
  return Math.min(...product.commercial.offers.map((offer) => offer.price));
}

function matchesFinderFilters(product: Product, filters: FinderFilters, ignored?: FinderRelaxation["key"]) {
  const matchesPlace = filters.place === "mobile"
    ? product.category === "portable" || product.category === "tent"
    : product.sauna.indoor_outdoor === filters.place;
  if (!matchesPlace) return false;

  if (ignored !== "people" && filters.people !== "flex" && product.people.max < Number(filters.people)) return false;
  if (ignored !== "footprint" && filters.footprint !== "open" && getFootprintM2(product) > footprintLimits[filters.footprint]) return false;
  if (ignored !== "power" && filters.power !== "unknown" && product.power.voltage !== Number(filters.power)) return false;

  if (ignored !== "budget" && filters.budget !== "open") {
    const price = getLowestPrice(product);
    if (price === null || price > budgetLimits[filters.budget]) return false;
  }

  return true;
}

function getMatchReasons(product: Product, filters: FinderFilters, footprintM2: number) {
  const reasons = [
    filters.place === "outdoor" ? "für außen dokumentiert" : filters.place === "mobile" ? "mobil dokumentiert" : "für innen dokumentiert",
    `bis ${product.people.max} ${product.people.max === 1 ? "Person" : "Personen"}`,
    `${footprintM2.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m² Produktfläche`,
  ];

  if (filters.power !== "unknown") reasons.push(`${filters.power} V ausgewiesen`);
  if (filters.budget !== "open") reasons.push(`bis ${budgetLimits[filters.budget].toLocaleString("de-DE")} €`);
  return reasons;
}

function selectDiverseMatches(matches: FinderMatch[], limit: number) {
  const selected: FinderMatch[] = [];
  const seenFamilies = new Set<string>();

  for (const match of matches) {
    const familyKey = match.product.family?.id ?? match.product.product_id;
    if (seenFamilies.has(familyKey)) continue;
    selected.push(match);
    seenFamilies.add(familyKey);
    if (selected.length === limit) return selected;
  }

  for (const match of matches) {
    if (selected.some((candidate) => candidate.product.product_id === match.product.product_id)) continue;
    selected.push(match);
    if (selected.length === limit) break;
  }

  return selected;
}

export function findProductsForFinder(productList: Product[], filters: FinderFilters): FinderResult {
  const requestedPeople = filters.people === "flex" ? null : Number(filters.people);
  const matches = productList
    .filter((product) => matchesFinderFilters(product, filters))
    .map((product) => {
      const footprintM2 = getFootprintM2(product);
      return { product, footprintM2, reasons: getMatchReasons(product, filters, footprintM2) };
    })
    .sort((a, b) => {
      const capacityGapA = requestedPeople === null ? 0 : a.product.people.max - requestedPeople;
      const capacityGapB = requestedPeople === null ? 0 : b.product.people.max - requestedPeople;
      if (capacityGapA !== capacityGapB) return capacityGapA - capacityGapB;
      if (a.footprintM2 !== b.footprintM2) return a.footprintM2 - b.footprintM2;
      const priceA = getLowestPrice(a.product) ?? Number.POSITIVE_INFINITY;
      const priceB = getLowestPrice(b.product) ?? Number.POSITIVE_INFINITY;
      return priceA - priceB || `${a.product.brand} ${a.product.model}`.localeCompare(`${b.product.brand} ${b.product.model}`, "de");
    });

  const relaxationDefinitions: Array<Omit<FinderRelaxation, "matchCount"> & { active: boolean }> = [
    { key: "people", value: "flex", label: "Personenzahl öffnen", active: filters.people !== "flex" },
    { key: "footprint", value: "open", label: "Fläche öffnen", active: filters.footprint !== "open" },
    { key: "power", value: "unknown", label: "Anschluss offenlassen", active: filters.power !== "unknown" },
    { key: "budget", value: "open", label: "Budget öffnen", active: filters.budget !== "open" },
  ];
  const relaxations = relaxationDefinitions.flatMap(({ active, ...relaxation }) => {
    if (!active) return [];
    const matchCount = productList.filter((product) => matchesFinderFilters(product, filters, relaxation.key)).length;
    return matchCount > 0 ? [{ ...relaxation, matchCount }] : [];
  });

  return {
    matches,
    featuredMatches: selectDiverseMatches(matches, 4),
    relaxations,
  };
}
