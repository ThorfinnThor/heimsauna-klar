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
      affiliate_url?: string;
      affiliate_program_id?: string;
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

export function getCatalogStats(productList: Product[] = products) {
  const categoryCounts = {
    indoor: productList.filter((product) => product.category === "indoor").length,
    outdoor: productList.filter((product) => product.category === "outdoor").length,
    infrared: productList.filter((product) => product.category === "infrared").length,
    mobile: productList.filter((product) => product.category === "portable" || product.category === "tent").length,
  };

  return {
    total: productList.length,
    categoryCounts,
    sourceCount: productList.reduce((total, product) => total + product.sources.length, 0),
    latestUpdate: productList.map((product) => product.updated_at).sort((a, b) => b.localeCompare(a))[0] ?? null,
  };
}

export type FinderFilters = {
  place: "indoor" | "outdoor" | "mobile";
  people: "1" | "2" | "4" | "flex";
  footprint: "compact" | "standard" | "open";
  power: "230" | "400" | "wood" | "unknown";
  budget: "lean" | "mid" | "open";
  heat: "traditional" | "infrared" | "open";
};

export type FinderMatch = {
  product: Product;
  footprintM2: number;
  reasons: string[];
};

export type FinderAlternative = FinderMatch & {
  differences: string[];
};

export type FinderRelaxation = {
  key: "people" | "footprint" | "power" | "budget" | "heat";
  value: FinderFilters["people"] | FinderFilters["footprint"] | FinderFilters["power"] | FinderFilters["budget"] | FinderFilters["heat"];
  label: string;
  matchCount: number;
};

