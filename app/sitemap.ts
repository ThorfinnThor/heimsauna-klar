import type { MetadataRoute } from "next";
import { collections } from "@/lib/collections";
import { planningGuides } from "@/lib/planning-guides";
import { products } from "@/lib/products";
import { isIndexingEnabled, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexingEnabled) return [];

  const updated = new Date("2026-08-21T00:00:00Z");
  return [
    { url: `${siteUrl}/de/`, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/de/produkte/`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/de/planung/`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/de/transparenz/affiliate/`, lastModified: updated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/de/transparenz/launch/`, lastModified: updated, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/de/saunatechnik/230-v-sauna/`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/de/vergleiche/230-v-sauna/`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    ...collections.map((collection) => ({
      url: `${siteUrl}/de/${collection.section}/${collection.slug}/`,
      lastModified: updated,
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
