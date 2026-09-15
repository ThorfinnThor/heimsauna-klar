import {
  getUsPublicConfigurations,
  getUsPublicProducts,
  getUsResearchConfigurations,
  getUsResearchProducts,
} from "@/lib/us/catalog";
import { isUsResearchPreview } from "@/lib/us/content";
import { buildUsDirectComparisonOptions } from "@/lib/us/direct-comparison";
import { createUsPageMetadata } from "@/lib/us/seo";
import { UsDirectComparison } from "../../_components/UsDirectComparison";

export const metadata = createUsPageMetadata({
  title: "Compare US sauna models side by side",
  description: "Choose two to four documented US sauna configurations and compare their dimensions, capacity, materials and electrical requirements.",
  path: "/us/compare/models/",
  pageClass: "tool",
});

export default function UsDirectComparisonPage() {
  const isResearchPreview = isUsResearchPreview();
  const products = isResearchPreview ? getUsResearchProducts() : getUsPublicProducts();
  const configurations = isResearchPreview ? getUsResearchConfigurations() : getUsPublicConfigurations();
  const allOptions = buildUsDirectComparisonOptions(products, configurations);
  // The catalog and product routes carry all candidates. Keep this protected
  // interactive preview small enough for a static HTML payload until approval.
  const options = isResearchPreview ? allOptions.slice(0, 24) : allOptions;

  return (
    <>
      <section className="page-hero page-shell us-direct-comparison-hero">
        <p className="eyebrow">Direct model comparison</p>
        <h1>Put exact sauna configurations in the same table.</h1>
        <p>Model names alone can hide differences in size and electrical requirements. This tool compares the documented configuration records without ranking them.</p>
      </section>
      <section className="page-shell us-direct-comparison-section">
        <UsDirectComparison options={options} />
      </section>
    </>
  );
}
