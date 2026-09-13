import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { createPageMetadata } from "@/lib/metadata";
import { getUsResearchStats } from "@/lib/us/catalog";

export const metadata = createPageMetadata({
  title: "US sauna research",
  description: "Independent product research for home sauna planning in the United States.",
  path: "/us/",
  market: "US",
  indexable: false,
});

export default function UsMarketPage() {
  const stats = getUsResearchStats();

  return (
    <main>
      <SiteHeader market="US" />
      <section className="page-hero page-shell">
        <p className="eyebrow">United States · research preview</p>
        <h1>Sauna research for <span>US homes.</span></h1>
        <p>
          This section is being prepared from US-specific product configurations, electrical requirements and source records.
          Its current research set contains {stats.products} products and {stats.configurations} configurations.
        </p>
      </section>
      <SiteFooter market="US" />
    </main>
  );
}
