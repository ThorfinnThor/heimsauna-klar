import guideData from "@/content/de/planning-guides.json";
import navigationData from "@/content/de/planning-navigation.json";
import type { ChecklistBlock, ContentLink, TextBlock } from "@/lib/content-blocks";
import { getEligibleOffers, products } from "@/lib/products";

export type { ContentLink } from "@/lib/content-blocks";

export type PlanningBlock =
  | TextBlock
  | ChecklistBlock
  | { type: "prices" }
  | { type: "footprint" }
  | { type: "niches" };

export type PlanningGuide = {
  slug: string;
  title: string;
  description: string;
  updated_at: string;
  intro: string[];
  catalog_snapshot?: "product_prices";
  catalog_footprint?: boolean;
  catalog_niches?: {
    title: string;
    paragraphs: string[];
    sizes: Array<{ width: number; depth: number }>;
  };
  blocks: PlanningBlock[];
  sources: Array<{ title: string; url: string; checked_at: string }>;
};

export type PlanningGroup = {
  id: string;
  title: string;
  guide_slugs: string[];
  collection_links: ContentLink[];
};

export type PlanningJourney = {
  related_slugs: string[];
  collection_links: ContentLink[];
};

type PlanningNavigation = {
  groups: PlanningGroup[];
  guide_paths: Record<string, PlanningJourney>;
  footprint_links: Record<"indoor" | "outdoor", Record<string, ContentLink>>;
};

export const planningGuides = guideData as PlanningGuide[];
const planningNavigation = navigationData as PlanningNavigation;
export const planningGroups = planningNavigation.groups;

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
    { id: "all", label: "Alle Modelle", products },
    { id: "indoor", label: "Innensauna", products: products.filter((product) => product.category === "indoor") },
    { id: "outdoor", label: "Gartensauna", products: products.filter((product) => product.category === "outdoor") },
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