export type FinderResult = {
  matches: FinderMatch[];
  featuredMatches: FinderMatch[];
  alternativeMatches: FinderAlternative[];
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

export function matchesProductPlace(product: Product, place: FinderFilters["place"]) {
  if (place === "mobile") return product.category === "portable" || product.category === "tent";
  if (place === "outdoor") return product.category === "outdoor";
  return product.category === "indoor" || product.category === "infrared";
}

function matchesFinderPlaceAndHeat(product: Product, filters: Pick<FinderFilters, "place" | "heat">) {
  if (!matchesProductPlace(product, filters.place)) return false;
  if (filters.heat === "open") return true;
  const isInfrared = product.category === "infrared";
  return filters.heat === "infrared" ? isInfrared : !isInfrared;
}

export function hasFinderPlaceVariant(productList: Product[], place: FinderFilters["place"]) {
  return productList.some((product) => matchesProductPlace(product, place));
}

export function hasFinderHeatVariant(
  productList: Product[],
  filters: Pick<FinderFilters, "place">,
  heat: Exclude<FinderFilters["heat"], "open">,
) {
  return productList.some((product) => matchesFinderPlaceAndHeat(product, { ...filters, heat }));
}

export function hasFinderPowerVariant(productList: Product[], filters: Pick<FinderFilters, "place" | "heat">, voltage: number | "wood") {
  return productList.some((product) => matchesFinderPlaceAndHeat(product, filters) && product.power.voltage === voltage);
}

function matchesFinderPower(product: Product, power: FinderFilters["power"]) {
  if (power === "unknown") return true;
  return product.power.voltage === (power === "wood" ? "wood" : Number(power));
}

function formatFinderPower(power: Exclude<FinderFilters["power"], "unknown">) {
  return power === "wood" ? "Holzofen" : `${power} V`;
}

function matchesFinderFilters(product: Product, filters: FinderFilters, ignored?: FinderRelaxation["key"]) {
  if (!matchesProductPlace(product, filters.place)) return false;
  if (ignored !== "heat" && filters.heat !== "open") {
    const isInfrared = product.category === "infrared";
    if (filters.heat === "infrared" ? !isInfrared : isInfrared) return false;
  }

  if (ignored !== "people" && filters.people !== "flex" && product.people.max < Number(filters.people)) return false;
  if (ignored !== "footprint" && filters.footprint !== "open" && getFootprintM2(product) > footprintLimits[filters.footprint]) return false;
  if (ignored !== "power" && !matchesFinderPower(product, filters.power)) return false;

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

  if (filters.power !== "unknown") reasons.push(`${formatFinderPower(filters.power)} ausgewiesen`);
  if (filters.budget !== "open") reasons.push(`bis ${budgetLimits[filters.budget].toLocaleString("de-DE")} €`);
  if (filters.heat === "infrared") reasons.push("Infrarotkabine");
  if (filters.heat === "traditional") reasons.push("klassische Saunakabine");
  return reasons;
}

function getAlternativeDifferences(product: Product, filters: FinderFilters, footprintM2: number) {
  const differences: string[] = [];

  if (filters.heat !== "open") {
    const isInfrared = product.category === "infrared";
    if (filters.heat === "infrared" ? !isInfrared : isInfrared) {
      differences.push(filters.heat === "infrared" ? "klassische Wärme statt Infrarot" : "Infrarot statt klassischer Sauna");
    }
  }

  if (filters.people !== "flex" && product.people.max < Number(filters.people)) {
    differences.push(`bis ${product.people.max} statt ${filters.people} Personen`);
  }

  if (filters.footprint !== "open" && footprintM2 > footprintLimits[filters.footprint]) {
    differences.push(`${footprintM2.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m² statt bis ${footprintLimits[filters.footprint]} m²`);
  }

  if (filters.power !== "unknown" && !matchesFinderPower(product, filters.power)) {
    const actualPower = product.power.voltage === "wood"
      ? "Holzofen"
      : product.power.voltage === "none"
        ? "Anschluss nicht ausgewiesen"
        : `${product.power.voltage} V`;
    differences.push(`${actualPower} statt ${formatFinderPower(filters.power)}`);
  }

  if (filters.budget !== "open") {
    const lowestPrice = getLowestPrice(product);
    const budgetLimit = budgetLimits[filters.budget];
    if (lowestPrice === null) {
      differences.push("Preis nicht verfügbar");
    } else if (lowestPrice > budgetLimit) {
      differences.push(`${lowestPrice.toLocaleString("de-DE", { style: "currency", currency: product.commercial.currency })} statt bis ${budgetLimit.toLocaleString("de-DE")} €`);
    }
  }

  return differences;
}

function selectDiverseMatches<T extends FinderMatch>(matches: T[], limit: number) {
  const selected: T[] = [];
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
    { key: "heat", value: "open", label: "Wärmeart öffnen", active: filters.heat !== "open" },
  ];
  const relaxations = relaxationDefinitions.flatMap(({ active, ...relaxation }) => {
    if (!active) return [];
    const matchCount = productList.filter((product) => matchesFinderFilters(product, filters, relaxation.key)).length;
    return matchCount > 0 ? [{ ...relaxation, matchCount }] : [];
  });

  const alternativeMatches = matches.length > 0
    ? []
    : selectDiverseMatches(
      productList
        .filter((product) => matchesProductPlace(product, filters.place))
        .map((product) => {
          const footprintM2 = getFootprintM2(product);
          return {
            product,
            footprintM2,
            reasons: getMatchReasons(product, filters, footprintM2),
            differences: getAlternativeDifferences(product, filters, footprintM2),
          };
        })
        .sort((a, b) => {
          if (a.differences.length !== b.differences.length) return a.differences.length - b.differences.length;
          const requestedCapacity = filters.people === "flex" ? null : Number(filters.people);
          const capacityGapA = requestedCapacity === null ? 0 : Math.abs(a.product.people.max - requestedCapacity);
          const capacityGapB = requestedCapacity === null ? 0 : Math.abs(b.product.people.max - requestedCapacity);
          if (capacityGapA !== capacityGapB) return capacityGapA - capacityGapB;
          const priceA = getLowestPrice(a.product) ?? Number.POSITIVE_INFINITY;
          const priceB = getLowestPrice(b.product) ?? Number.POSITIVE_INFINITY;
          return priceA - priceB || a.footprintM2 - b.footprintM2;
        }),
      4,
    );

  return {
    matches,
    featuredMatches: selectDiverseMatches(matches, 4),
    alternativeMatches,
    relaxations,
  };
}
