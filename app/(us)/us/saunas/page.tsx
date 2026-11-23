import { getUsPublicCatalogItems, getUsResearchCatalogItems } from "@/lib/us/catalog-index";
import { isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsCatalog } from "../_components/UsCatalog";

export const metadata = createUsPageMetadata({
  title: "Home saunas: all models",
  description: "Browse home saunas sold in the US by size, seats, indoor or outdoor use and voltage. Traditional, infrared, cabins and kits.",
  path: "/us/saunas/",
  pageClass: "overview",
  hasPublishedContent: getUsPublicCatalogItems().length > 0,
});

export default function UsSaunaCatalogPage() {
  const isResearchPreview = isUsResearchPreview();
  const products = isResearchPreview ? getUsResearchCatalogItems() : getUsPublicCatalogItems();
  return (
    <div className="wrap page">
      <h1>Home saunas</h1>
      <p className="text">{products.length} saunas sold in the US, with size, seats and voltage. If something is missing, the manufacturer doesn&apos;t state it.</p>
      <UsCatalog items={products} />
    </div>
  );
}
