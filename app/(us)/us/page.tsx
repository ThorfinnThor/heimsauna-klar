import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { getUsHomePage, isUsResearchPreview } from "@/lib/us/content";
import { UsHomePageView } from "./_components/UsEditorial";

export const metadata = createPageMetadata({
  title: "US sauna research",
  description: "Independent product research for home sauna planning in the United States.",
  path: "/us/",
  market: "US",
  indexable: false,
});

export default function UsMarketPage() {
  const page = getUsHomePage({ includeNonPublic: isUsResearchPreview() });
  if (!page) notFound();

  return (
    <main>
      <SiteHeader market="US" />
      <UsHomePageView page={page} isPreview={isUsResearchPreview()} />
      <SiteFooter market="US" />
    </main>
  );
}
