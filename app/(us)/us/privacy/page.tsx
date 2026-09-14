import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { getUsTrustPage, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsTrustPageView } from "../_components/UsEditorial";

const publicPage = getUsTrustPage("privacy");
export const metadata = createUsPageMetadata({
  title: publicPage?.title ?? "Privacy information for Select Your Sauna",
  description: publicPage?.description ?? "The current website data flows, hosting services and external-link boundaries for the US research section.",
  path: "/us/privacy/",
  pageClass: "detail",
  publicationStatus: publicPage?.publication_status ?? "draft",
});

export default function UsPrivacyPage() {
  const isPreview = isUsResearchPreview();
  const page = getUsTrustPage("privacy", { includeNonPublic: isPreview });
  if (!page) notFound();
  return <main><SiteHeader market="US" /><UsTrustPageView page={page} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
