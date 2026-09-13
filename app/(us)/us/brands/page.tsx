import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { usPublication } from "@/lib/us/catalog";
import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createPageMetadata({ title: "Sauna brands in the United States", description: "Source-based profiles of sauna brands and their documented US configurations.", path: "/us/brands/", market: "US", indexable: usPublication.indexing_enabled });

export default function UsBrandIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("brand", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <main><SiteHeader market="US" /><UsEditorialIndex pageType="brand" pages={pages} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
