import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
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
import { UsSaunaFinder } from "../_components/UsSaunaFinder";

export const metadata = createUsPageMetadata({
  title: "US home sauna finder",
  description: "Compare documented US sauna configurations against capacity, room dimensions, electrical supply and budget requirements.",
  path: "/us/sauna-finder/",
  pageClass: "tool",
});

export default function UsSaunaFinderPage() {
  const isResearchPreview = !usPublication.routes_enabled && process.env.US_RESEARCH_PREVIEW === "1";
  const products = isResearchPreview ? getUsResearchProducts() : getUsPublicProducts();
  const configurations = isResearchPreview ? getUsResearchConfigurations() : getUsPublicConfigurations();
  const offers = isResearchPreview ? getUsResearchOffers() : getUsPublicOffers();
  const asOf = process.env.NEXT_PUBLIC_OFFER_POLICY_AS_OF ?? usPublication.updated_at;

  return (
    <main>
      <SiteHeader market="US" />
      <section className="page-hero page-shell us-finder-hero">
        <p className="eyebrow">US sauna finder</p>
        <h1>Check a sauna against the limits of your project.</h1>
        <p>Capacity, exterior dimensions, available power and price scope are evaluated separately. Missing facts remain visible and documented conflicts are not converted into recommendations.</p>
      </section>
      <section className="page-shell us-finder-section">
        {isResearchPreview ? <p className="us-preview-notice">Research preview · candidate records are not approved for publication</p> : null}
        <UsSaunaFinder products={products} configurations={configurations} offers={offers} asOf={asOf} />
      </section>
      <SiteFooter market="US" />
    </main>
  );
}
