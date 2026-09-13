import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { usPublication } from "@/lib/us/catalog";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createPageMetadata({
  title: "US sauna comparisons",
  description: "Curated comparisons of documented US sauna configurations with an explicit selection scope.",
  path: "/us/compare/",
  market: "US",
  indexable: usPublication.indexing_enabled,
});

export default function UsComparisonIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("comparison", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <main><SiteHeader market="US" /><UsEditorialIndex pageType="comparison" pages={pages} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
