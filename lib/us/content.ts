import editorialDocument from "../../content/us/editorial.json" with { type: "json" };
import homeDocument from "../../content/us/home.json" with { type: "json" };
import legalDocument from "../../content/us/legal.json" with { type: "json" };
import presentationsDocument from "../../content/us/page-presentations.json" with { type: "json" };
import productEditorialDocument from "../../content/us/product-editorial.json" with { type: "json" };
import publicationDocument from "../../data/us/publication.json" with { type: "json" };
import { markets } from "../markets.ts";
import { getUsResearchConfigurations, getUsResearchProducts, getUsSources } from "./catalog.ts";
import type {
  UsBrandPage,
  UsComparisonPage,
  UsEditorialPage,
  UsEditorialPageType,
  UsGuidePage,
  UsHomePage,
  UsPagePresentation,
  UsProductEditorial,
  UsTrustPage,
} from "./content-types.ts";
import type { UsFact, UsMarketProduct, UsProductConfiguration } from "./types.ts";

const editorialPages = editorialDocument.entries as UsEditorialPage[];
const homePage = homeDocument as UsHomePage;
const trustPages = legalDocument.pages as UsTrustPage[];
const presentations = presentationsDocument.entries as UsPagePresentation[];
const productEditorialEntries = productEditorialDocument.entries as UsProductEditorial[];

type ContentOptions = { includeNonPublic?: boolean };

export type UsEditorialProduct = {
  product: UsMarketProduct;
  configuration: UsProductConfiguration;
};

export function isUsResearchPreview() {
  return !markets.US.enabled || !publicationDocument.indexing_enabled;
}

function isAvailable(status: UsMarketProduct["publication_status"], includeNonPublic: boolean) {
  return includeNonPublic || status === "published";
}

function contentDocumentIsAvailable(status: string, includeNonPublic: boolean) {
  return includeNonPublic || status === "published";
}

export function usEditorialPath(page: Pick<UsEditorialPage, "page_type" | "slug">) {
  const section = page.page_type === "comparison" ? "compare" : `${page.page_type}s`;
  return `/us/${section}/${page.slug}/`;
}

export function getUsEditorialPages(pageType?: UsEditorialPageType, options: ContentOptions = {}) {
  const includeNonPublic = options.includeNonPublic ?? false;
  if (!contentDocumentIsAvailable(editorialDocument.status, includeNonPublic)) return [];
  return editorialPages.filter((page) =>
    (!pageType || page.page_type === pageType) && isAvailable(page.publication_status, includeNonPublic));
}

export function getUsHomePage(options: ContentOptions = {}) {
  const includeNonPublic = options.includeNonPublic ?? false;
  return contentDocumentIsAvailable(homeDocument.status, includeNonPublic) ? homePage : undefined;
}

export function getUsEditorialPage(pageType: UsEditorialPageType, slug: string, options: ContentOptions = {}) {
  return getUsEditorialPages(pageType, options).find((page) => page.slug === slug);
}

export function getUsPresentation(id: string, pageType: UsEditorialPageType) {
  return presentations.find((entry) => entry.id === id && entry.page_type === pageType);
}

export function getUsProductEditorial(productId: string, options: ContentOptions = {}) {
  const includeNonPublic = options.includeNonPublic ?? false;
  if (!contentDocumentIsAvailable(productEditorialDocument.status, includeNonPublic)) return undefined;
  return productEditorialEntries.find((entry) => entry.product_id === productId
    && isAvailable(entry.status, includeNonPublic));
}

export function getUsTrustPage(slug: UsTrustPage["slug"], options: ContentOptions = {}) {
  const includeNonPublic = options.includeNonPublic ?? false;
  if (!contentDocumentIsAvailable(legalDocument.status, includeNonPublic)) return undefined;
  return trustPages.find((page) => page.slug === slug && isAvailable(page.publication_status, includeNonPublic));
}

function documentedIncludes<T>(fact: UsFact<T[]>, requested: T[]) {
  return fact.status === "documented" && requested.some((value) => fact.value.includes(value));
}

function documentedEqualsAny<T>(fact: UsFact<T>, requested: T[]) {
  return fact.status === "documented" && requested.includes(fact.value);
}

function documentedValue<T>(fact: UsFact<T>) {
  return fact.status === "documented" ? fact.value : null;
}

function configurationHasVoltage(configuration: UsProductConfiguration, voltages: number[]) {
  return configuration.electrical_supply_options.some((option) => option.requirements.some((requirement) => {
    const voltage = documentedValue(requirement.voltage_v);
    return voltage !== null && voltages.includes(voltage);
  }));
}

export function selectUsComparisonConfigurations(
  page: UsComparisonPage,
  options: ContentOptions & { products?: UsMarketProduct[]; configurations?: UsProductConfiguration[] } = {},
): UsEditorialProduct[] {
  const includeNonPublic = options.includeNonPublic ?? false;
  const selection = page.selection;
  const products = (options.products ?? getUsResearchProducts()).filter((product) => isAvailable(product.publication_status, includeNonPublic));
  const configurations = (options.configurations ?? getUsResearchConfigurations())
    .filter((configuration) => isAvailable(configuration.publication_status, includeNonPublic));

  const selected: UsEditorialProduct[] = [];
  for (const product of products) {
    if (selection.product_ids?.length && !selection.product_ids.includes(product.id)) continue;
    if (selection.product_types?.length && !documentedEqualsAny(product.product_type, selection.product_types)) continue;
    if (selection.heat_types?.length && !documentedEqualsAny(product.heat_type, selection.heat_types)) continue;
    if (selection.placements?.length && !documentedIncludes(product.placements, selection.placements)) continue;
    if (selection.brands?.length && !selection.brands.includes(product.brand_name)) continue;

    for (const configuration of configurations.filter((entry) => entry.product_id === product.id)) {
      const seated = documentedValue(configuration.capacity.seated);
      if (selection.minimum_seated_capacity !== undefined && (seated === null || seated < selection.minimum_seated_capacity)) continue;
      if (selection.voltages_v?.length && !configurationHasVoltage(configuration, selection.voltages_v)) continue;
      selected.push({ product, configuration });
    }
  }

  return selected.sort((left, right) =>
    left.product.brand_name.localeCompare(right.product.brand_name, "en-US")
    || left.product.model.localeCompare(right.product.model, "en-US")
    || left.configuration.id.localeCompare(right.configuration.id, "en-US"));
}

export function selectUsBrandConfigurations(
  page: UsBrandPage,
  options: ContentOptions & { products?: UsMarketProduct[]; configurations?: UsProductConfiguration[] } = {},
): UsEditorialProduct[] {
  const syntheticComparison: UsComparisonPage = {
    ...page,
    page_type: "comparison",
    selection: { brands: [page.brand_name] },
  };
  return selectUsComparisonConfigurations(syntheticComparison, options);
}

export function selectUsGuideConfigurations(
  page: UsGuidePage,
  options: ContentOptions & { products?: UsMarketProduct[]; configurations?: UsProductConfiguration[] } = {},
): UsEditorialProduct[] {
  if (!page.linked_product_ids?.length) return [];
  const syntheticComparison: UsComparisonPage = {
    ...page,
    page_type: "comparison",
    selection: { product_ids: page.linked_product_ids },
  };
  return selectUsComparisonConfigurations(syntheticComparison, options);
}

export function getUsEditorialSources(page: UsEditorialPage) {
  return getUsSources(page.source_ids);
}

export function getUsHomeSources(page: UsHomePage) {
  return getUsSources(page.source_ids);
}
