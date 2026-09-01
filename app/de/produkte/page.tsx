import { ProductCatalog } from "@/app/_components/ProductCatalog";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import Link from "next/link";
import { collections, getCollectionProducts } from "@/lib/collections";
import { getCatalogStats, products } from "@/lib/products";
import { createPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

export const metadata = createPageMetadata({
  title: "Sauna-Produkte mit geprüften technischen Daten",
  description: "Ein wachsender Katalog für Heimsaunen mit Quellen und nachvollziehbarer redaktioneller Einordnung.",
  path: "/de/produkte/",
});

export default function ProductsPage() {
  const stats = getCatalogStats(products);

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: "Sauna-Produkte mit geprüften technischen Daten", description: metadata.description as string, path: "/de/produkte/" })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Produkte", path: "/de/produkte/" }])} />
      <SiteHeader />
      <section className="page-hero page-shell">
        <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><span>Produkte</span></nav>
        <p className="eyebrow">Produktkatalog · Deutschland</p>
        <h1>Sauna-Produkte{" "}<span>im Vergleich.</span></h1>
        <p>Der Katalog umfasst {stats.total} verifizierte Produkte: {stats.categoryCounts.indoor} Indoor-Saunen, {stats.categoryCounts.outdoor} Outdoor-Saunen, {stats.categoryCounts.infrared} Infrarotkabinen und {stats.categoryCounts.mobile} mobile Saunen. Zu jedem Produkt findest du Quellen, Maße, Anschlussdaten und die Grundlage unserer Einordnung.</p>
        <Link className="text-link" href="/de/planung/">Planung zu Platz, Lüftung, Boden und Budget ↗</Link>
      </section>

      <section className="collection-index page-shell" aria-labelledby="collection-index-title">
        <div className="collection-index-head">
          <div><p className="eyebrow">Gefilterte Übersichten</p><h2 id="collection-index-title">Vergleiche nach Platz, Personenzahl und Preis.</h2></div>
          <p>Diese Seiten filtern den Katalog nach messbaren Kriterien wie Stellfläche, Personenzahl, Aufstellort oder Preis.</p>
        </div>
        <div className="collection-index-grid">
          {collections.map((collection) => (
            <Link href={`/de/${collection.section}/${collection.slug}/`} key={collection.id}>
              <small>{collection.kind}</small>
              <strong>{collection.title}</strong>
              <span>{getCollectionProducts(collection).length} Produkte ansehen ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductCatalog products={products} />
      <SiteFooter />
    </main>
  );
}
