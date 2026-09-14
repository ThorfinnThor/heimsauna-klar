import { notFound } from "next/navigation";
import { getUsHomePage, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata, getUsHomePublicationStatus } from "@/lib/us/seo";
import { UsHomePageView } from "./_components/UsEditorial";

export const metadata = createUsPageMetadata({
  title: "US sauna research",
  description: "Independent product research for home sauna planning in the United States.",
  path: "/us/",
  pageClass: "overview",
  publicationStatus: getUsHomePublicationStatus(),
});

export default function UsMarketPage() {
  const page = getUsHomePage({ includeNonPublic: isUsResearchPreview() });
  if (!page) notFound();

  return <UsHomePageView page={page} isPreview={isUsResearchPreview()} />;
}
