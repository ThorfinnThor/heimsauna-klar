import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { getUsPublicCatalogItems, getUsResearchCatalogItems } from "@/lib/us/catalog-index";
import { usPublication } from "@/lib/us/catalog";
import { UsCatalog } from "../_components/UsCatalog";

export const metadata = createPageMetadata({
  title: "Home saunas for the United States",
  description: "Compare documented US sauna configurations by placement, capacity, dimensions and electrical requirements.",
  path: "/us/saunas/",
  market: "US",
  indexable: usPublication.indexing_enabled,
});

export default function UsSaunaCatalogPage() {
  const isResearchPreview = !usPublication.routes_enabled && process.env.US_RESEARCH_PREVIEW === "1";
  const products = isResearchPreview ? getUsResearchCatalogItems() : getUsPublicCatalogItems();
  return (
    <main>
      <SiteHeader market="US" />
      <section className="page-hero page-shell us-catalog-hero">
        <p className="eyebrow">US sauna catalog</p>
        <h1>Compare the configuration, not just the model name.</h1>
        <p>Dimensions, capacity and electrical requirements refer to documented US configurations. Missing specifications stay visible instead of being estimated.</p>
      </section>
      <section className="page-shell us-catalog-section">
        {isResearchPreview ? <p className="us-preview-notice">Research preview · candidate records are not approved for publication</p> : null}
        <UsCatalog items={products} />
      </section>
      <SiteFooter market="US" />
    </main>
  );
}
