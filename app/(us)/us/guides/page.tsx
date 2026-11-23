import { notFound } from "next/navigation";

import { getUsEditorialPages, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsEditorialIndex } from "../_components/UsEditorial";

export const metadata = createUsPageMetadata({ title: "Home sauna guides", description: "Guides to wiring, running cost and sizing a home sauna in the US.", path: "/us/guides/", pageClass: "overview", hasPublishedContent: getUsEditorialPages("guide").length > 0 });

export default function UsGuideIndexPage() {
  const isPreview = isUsResearchPreview();
  const pages = getUsEditorialPages("guide", { includeNonPublic: isPreview });
  if (pages.length === 0) notFound();
  return <UsEditorialIndex pageType="guide" pages={pages} isPreview={isPreview} />;
}
