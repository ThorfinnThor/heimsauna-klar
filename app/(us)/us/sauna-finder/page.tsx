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
  description: "Find home saunas that fit your room, your electrical panel and your budget.",
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
    <div className="wrap page">
      <h1>Sauna finder</h1>
      <p className="text">Tell us how much room and power you have. Leave anything blank that doesn&apos;t matter to you.</p>
      <UsSaunaFinder products={products} configurations={configurations} offers={offers} asOf={asOf} />
    </div>
  );
}
