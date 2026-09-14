import { notFound } from "next/navigation";

import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createUsPageMetadata({ title: "Sauna brands in the United States", description: "Source-based profiles of sauna brands and their documented US configurations.", path: "/us/brands/", pageClass: "overview", hasPublishedContent: getUsEditorialPages("brand").length > 0 });

export default function UsBrandIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("brand", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <UsEditorialIndex pageType="brand" pages={pages} isPreview={isPreview} />;
}
