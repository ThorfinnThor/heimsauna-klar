import type { Metadata } from "next";
import { ProductCatalog } from "@/app/_components/ProductCatalog";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import Link from "next/link";
import { collections, getCollectionProducts } from "@/lib/collections";
import { products } from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Sauna-Produkte mit geprüften technischen Daten",
  description: "Ein wachsender Katalog für Heimsaunen mit Quellen, Prüfdatum und nachvollziehbarer redaktioneller Einordnung.",
  alternates: { canonical: "/de/produkte/" },
};

export default function ProductsPage() {
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: "Sauna-Produkte mit geprüften technischen Daten", description: metadata.description as string, path: "/de/produkte/" })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Produkte", path: "/de/produkte/" }])} />
      <SiteHeader />
      <section className="page-hero page-shell">
        <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><span>Produkte</span></nav>
        <p className="eyebrow">Produktkatalog · Deutschland</p>
        <h1>Sauna-Produkte<span>im Vergleich.</span></h1>
        <p>Zu jedem veröffentlichten Produkt findest du Quelle, Prüfdatum, Maße, Anschlussdaten und die Grundlage unserer Einordnung.</p>
        <Link className="text-link" href="/de/planung/">Vorher Platz, Lüftung, Boden und Budget klären ↗</Link>
        <div className="catalog-metrics">
          <span><strong>{products.length}</strong> verifizierte Datensätze</span>
          <span><strong>0</strong> bezahlte Platzierungen</span>
        </div>
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
              <span>{getCollectionProducts(collection).length} Datensätze ansehen ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductCatalog products={products} />
      <SiteFooter />
    </main>
  );
}
