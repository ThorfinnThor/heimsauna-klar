import { notFound } from "next/navigation";
import { getUsHomePage, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata, getUsHomePublicationStatus } from "@/lib/us/seo";
import { UsHomePageView } from "./_components/UsEditorial";

const homePage = getUsHomePage({ includeNonPublic: true });
if (!homePage) throw new Error("US home content is unavailable");

export const metadata = createUsPageMetadata({
  title: homePage.title,
  description: homePage.description,
  path: "/us/",
  pageClass: "overview",
  publicationStatus: getUsHomePublicationStatus(),
});

export default function UsMarketPage() {
  const page = getUsHomePage({ includeNonPublic: isUsResearchPreview() });
  if (!page) notFound();

  return <UsHomePageView page={page} isPreview={isUsResearchPreview()} />;
}
