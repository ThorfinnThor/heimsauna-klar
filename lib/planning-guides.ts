import guideData from "@/content/de/planning-guides.json";
import navigationData from "@/content/de/planning-navigation.json";
import { products } from "@/lib/products";

export type PlanningGuide = {
  slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  updated_at: string;
  summary: string;
  catalog_snapshot?: "product_prices";
  sections: Array<{ title: string; copy: string; points: string[] }>;
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
};

export type PlanningJourney = {
  related_slugs: string[];
  product_href: string;
  product_label: string;
};

type PlanningNavigation = {
  groups: PlanningGroup[];
  guide_paths: Record<string, PlanningJourney>;
};

export const planningGuides = guideData as PlanningGuide[];
const planningNavigation = navigationData as PlanningNavigation;
export const planningGroups = planningNavigation.groups;

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
    const prices = group.products.flatMap((product) => product.commercial.offers.map((offer) => offer.price));
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
