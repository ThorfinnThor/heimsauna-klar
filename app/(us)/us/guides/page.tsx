import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { usPublication } from "@/lib/us/catalog";
import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createPageMetadata({ title: "US home sauna planning guides", description: "Source-based guidance for sauna sizing, placement and electrical planning in the United States.", path: "/us/guides/", market: "US", indexable: usPublication.indexing_enabled });

export default function UsGuideIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("guide", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <main><SiteHeader market="US" /><UsEditorialIndex pageType="guide" pages={pages} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
