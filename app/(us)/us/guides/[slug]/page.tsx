import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getUsEditorialPage, getUsEditorialPages, getUsPresentation, isUsResearchPreview, usEditorialPath } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
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
  return createUsPageMetadata({ title: page.title, description: page.description, path: usEditorialPath(page), pageClass: "detail", publicationStatus: page.publication_status, type: "article" });
}

export default async function UsGuidePage({ params }: Props) {
  const { slug } = await params;
  const isPreview = isUsResearchPreview();
  const page = getUsEditorialPage("guide", slug, { includeNonPublic: isPreview });
  if (!page || page.page_type !== "guide") notFound();
  const presentation = getUsPresentation(page.presentation_id, page.page_type);
  if (!presentation) notFound();
  return <UsEditorialPageView page={page} presentation={presentation} isPreview={isPreview} />;
}
