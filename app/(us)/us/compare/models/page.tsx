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
  title: "Compare saunas side by side",
  description: "Pick two to four home saunas and compare size, seats, power, circuit and wood in one table.",
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
    <div className="wrap page">
      <h1>Compare saunas side by side</h1>
      <p className="text">Pick a few models and see size, seats, power and wood in one table.</p>
      <UsDirectComparison options={options} />
    </div>
  );
}
