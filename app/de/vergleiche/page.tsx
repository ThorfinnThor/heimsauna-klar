import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import {
  collectionSectionLabels,
  getCollectionPath,
  getCollectionProducts,
  indexableCollections,
  type Collection,
} from "@/lib/collections";
import { createPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const title = "Sauna-Vergleiche nach Platz, Kapazität und Preis";
const description = "Vergleichsseiten für Heimsaunen mit nachvollziehbaren Kriterien zu Stellfläche, Personen, Wärmeart, Anschluss und Budget.";
const path = "/de/vergleiche/";

export const metadata = createPageMetadata({ title, description, path });

const sectionOrder: Array<{ section: Collection["section"]; intro: string }> = [
  { section: "indoor-sauna", intro: "Innenkabinen und Infrarotkabinen nach Personenzahl, Wärmeart, Stellfläche und Preis." },
  { section: "outdoor-sauna", intro: "Gartensaunen und Fasssaunen, bei denen Fundament, Wetterschutz und Zuleitung mitgeplant werden." },
  { section: "vergleiche", intro: "Übergreifende Auswahlen nach Budget, Gruppengröße, Saunatyp, Anschluss und Marke." },
];

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
        <h1>Saunen vergleichen{" "}<span>mit Kriterien, die zum Standort passen.</span></h1>
        <p>Die Übersichten sortieren dokumentierte Produkte nach einer klaren Frage. Öffne den Vergleich, der zu deinem Platz, deiner Personenzahl, deiner Wärmeart oder deinem Budget passt.</p>
        <div className="guide-path-links">
          <Link className="text-link" href="/de/planung/platzbedarf/">Sauna-Abmessungen vorher planen ↗</Link>
          <Link className="text-link" href="/de/planung/sauna-kosten/">Kosten einer Heimsauna einordnen ↗</Link>
          <Link className="text-link" href="/de/produkte/">Alle Produkte im Katalog ansehen ↗</Link>
        </div>
      </section>
      <section className="collection-index page-shell" aria-labelledby="comparison-index-title">
        <div className="collection-index-head">
          <div><p className="eyebrow">Auswahl nach Anforderung</p><h2 id="comparison-index-title">Welcher Vergleich passt zu deiner Frage?</h2></div>
          <p>Jede Seite erklärt ihre Filter und nennt die Grenzen der verfügbaren Hersteller- und Angebotsdaten.</p>
        </div>
        <nav className="planning-phase-nav" aria-label="Vergleiche nach Kategorie">
          {sectionOrder.map((group) => <a href={`#${group.section}`} key={group.section}>{collectionSectionLabels[group.section]}</a>)}
        </nav>
        {sectionOrder.map((group) => {
          const sectionCollections = indexableCollections.filter((collection) => collection.section === group.section);
          return (
            <section className="comparison-group" id={group.section} key={group.section} aria-labelledby={`${group.section}-title`}>
              <div className="comparison-group-head"><h3 id={`${group.section}-title`}>{collectionSectionLabels[group.section]}</h3><p>{group.intro}</p></div>
              <div className="collection-index-grid">
                {group.section === "vergleiche" ? (
                  <Link href="/de/vergleiche/230-v-sauna/">
                    <small>Anschlussvergleich</small>
                    <strong>230-V-Saunen vergleichen</strong>
                    <span>Modelle mit dokumentiertem 230-V-Anschluss ansehen ↗</span>
                  </Link>
                ) : null}
                {sectionCollections.map((collection) => (
                  <Link href={getCollectionPath(collection)} key={collection.id}>
                    <small>{collection.kind}</small>
                    <strong>{collection.title}</strong>
                    <span>{getCollectionProducts(collection).length} Produkte ansehen ↗</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </section>
      <SiteFooter />
    </main>
  );
}
