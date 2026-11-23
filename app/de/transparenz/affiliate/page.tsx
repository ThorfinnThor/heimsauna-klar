import { Breadcrumbs } from "@/app/_components/Blocks";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import affiliate from "@/content/de/affiliate.json";
import { affiliatePrograms, getAffiliateStats, getMerchantOfferCounts } from "@/lib/affiliate";
import { createPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const path = "/de/transparenz/affiliate/";
const description = "Welche Shops uns eine Provision zahlen, woran du Affiliate-Links erkennst und warum sie die Reihenfolge der Saunen nicht ändern.";

export const metadata = createPageMetadata({ title: affiliate.title, description, path });

export default function AffiliateTransparencyPage() {
  const stats = getAffiliateStats();
  const merchants = getMerchantOfferCounts().filter(({ count }) => count > 0).toSorted((a, b) => b.count - a.count);
  const approved = affiliatePrograms.filter((program) => program.status === "approved");
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: affiliate.title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Affiliate-Links", path }])} />
      <SiteHeader />
      <article className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Affiliate-Links" }]} />
        <h1>{affiliate.title}</h1>
        <div className="text">
          <p>{affiliate.description}</p>
          <p>Zurzeit sind {stats.affiliateOfferCount} von {stats.offerCount} Angeboten Affiliate-Links. Sie laufen über das Netzwerk Awin.</p>
          {affiliate.principles.map((principle) => <section key={principle.title}><h2>{principle.title}</h2><p>{principle.copy}</p></section>)}
        </div>
        <h2>Diese Shops verlinken wir</h2>
        <div className="table-wrap"><table className="facts">
          <thead><tr><th scope="col">Shop</th><th scope="col">Angebote</th><th scope="col">Provision</th></tr></thead>
          <tbody>{merchants.map(({ merchant, count }) => <tr key={merchant.id}><th scope="row">{merchant.name}</th><td>{count}</td><td>{merchant.affiliate.status === "active" ? "ja" : "nein"}</td></tr>)}</tbody>
        </table></div>
        <p className="text">Partnerprogramme, in denen wir angemeldet sind: {approved.map((program) => program.name).join(", ")}.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
