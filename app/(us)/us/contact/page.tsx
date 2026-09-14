import { notFound } from "next/navigation";

import { getUsTrustPage, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsTrustPageView } from "../_components/UsEditorial";

const publicContactPage = getUsTrustPage("contact");
export const metadata = createUsPageMetadata({
  title: publicContactPage?.title ?? "Contact Select Your Sauna",
  description: publicContactPage?.description ?? "Contact Select Your Sauna about a product record, source or correction.",
  path: "/us/contact/",
  pageClass: "detail",
  publicationStatus: publicContactPage?.publication_status ?? "draft",
});

export default function UsContactPage() {
  const isPreview = isUsResearchPreview();
  const page = getUsTrustPage("contact", { includeNonPublic: isPreview });
  if (!page) notFound();
  return <UsTrustPageView page={page} isPreview={isPreview} />;
}
