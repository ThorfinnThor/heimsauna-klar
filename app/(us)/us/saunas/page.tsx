import { getUsPublicCatalogItems, getUsResearchCatalogItems } from "@/lib/us/catalog-index";
import { isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsCatalog } from "../_components/UsCatalog";

export const metadata = createUsPageMetadata({
  title: "Home sauna products for the United States",
  description: "Compare documented US sauna configurations by placement, capacity, dimensions and electrical requirements.",
  path: "/us/saunas/",
  pageClass: "overview",
  hasPublishedContent: getUsPublicCatalogItems().length > 0,
});

export default function UsSaunaCatalogPage() {
  const isResearchPreview = isUsResearchPreview();
  const products = isResearchPreview ? getUsResearchCatalogItems() : getUsPublicCatalogItems();
  return (
    <>
      <section className="page-hero page-shell us-catalog-hero">
        <p className="eyebrow">US sauna product catalog</p>
        <h1>Compare documented US sauna models.</h1>
        <p>Dimensions, capacity and electrical requirements come from documented US configurations. Missing specifications remain visible.</p>
      </section>
      <section className="page-shell us-catalog-section">
        {isResearchPreview ? <p className="us-preview-notice">Research beta · candidate records remain under editorial review and are excluded from search indexing</p> : null}
        <UsCatalog items={products} />
      </section>
    </>
  );
}
