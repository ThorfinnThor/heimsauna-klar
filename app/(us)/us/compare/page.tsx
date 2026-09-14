import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createUsPageMetadata({
  title: "US sauna comparisons",
  description: "Curated comparisons of documented US sauna configurations with an explicit selection scope.",
  path: "/us/compare/",
  pageClass: "overview",
  hasPublishedContent: getUsEditorialPages("comparison").length > 0,
});

export default function UsComparisonIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("comparison", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <main><SiteHeader market="US" /><UsEditorialIndex pageType="comparison" pages={pages} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
