import { notFound } from "next/navigation";

import { getUsTrustPage, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsTrustPageView } from "../_components/UsEditorial";

const publicPage = getUsTrustPage("methodology");
export const metadata = createUsPageMetadata({
  title: publicPage?.title ?? "How Select Your Sauna researches products",
  description: publicPage?.description ?? "The source, matching and limitation rules used for the US sauna research section.",
  path: "/us/methodology/",
  pageClass: "detail",
  publicationStatus: publicPage?.publication_status ?? "draft",
});

export default function UsMethodologyPage() {
  const isPreview = isUsResearchPreview();
  const page = getUsTrustPage("methodology", { includeNonPublic: isPreview });
  if (!page) notFound();
  return <UsTrustPageView page={page} isPreview={isPreview} />;
}
