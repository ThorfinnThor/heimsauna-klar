import { createUsPageMetadata } from "@/lib/us/seo";
import {
  getUsPublicConfigurations,
  getUsPublicOffers,
  getUsPublicProducts,
  getUsResearchConfigurations,
  getUsResearchOffers,
  getUsResearchProducts,
  usPublication,
} from "@/lib/us/catalog";
import { isUsResearchPreview } from "@/lib/us/content";
import { UsSaunaFinder } from "../_components/UsSaunaFinder";

export const metadata = createUsPageMetadata({
  title: "US home sauna finder",
  description: "Compare documented US sauna configurations against capacity, room dimensions, electrical supply and budget requirements.",
  path: "/us/sauna-finder/",
  pageClass: "tool",
});

export default function UsSaunaFinderPage() {
  const isResearchPreview = isUsResearchPreview();
  const allProducts = isResearchPreview ? getUsResearchProducts() : getUsPublicProducts();
  const allConfigurations = isResearchPreview ? getUsResearchConfigurations() : getUsPublicConfigurations();
  // Keep the protected preview payload bounded. The complete 100-record research
  // catalog remains available on the catalog and product routes; the finder only
  // needs a representative working set until Sol approves publication.
  const previewProducts = allProducts.slice(0, 16);
  const products = isResearchPreview ? previewProducts : allProducts;
  const productIds = new Set(products.map((product) => product.id));
  const configurations = isResearchPreview
    ? allConfigurations.filter((configuration) => productIds.has(configuration.product_id))
    : allConfigurations;
  const offers = isResearchPreview ? getUsResearchOffers() : getUsPublicOffers();
  const asOf = process.env.NEXT_PUBLIC_OFFER_POLICY_AS_OF ?? usPublication.updated_at;

  return (
    <>
      <section className="page-hero page-shell us-finder-hero">
        <p className="eyebrow">US sauna finder</p>
        <h1>Check a sauna against the limits of your project.</h1>
        <p>Capacity, exterior dimensions, available power and price scope are evaluated separately. Missing facts remain visible and documented conflicts are not converted into recommendations.</p>
      </section>
      <section className="page-shell us-finder-section">
        {isResearchPreview ? (
          <p className="us-preview-notice">
            Research beta · candidate records remain excluded from search indexing. The interactive finder uses a bounded sample while the full 100-record catalog remains available for review.
          </p>
        ) : null}
        <UsSaunaFinder products={products} configurations={configurations} offers={offers} asOf={asOf} />
      </section>
    </>
  );
}
