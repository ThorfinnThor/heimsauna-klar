import collectionData from "@/content/de/collections.json";
import { products, type Product } from "@/lib/products";

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
  rule: "mini_indoor" | "one_person_indoor" | "small_garden" | "price_under_2500";
  sort: "footprint" | "price";
  criteria: string[];
  checks: string[];
};

export const collections = collectionData as Collection[];

export function getCollection(section: string, slug: string) {
  return collections.find((collection) => collection.section === section && collection.slug === slug);
}

export function getFootprintSquareMeters(product: Product) {
  return (product.dimensions_cm.width * product.dimensions_cm.depth) / 10_000;
}

export function getLowestPrice(product: Product) {
  return Math.min(...product.commercial.offers.map((offer) => offer.price));
}

function matchesCollection(product: Product, rule: Collection["rule"]) {
  if (rule === "mini_indoor") {
    return ["indoor", "infrared"].includes(product.category) && getFootprintSquareMeters(product) <= 3;
  }
  if (rule === "one_person_indoor") {
    return ["indoor", "infrared"].includes(product.category) && product.people.max === 1;
  }
  if (rule === "small_garden") {
    return product.category === "outdoor" && getFootprintSquareMeters(product) <= 5;
  }
  return product.commercial.offers.some((offer) => offer.price <= 2_500);
}

export function getCollectionProducts(collection: Collection) {
  return products
    .filter((product) => matchesCollection(product, collection.rule))
    .sort((a, b) => {
      const primary = collection.sort === "price"
        ? getLowestPrice(a) - getLowestPrice(b)
        : getFootprintSquareMeters(a) - getFootprintSquareMeters(b);
      return primary || a.model.localeCompare(b.model, "de");
    });
}
