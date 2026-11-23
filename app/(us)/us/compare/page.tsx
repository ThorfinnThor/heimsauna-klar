import { notFound } from "next/navigation";

import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createUsPageMetadata({
  title: "Home sauna comparisons",
  description: "Home sauna comparisons by size, seats and voltage, with specs from the manufacturers.",
  path: "/us/compare/",
  pageClass: "overview",
  hasPublishedContent: getUsEditorialPages("comparison").length > 0,
});

export default function UsComparisonIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("comparison", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <UsEditorialIndex pageType="comparison" pages={pages} isPreview={isPreview} />;
}
