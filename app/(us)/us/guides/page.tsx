import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createUsPageMetadata({ title: "US home sauna planning guides", description: "Source-based guidance for sauna sizing, placement and electrical planning in the United States.", path: "/us/guides/", pageClass: "overview", hasPublishedContent: getUsEditorialPages("guide").length > 0 });

export default function UsGuideIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("guide", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <main><SiteHeader market="US" /><UsEditorialIndex pageType="guide" pages={pages} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
