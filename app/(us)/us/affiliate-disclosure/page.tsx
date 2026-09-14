import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { getUsTrustPage, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsTrustPageView } from "../_components/UsEditorial";

const publicPage = getUsTrustPage("affiliate-disclosure");
export const metadata = createUsPageMetadata({
  title: publicPage?.title ?? "Affiliate disclosure for Select Your Sauna",
  description: publicPage?.description ?? "How marked affiliate links and merchant relationships are handled in the US section.",
  path: "/us/affiliate-disclosure/",
  pageClass: "detail",
  publicationStatus: publicPage?.publication_status ?? "draft",
});

export default function UsAffiliateDisclosurePage() {
  const isPreview = isUsResearchPreview();
  const page = getUsTrustPage("affiliate-disclosure", { includeNonPublic: isPreview });
  if (!page) notFound();
  return <main><SiteHeader market="US" /><UsTrustPageView page={page} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
