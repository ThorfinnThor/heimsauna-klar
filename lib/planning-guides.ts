import guideData from "@/content/de/planning-guides.json";
import navigationData from "@/content/de/planning-navigation.json";
import { getEligibleOffers, products } from "@/lib/products";

export type ContentLink = { href: string; label: string };

export type PlanningSection = {
  title: string;
  copy: string;
  points: string[];
  links_lead?: string;
  links?: ContentLink[];
};

export type PlanningGuide = {
  slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  updated_at: string;
  summary: string;
  catalog_snapshot?: "product_prices";
  catalog_footprint?: boolean;
  catalog_niches?: {
    kicker: string;
    title: string;
    paragraphs: string[];
    sizes: Array<{ width: number; depth: number }>;
    note: string;
  };
  sections: PlanningSection[];
  checklist: string[];
  module_copy: {
    checklist_kicker: string;
    checklist_title: string;
    sources_kicker: string;
    sources_title: string;
    source_note: string;
    related_kicker: string;
    related_title: string;
  };
  sources: Array<{ title: string; url: string; checked_at: string }>;
};

export type PlanningGroup = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  guide_slugs: string[];
  collection_links: ContentLink[];
};

export type PlanningJourney = {
  related_slugs: string[];
  product_href: string;
  product_label: string;
  collection_links: ContentLink[];
};

type PlanningNavigation = {
  collection_links_heading: { kicker: string; title: string };
  groups: PlanningGroup[];
  guide_paths: Record<string, PlanningJourney>;
  footprint_links: Record<"indoor" | "outdoor", Record<string, ContentLink>>;
};

export const planningGuides = guideData as PlanningGuide[];
const planningNavigation = navigationData as PlanningNavigation;
export const planningGroups = planningNavigation.groups;
export const planningCollectionLinksHeading = planningNavigation.collection_links_heading;

export function getFootprintLink(groupId: "indoor" | "outdoor", capacity: string): ContentLink | undefined {
  return planningNavigation.footprint_links[groupId]?.[capacity];
}

export function getPlanningGuide(slug: string) {
  return planningGuides.find((guide) => guide.slug === slug);
}

export function getPlanningJourney(slug: string) {
  return planningNavigation.guide_paths[slug];
}

function median(values: number[]) {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function getPriceSnapshot() {
  const groups = [
    { id: "all", label: "Gesamtkatalog", products },
    { id: "indoor", label: "Indoor-Sauna", products: products.filter((product) => product.category === "indoor") },
    { id: "outdoor", label: "Outdoor-Sauna", products: products.filter((product) => product.category === "outdoor") },
    { id: "infrared", label: "Infrarotkabine", products: products.filter((product) => product.category === "infrared") },
  ];

  return groups.flatMap((group) => {
    const prices = group.products.flatMap((product) => getEligibleOffers(product).map((offer) => offer.price));
    if (prices.length === 0) return [];
    return [{
      id: group.id,
      label: group.label,
      count: prices.length,
      minimum: Math.min(...prices),
      median: median(prices),
      maximum: Math.max(...prices),
    }];
  });
}

export type NicheFitRow = {
  width: number;
  depth: number;
  total: number;
  infrared: number;
  sauna: number;
  steamShower: number;
  plug230: number;
  upTo200cm: number;
};

// Indoor models whose outer footprint fits a niche in either orientation, split by heat type.
export function getNicheFit(sizes: Array<{ width: number; depth: number }>): NicheFitRow[] {
  const indoorProducts = products.filter((product) => product.category === "indoor" || product.category === "infrared");
  return sizes.map(({ width, depth }) => {
    const fitting = indoorProducts.filter(({ dimensions_cm: size }) => (size.width <= width && size.depth <= depth) || (size.width <= depth && size.depth <= width));
    const steamShower = fitting.filter((product) => product.sauna.type.includes("Dampfdusche"));
    const infrared = fitting.filter((product) => !product.sauna.type.includes("Dampfdusche") && product.category === "infrared");
    return {
      width,
      depth,
      total: fitting.length,
      infrared: infrared.length,
      sauna: fitting.length - infrared.length - steamShower.length,
      steamShower: steamShower.length,
      plug230: fitting.filter((product) => product.power.voltage === 230).length,
      upTo200cm: fitting.filter((product) => product.dimensions_cm.height <= 200).length,
    };
  });
}
