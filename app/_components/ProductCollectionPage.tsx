import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import {
  collections,
  getCollectionProducts,
  getFootprintSquareMeters,
  getLowestPrice,
  type Collection,
} from "@/lib/collections";
import { formatGermanDate, formatPower, formatPrice, formatVoltage, getLatestOfferCheck } from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const sectionLabels: Record<Collection["section"], string> = {
  "indoor-sauna": "Indoor-Sauna",
  "outdoor-sauna": "Outdoor-Sauna",
  vergleiche: "Vergleiche",
};

export function ProductCollectionPage({ collection }: { collection: Collection }) {
  const candidates = getCollectionProducts(collection);
  const latestOfferCheck = getLatestOfferCheck(candidates);
  const minimumFootprint = Math.min(...candidates.map(getFootprintSquareMeters));
  const lowestPrice = Math.min(...candidates.map(getLowestPrice));
  const relatedCollections = collections.filter((item) => item.id !== collection.id);
  const path = `/de/${collection.section}/${collection.slug}/`;

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: collection.title, description: collection.description, path })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Produkte", path: "/de/produkte/" },
        { name: collection.title, path },
      ])} />
      <SiteHeader />
      <article>
        <header className="collection-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
            <Link href="/de/">Start</Link><span>/</span>
            <Link href="/de/produkte/">Produkte</Link><span>/</span>
            <span>{sectionLabels[collection.section]}</span><span>/</span><span>{collection.title}</span>
          </nav>
          <p className="eyebrow">{collection.eyebrow}</p>
          <h1>{collection.title}<span>{collection.accent}</span></h1>
          <p>{collection.intro}</p>
          <div className="collection-metrics" aria-label="Kennzahlen der Auswahl">
            <span><strong>{candidates.length}</strong> passende Datensätze</span>
            <span><strong>{minimumFootprint.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m²</strong> kleinste Stellfläche</span>
            <span><strong>ab {lowestPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong> dokumentierter Preis</span>
          </div>
        </header>

        <section className="collection-method page-shell" aria-labelledby="collection-method-title">
          <div>
            <p className="eyebrow">Auswahlregel</p>
            <h2 id="collection-method-title">Nachvollziehbar statt „Top 10“.</h2>
          </div>
          <div>
            <ul>
              {collection.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
            </ul>
            <p>Stand der Angebotsprüfung: <strong>{latestOfferCheck ? formatGermanDate(latestOfferCheck) : "nicht verfügbar"}</strong>. Kein Modell wurde für diese Liste bezahlt oder redaktionell hochgestuft.</p>
          </div>
        </section>

        <section className="collection-results page-shell" aria-labelledby="collection-results-title">
          <div className="collection-results-head">
            <div><p className="eyebrow">Datenvergleich</p><h2 id="collection-results-title">{candidates.length} Modelle im direkten Überblick.</h2></div>
            <p>Öffne den einzelnen Datensatz für Herstellerquelle, Prüfdatum, Varianten und bekannte Einschränkungen.</p>
          </div>
          <div className="collection-table-wrap">
            <table className="collection-table">
              <caption className="visually-hidden">{collection.title}: Vergleich der passenden Produktdatensätze</caption>
              <thead><tr><th>Produkt</th><th>Aufstellung</th><th>Stellfläche</th><th>Außenmaß B × T × H</th><th>Kapazität</th><th>Anschluss</th><th>Preis</th></tr></thead>
              <tbody>
                {candidates.map((product) => (
                  <tr key={product.product_id}>
                    <td><small>{product.brand} · {product.sauna.type}</small><Link href={`/de/produkte/${product.product_id}/`}>{product.model} ↗</Link></td>
                    <td>{product.sauna.indoor_outdoor === "indoor" ? "Innen" : "Außen"}</td>
                    <td>{getFootprintSquareMeters(product).toLocaleString("de-DE", { maximumFractionDigits: 2 })} m²</td>
                    <td>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</td>
                    <td>bis {product.people.max} {product.people.max === 1 ? "Person" : "Personen"}</td>
                    <td>{formatVoltage(product.power.voltage)}{product.power.kw ? ` · ${formatPower(product.power.kw)}` : ""}</td>
                    <td>{formatPrice(product)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="collection-checks page-shell" aria-labelledby="collection-checks-title">
          <div><p className="eyebrow">Vor dem Kauf</p><h2 id="collection-checks-title">Drei Punkte, die die Tabelle nicht ersetzt.</h2></div>
          <ol>
            {collection.checks.map((check, index) => (
              <li key={check}><span>0{index + 1}</span><p>{check}</p></li>
            ))}
          </ol>
        </section>

        <aside className="collection-related page-shell" aria-labelledby="collection-related-title">
          <div><p className="eyebrow">Weiter eingrenzen</p><h2 id="collection-related-title">Andere belastbare Vorauswahlen.</h2></div>
          <div className="collection-related-grid">
            {relatedCollections.map((item) => (
              <Link href={`/de/${item.section}/${item.slug}/`} key={item.id}>
                <small>{item.kind}</small><strong>{item.title}</strong><span>{getCollectionProducts(item).length} Datensätze ↗</span>
              </Link>
            ))}
          </div>
        </aside>
      </article>
      <SiteFooter />
    </main>
  );
}
