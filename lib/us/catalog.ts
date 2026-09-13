import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import offersDocument from "../../data/us/offers.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import publicationDocument from "../../data/us/publication.json" with { type: "json" };
import sourcesDocument from "../../data/us/sources.json" with { type: "json" };
import { markets } from "../markets.ts";
import type { UsMarketProduct, UsProductConfiguration, UsSource } from "./types.ts";

const products = productsDocument.products as UsMarketProduct[];
const configurations = configurationsDocument.configurations as UsProductConfiguration[];
const sources = sourcesDocument.sources as UsSource[];

export const usPublication = publicationDocument;

export function getUsResearchProducts(): UsMarketProduct[] {
  return products;
}

export function getUsPublicProducts(): UsMarketProduct[] {
  if (!markets.US.enabled) return [];
  return products.filter((product) => product.publication_status === "published");
}

export function getUsProductBySlug(slug: string, options: { includeNonPublic?: boolean } = {}): UsMarketProduct | undefined {
  const candidates = options.includeNonPublic ? products : getUsPublicProducts();
  return candidates.find((product) => product.slug === slug);
}

export function getUsConfigurationsForProduct(productId: string): UsProductConfiguration[] {
  return configurations.filter((configuration) => configuration.product_id === productId);
}

export function getUsSources(sourceIds: string[]): UsSource[] {
  const requested = new Set(sourceIds);
  return sources.filter((source) => requested.has(source.id));
}

export function getUsResearchStats() {
  return {
    products: products.length,
    configurations: configurations.length,
    offers: offersDocument.offers.length,
    publicProducts: getUsPublicProducts().length,
  };
}
