import collectionData from "@/content/de/collections.json";
import { getEligibleOffers, products, type Product } from "@/lib/products";

export type CollectionRule = "mini_indoor" | "one_person_indoor" | "small_garden" | "price_under_2500" | "two_person_indoor" | "infrared" | "bio_sauna" | "barrel_sauna" | "price_under_4000" | "four_person" | "three_person_indoor" | "finnish" | "area_under_6";

export type CollectionFilter = {
  brands?: string[];
  categories?: Product["category"][];
  sauna_types?: string[];
  voltages?: Product["power"]["voltage"][];
  people_exact?: number;
  people_min?: number;
  price_max?: number;
  footprint_min?: number;
  footprint_max?: number;
  width_max?: number;
  depth_max?: number;
  height_max?: number;
  lying_places_min?: number;
  heater_contains?: string;
  wood_contains?: string;
};

export type Collection = {
  id: string;
  section: "indoor-sauna" | "outdoor-sauna" | "vergleiche";
  slug: string;
  kind: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  intro: string;
  layout: "space" | "outdoor" | "budget" | "heat" | "capacity" | "technical" | "tradeoff";
  indexable?: boolean;
  related_ids: string[];
  planning: {
    kicker: string;
    intro: string;
    guide_ids: string[];
  };
  editorial: {
    kicker: string;
    title: string;
    paragraphs: string[];
    pointsTitle: string;
    points: string[];
    callout: string;
  };
  profile?: {
    kicker: string;
    title: string;
    paragraphs: string[];
    fit_checks: Array<{ width: number; depth: number }>;
    note: string;
  };
  rule?: CollectionRule;
  filters?: CollectionFilter;
  sort: "footprint" | "price";
  criteria: string[];
  checks: string[];
  module_copy: {
    method_kicker: string;
    method_title: string;
    method_note: string;
    results_kicker: string;
    results_title: string;
    results_intro: string;
    checks_kicker: string;
    checks_title: string;
    related_kicker: string;
    related_title: string;
  };
};

export const collections = collectionData as Collection[];
export const indexableCollections = collections.filter((collection) => collection.indexable !== false);

export const collectionSectionLabels: Record<Collection["section"], string> = {
  "indoor-sauna": "Indoor-Sauna",
  "outdoor-sauna": "Outdoor-Sauna",
  vergleiche: "Weitere Vergleiche",
};

export function getCollectionPath(collection: Pick<Collection, "section" | "slug">) {
  return `/de/${collection.section}/${collection.slug}/`;
}

export function getCollection(section: string, slug: string) {
  return collections.find((collection) => collection.section === section && collection.slug === slug);
}

export function getFootprintSquareMeters(product: Product) {
  return (product.dimensions_cm.width * product.dimensions_cm.depth) / 10_000;
}

export function getLowestPrice(product: Product) {
  const offers = getEligibleOffers(product);
  return offers.length > 0 ? Math.min(...offers.map((offer) => offer.price)) : null;
}

function matchesLegacyRule(product: Product, rule: CollectionRule) {
  if (rule === "mini_indoor") {
    return ["indoor", "infrared"].includes(product.category) && getFootprintSquareMeters(product) <= 3;
  }
  if (rule === "one_person_indoor") {
    return ["indoor", "infrared"].includes(product.category) && product.people.max === 1;
  }
  if (rule === "small_garden") {
    return product.category === "outdoor" && getFootprintSquareMeters(product) <= 5;
  }
  if (rule === "price_under_2500") return getEligibleOffers(product).some((offer) => offer.price <= 2_500);
  if (rule === "two_person_indoor") {
    return ["indoor", "infrared"].includes(product.category) && product.people.max === 2;
  }
  if (rule === "infrared") return product.category === "infrared";
  if (rule === "bio_sauna") return product.sauna.type === "Bio-Sauna";
  if (rule === "barrel_sauna") return product.category === "outdoor" && product.model.toLocaleLowerCase("de").includes("fasssauna");
  if (rule === "price_under_4000") return getEligibleOffers(product).some((offer) => offer.price <= 4_000);
  if (rule === "three_person_indoor") {
    return ["indoor", "infrared"].includes(product.category) && product.people.max === 3;
  }
  if (rule === "finnish") return product.sauna.type === "Finnische Sauna";
  if (rule === "area_under_6") return getFootprintSquareMeters(product) <= 6;
  return product.people.max === 4;
}

