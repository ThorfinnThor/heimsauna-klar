import type { MetadataRoute } from "next";
import { collections } from "@/lib/collections";
import { planningGuides } from "@/lib/planning-guides";
import { products } from "@/lib/products";
import { isIndexingEnabled, siteUrl } from "@/lib/site";
import publication from "@/data/site-publication.json";
import affiliate from "@/content/de/affiliate.json";
import legal from "@/content/de/legal.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexingEnabled) return [];

  const publicationUpdated = new Date(`${publication.updated_at}T00:00:00Z`);
  const planningUpdated = new Date(`${planningGuides.map((guide) => guide.updated_at).sort((a, b) => b.localeCompare(a))[0]}T00:00:00Z`);
  const productsUpdated = new Date(`${products.map((product) => product.updated_at).sort((a, b) => b.localeCompare(a))[0]}T00:00:00Z`);
  return [
    { url: `${siteUrl}/de/`, lastModified: publicationUpdated, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/de/produkte/`, lastModified: productsUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/de/planung/`, lastModified: planningUpdated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/de/ueber-uns/`, lastModified: publicationUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/de/rechtliches/`, lastModified: new Date(`${legal.updated_at}T00:00:00Z`), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/de/transparenz/affiliate/`, lastModified: new Date(`${affiliate.updated_at}T00:00:00Z`), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/de/saunatechnik/230-v-sauna/`, lastModified: planningUpdated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/de/vergleiche/230-v-sauna/`, lastModified: productsUpdated, changeFrequency: "weekly", priority: 0.8 },
    ...collections.map((collection) => ({
      url: `${siteUrl}/de/${collection.section}/${collection.slug}/`,
      lastModified: publicationUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...planningGuides.map((guide) => ({
      url: `${siteUrl}/de/planung/${guide.slug}/`,
      lastModified: new Date(`${guide.updated_at}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/de/produkte/${product.product_id}/`,
      lastModified: new Date(`${product.updated_at}T00:00:00Z`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
