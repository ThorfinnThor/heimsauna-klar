import {
  getUsPublicConfigurations,
  getUsPublicProducts,
  getUsResearchConfigurations,
  getUsResearchProducts,
  usPublication,
} from "@/lib/us/catalog";
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
  const isResearchPreview = !usPublication.routes_enabled && process.env.US_RESEARCH_PREVIEW === "1";
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
        {isResearchPreview ? (
          <p className="us-preview-notice">
            Research preview · candidate records are not approved for publication. The comparison shows a bounded sample while the 100-record catalog completes review.
          </p>
        ) : null}
        <UsDirectComparison options={options} />
      </section>
    </>
  );
}