function includesFolded(value: string, needle: string) {
  return value.toLocaleLowerCase("de").includes(needle.toLocaleLowerCase("de"));
}

export function matchesCollectionFilters(product: Product, filters: CollectionFilter) {
  const area = getFootprintSquareMeters(product);
  const price = getLowestPrice(product);
  if (filters.brands && !filters.brands.includes(product.brand)) return false;
  if (filters.categories && !filters.categories.includes(product.category)) return false;
  if (filters.sauna_types && !filters.sauna_types.includes(product.sauna.type)) return false;
  if (filters.voltages && !filters.voltages.includes(product.power.voltage)) return false;
  if (filters.people_exact !== undefined && product.people.max !== filters.people_exact) return false;
  if (filters.people_min !== undefined && product.people.max < filters.people_min) return false;
  if (filters.price_max !== undefined && (price === null || price > filters.price_max)) return false;
  if (filters.footprint_min !== undefined && area < filters.footprint_min) return false;
  if (filters.footprint_max !== undefined && area > filters.footprint_max) return false;
  if (filters.width_max !== undefined && product.dimensions_cm.width > filters.width_max) return false;
  if (filters.depth_max !== undefined && product.dimensions_cm.depth > filters.depth_max) return false;
  if (filters.height_max !== undefined && product.dimensions_cm.height > filters.height_max) return false;
  if (filters.lying_places_min !== undefined && product.people.lying_places < filters.lying_places_min) return false;
  if (filters.heater_contains && !includesFolded(product.sauna.heater_type, filters.heater_contains)) return false;
  if (filters.wood_contains && !includesFolded(product.sauna.wood_type, filters.wood_contains)) return false;
  return true;
}

function matchesCollection(product: Product, collection: Collection) {
  if (collection.filters) return matchesCollectionFilters(product, collection.filters);
  if (collection.rule) return matchesLegacyRule(product, collection.rule);
  return false;
}

export function getCollectionProducts(collection: Collection) {
  return products
    .filter((product) => matchesCollection(product, collection))
    .sort((a, b) => {
      const primary = collection.sort === "price"
        ? (getLowestPrice(a) ?? Number.POSITIVE_INFINITY) - (getLowestPrice(b) ?? Number.POSITIVE_INFINITY)
        : getFootprintSquareMeters(a) - getFootprintSquareMeters(b);
      return primary || a.model.localeCompare(b.model, "de");
    });
}

export type DimensionProfileRow = {
  label: string;
  count: number;
  medianWidth: number;
  medianDepth: number;
  minFootprint: number;
  maxFootprint: number;
  maxHeight: number;
  plugCount: number;
  lyingCount: number;
  lowestPrice: number | null;
  medianPrice: number | null;
};

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function summarizeDimensions(label: string, group: Product[]): DimensionProfileRow {
  const footprints = group.map(getFootprintSquareMeters);
  const prices = group.map(getLowestPrice).filter((price): price is number => price !== null);
  return {
    label,
    count: group.length,
    medianWidth: median(group.map((product) => product.dimensions_cm.width)),
    medianDepth: median(group.map((product) => product.dimensions_cm.depth)),
    minFootprint: Math.min(...footprints),
    maxFootprint: Math.max(...footprints),
    maxHeight: Math.max(...group.map((product) => product.dimensions_cm.height)),
    plugCount: group.filter((product) => product.power.voltage === 230).length,
    lyingCount: group.filter((product) => product.people.lying_places >= 1).length,
    lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
    medianPrice: prices.length > 0 ? median(prices) : null,
  };
}

// Per heat type, largest group first, followed by a row for all candidates.
export function getDimensionProfile(candidates: Product[]) {
  const groups = new Map<string, Product[]>();
  for (const product of candidates) groups.set(product.sauna.type, [...(groups.get(product.sauna.type) ?? []), product]);
  const rows = [...groups.entries()]
    .sort(([leftType, left], [rightType, right]) => right.length - left.length || leftType.localeCompare(rightType, "de"))
    .map(([type, group]) => summarizeDimensions(type, group));
  return { rows, total: summarizeDimensions("Alle Modelle", candidates) };
}

export function countFittingProducts(candidates: Product[], width: number, depth: number) {
  return candidates.filter(({ dimensions_cm: size }) => (size.width <= width && size.depth <= depth) || (size.width <= depth && size.depth <= width)).length;
}
