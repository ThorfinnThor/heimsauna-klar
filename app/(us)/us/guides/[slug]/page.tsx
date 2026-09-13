import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { usPublication } from "@/lib/us/catalog";
import { getUsEditorialPage, getUsEditorialPages, getUsPresentation, isUsResearchPreview, usEditorialPath } from "@/lib/us/content";
import { UsEditorialPageView } from "../../_components/UsEditorial";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return getUsEditorialPages("guide", { includeNonPublic: isUsResearchPreview() }).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getUsEditorialPage("guide", slug, { includeNonPublic: isUsResearchPreview() });
  if (!page) return {};
  return createPageMetadata({ title: page.title, description: page.description, path: usEditorialPath(page), market: "US", indexable: usPublication.indexing_enabled && page.publication_status === "published" });
}

export default async function UsGuidePage({ params }: Props) {
  const { slug } = await params;
  const isPreview = isUsResearchPreview();
  const page = getUsEditorialPage("guide", slug, { includeNonPublic: isPreview });
  if (!page || page.page_type !== "guide") notFound();
  const presentation = getUsPresentation(page.presentation_id, page.page_type);
  if (!presentation) notFound();
  return <main><SiteHeader market="US" /><UsEditorialPageView page={page} presentation={presentation} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
