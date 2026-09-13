import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { usPublication } from "@/lib/us/catalog";
import { getUsTrustPage, isUsResearchPreview } from "@/lib/us/content";
import { UsTrustPageView } from "../_components/UsEditorial";

export const metadata = createPageMetadata({ title: "Contact Select Your Sauna", description: "Contact Select Your Sauna about a product record, source or correction.", path: "/us/contact/", market: "US", indexable: usPublication.indexing_enabled });

export default function UsContactPage() {
  const isPreview = isUsResearchPreview();
  const page = getUsTrustPage("contact", { includeNonPublic: isPreview });
  if (!page) notFound();
  return <main><SiteHeader market="US" /><UsTrustPageView page={page} isPreview={isPreview} /><SiteFooter market="US" /></main>;
}
