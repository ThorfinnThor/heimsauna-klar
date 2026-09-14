import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import publicationDocument from "../../data/us/publication.json" with { type: "json" };
import editorialDocument from "../../content/us/editorial.json" with { type: "json" };
import homeDocument from "../../content/us/home.json" with { type: "json" };
import legalDocument from "../../content/us/legal.json" with { type: "json" };

import type { Metadata } from "next";
import { markets } from "../markets.ts";
import { createPageMetadata } from "../metadata.ts";
import type { UsEditorialPage, UsTrustPage } from "./content-types.ts";
import type { UsMarketProduct, UsProductConfiguration, UsPublicationStatus } from "./types.ts";

export type UsSeoPageClass = "overview" | "detail" | "tool";

type UsSeoDecisionInput = {
  path: string;
  pageClass: UsSeoPageClass;
  publicationStatus?: UsPublicationStatus;
  hasPublishedContent?: boolean;
};

export type UsSeoDecision = {
  canonicalPath: string;
  indexable: boolean;
  follow: true;
  sitemap: boolean;
  languageAlternates: Record<string, string>;
};

export type UsSeoReleaseState = {
  routesEnabled: boolean;
  indexingEnabled: boolean;
};

export type UsSitemapEntry = {
  path: string;
  lastModified: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

type UsPageMetadataInput = UsSeoDecisionInput & {
  title: string;
  description: string;
  type?: "article" | "website";
};

const products = productsDocument.products as UsMarketProduct[];
const configurations = configurationsDocument.configurations as UsProductConfiguration[];
const editorialPages = editorialDocument.entries as UsEditorialPage[];
const trustPages = legalDocument.pages as UsTrustPage[];

function normalizeUsPath(path: string) {
  if (!path.startsWith("/us/")) throw new Error(`US SEO paths must start with /us/: ${path}`);
  return path.endsWith("/") ? path : `${path}/`;
}

/**
 * Language alternates are deliberately explicit. No DE/US pair is inferred from
 * matching slugs because navigation similarity does not establish equivalent intent.
 * L-14 may add reviewed reciprocal groups here after an editorial equivalence audit.
 */
export const confirmedUsLanguageAlternates: Readonly<Record<string, Record<string, string>>> = Object.freeze({});

export function getUsLanguageAlternates(path: string): Record<string, string> {
  return confirmedUsLanguageAlternates[normalizeUsPath(path)] ?? {};
}

export function evaluateUsSeoDecision({
  path,
  pageClass,
  publicationStatus = "published",
  hasPublishedContent = true,
}: UsSeoDecisionInput, release: UsSeoReleaseState): UsSeoDecision {
  const canonicalPath = normalizeUsPath(path);
  const canIndex = release.routesEnabled
    && release.indexingEnabled
    && pageClass !== "tool"
    && publicationStatus === "published"
    && hasPublishedContent;

  return {
    canonicalPath,
    indexable: canIndex,
    follow: true,
    sitemap: canIndex,
    languageAlternates: getUsLanguageAlternates(canonicalPath),
  };
}

export function getUsSeoDecision(input: UsSeoDecisionInput): UsSeoDecision {
  return evaluateUsSeoDecision(input, {
    routesEnabled: markets.US.enabled,
    indexingEnabled: publicationDocument.indexing_enabled,
  });
}

export function createUsPageMetadata({
  title,
  description,
  type,
  ...decisionInput
}: UsPageMetadataInput): Metadata {
  const decision = getUsSeoDecision(decisionInput);
  return createPageMetadata({
    title,
    description,
    path: decision.canonicalPath,
    type,
    market: "US",
    indexable: decision.indexable,
    languageAlternates: decision.languageAlternates,
  });
}

export function getUsHomePublicationStatus(): UsPublicationStatus {
  return homeDocument.status === "published" ? "published" : "draft";
}

function publishedConfigurationsForProduct(productId: string) {
  return configurations.filter((configuration) =>
    configuration.product_id === productId && configuration.publication_status === "published");
}

function addOverview(
  entries: UsSitemapEntry[],
  path: string,
  hasPublishedContent: boolean,
  changeFrequency: UsSitemapEntry["changeFrequency"],
  priority: number,
) {
  const decision = getUsSeoDecision({ path, pageClass: "overview", hasPublishedContent });
  if (decision.sitemap) {
    entries.push({ path: decision.canonicalPath, lastModified: publicationDocument.updated_at, changeFrequency, priority });
  }
}

export function getUsSitemapEntries(): UsSitemapEntry[] {
  const entries: UsSitemapEntry[] = [];
  const publishedProducts = products.filter((product) =>
    product.publication_status === "published" && publishedConfigurationsForProduct(product.id).length > 0);
  const editorialAvailable = editorialDocument.status === "published";
  const publishedEditorial = editorialAvailable
    ? editorialPages.filter((page) => page.publication_status === "published")
    : [];
  const legalAvailable = legalDocument.status === "published";
  const publishedTrustPages = legalAvailable
    ? trustPages.filter((page) => page.publication_status === "published")
    : [];

  addOverview(entries, "/us/", homeDocument.status === "published", "weekly", 1);
  addOverview(entries, "/us/saunas/", publishedProducts.length > 0, "weekly", 0.8);
  addOverview(entries, "/us/compare/", publishedEditorial.some((page) => page.page_type === "comparison"), "weekly", 0.8);
  addOverview(entries, "/us/brands/", publishedEditorial.some((page) => page.page_type === "brand"), "monthly", 0.7);
  addOverview(entries, "/us/guides/", publishedEditorial.some((page) => page.page_type === "guide"), "monthly", 0.8);

  for (const product of publishedProducts) {
    const decision = getUsSeoDecision({ path: `/us/saunas/${product.slug}/`, pageClass: "detail", publicationStatus: product.publication_status });
    if (decision.sitemap) entries.push({
      path: decision.canonicalPath,
      lastModified: product.content_updated_at ?? product.spec_checked_at ?? publicationDocument.updated_at,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const page of publishedEditorial) {
    const section = page.page_type === "comparison" ? "compare" : `${page.page_type}s`;
    const decision = getUsSeoDecision({ path: `/us/${section}/${page.slug}/`, pageClass: "detail", publicationStatus: page.publication_status });
    if (decision.sitemap) entries.push({ path: decision.canonicalPath, lastModified: publicationDocument.updated_at, changeFrequency: "monthly", priority: 0.7 });
  }

  for (const page of publishedTrustPages) {
    const decision = getUsSeoDecision({ path: `/us/${page.slug}/`, pageClass: "detail", publicationStatus: page.publication_status });
    if (decision.sitemap) entries.push({ path: decision.canonicalPath, lastModified: publicationDocument.updated_at, changeFrequency: "yearly", priority: 0.3 });
  }

  return entries;
}
