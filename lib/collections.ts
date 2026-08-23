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
  layout: "space" | "outdoor" | "budget" | "heat" | "capacity" | "technical" | "tradeoff";
  editorial: {
    kicker: string;
    title: string;
    paragraphs: string[];
    pointsTitle: string;
    points: string[];
    callout: string;
  };
  rule: "mini_indoor" | "one_person_indoor" | "small_garden" | "price_under_2500" | "two_person_indoor" | "infrared" | "bio_sauna" | "barrel_sauna" | "price_under_4000" | "four_person" | "three_person" | "finnish" | "area_under_6";
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
  if (rule === "price_under_2500") return product.commercial.offers.some((offer) => offer.price <= 2_500);
  if (rule === "two_person_indoor") {
    return ["indoor", "infrared"].includes(product.category) && product.people.max === 2;
  }
  if (rule === "infrared") return product.category === "infrared";
  if (rule === "bio_sauna") return product.sauna.type === "Bio-Sauna";
  if (rule === "barrel_sauna") return product.category === "outdoor" && product.model.toLocaleLowerCase("de").includes("fasssauna");
  if (rule === "price_under_4000") return product.commercial.offers.some((offer) => offer.price <= 4_000);
  if (rule === "three_person") return product.people.max === 3;
  if (rule === "finnish") return product.sauna.type === "Finnische Sauna";
  if (rule === "area_under_6") return getFootprintSquareMeters(product) <= 6;
  return product.people.max === 4;
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
