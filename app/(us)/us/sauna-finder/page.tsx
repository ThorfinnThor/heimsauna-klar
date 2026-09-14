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
import { projectUsFinderConfigurations, projectUsFinderProducts } from "@/lib/us/finder";
import { UsSaunaFinder } from "../_components/UsSaunaFinder";

export const metadata = createUsPageMetadata({
  title: "US home sauna finder",
  description: "Compare documented US sauna configurations against capacity, room dimensions, electrical supply and budget requirements.",
  path: "/us/sauna-finder/",
  pageClass: "tool",
});

export default function UsSaunaFinderPage() {
  const isResearchPreview = isUsResearchPreview();
  const products = projectUsFinderProducts(isResearchPreview ? getUsResearchProducts() : getUsPublicProducts());
  const configurations = projectUsFinderConfigurations(isResearchPreview ? getUsResearchConfigurations() : getUsPublicConfigurations());
  const offers = isResearchPreview ? getUsResearchOffers() : getUsPublicOffers();
  const asOf = process.env.NEXT_PUBLIC_OFFER_POLICY_AS_OF ?? usPublication.updated_at;

  return (
    <>
      <section className="page-hero page-shell us-finder-hero">
        <p className="eyebrow">US sauna finder</p>
        <h1>Check a sauna against the limits of your project.</h1>
        <p>Capacity, dimensions, power and budget are checked separately. Missing facts remain visible.</p>
      </section>
      <section className="page-shell us-finder-section">
        {isResearchPreview ? (
          <p className="us-preview-notice">
            Research beta. The finder searches 100 candidate records; unresolved facts stay visible.
          </p>
        ) : null}
        <UsSaunaFinder products={products} configurations={configurations} offers={offers} asOf={asOf} />
      </section>
    </>
  );
}
