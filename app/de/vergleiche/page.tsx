import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { collections, getCollectionProducts } from "@/lib/collections";
import { createPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const comparisonCollections = collections.filter((collection) => collection.section === "vergleiche");
const title = "Sauna-Vergleiche nach Platz, Kapazität und Preis";
const description = "Vergleichsseiten für Heimsaunen mit nachvollziehbaren Kriterien zu Stellfläche, Personen, Wärmeart, Anschluss und Budget.";
const path = "/de/vergleiche/";

export const metadata = createPageMetadata({ title, description, path });

export default function ComparisonsHubPage() {
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Vergleiche", path },
      ])} />
      <SiteHeader />
      <section className="page-hero page-shell">
        <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><span>Vergleiche</span></nav>
        <p className="eyebrow">Vergleiche · konkrete Auswahlfragen</p>
        <h1>Saunen vergleichen<span>mit Kriterien, die zum Standort passen.</span></h1>
        <p>Die Übersichten sortieren dokumentierte Produkte nach einer klaren Frage. Öffne den Vergleich, der zu deinem Platz, deiner Personenzahl, deiner Wärmeart oder deinem Budget passt.</p>
        <Link className="text-link" href="/de/produkte/">Alle Produkte im Katalog ansehen ↗</Link>
      </section>
      <section className="collection-index page-shell" aria-labelledby="comparison-index-title">
        <div className="collection-index-head">
          <div><p className="eyebrow">Auswahl nach Anforderung</p><h2 id="comparison-index-title">Welcher Vergleich passt zu deiner Frage?</h2></div>
          <p>Jede Seite erklärt ihre Filter und nennt die Grenzen der verfügbaren Hersteller- und Angebotsdaten.</p>
        </div>
        <div className="collection-index-grid">
          {comparisonCollections.map((collection) => (
            <Link href={`/de/${collection.section}/${collection.slug}/`} key={collection.id}>
              <small>{collection.kind}</small>
              <strong>{collection.title}</strong>
              <span>{getCollectionProducts(collection).length} Produkte ansehen ↗</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
