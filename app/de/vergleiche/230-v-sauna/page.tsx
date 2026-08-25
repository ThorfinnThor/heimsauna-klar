import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { formatGermanDate, formatPower, formatPrice, getLatestOfferCheck, products } from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "230-V-Sauna Vergleich: kompakte Modelle im Datencheck",
  description: "Ein transparenter Vergleich verifizierter 230-V-Sauna- und Infrarot-Datensätze nach Maßen, Kapazität, Leistung und Preisstatus.",
  alternates: { canonical: "/de/vergleiche/230-v-sauna/" },
};

export default function ComparisonPage() {
  const candidates = products.filter((product) => product.power.voltage === 230);
  const latestOfferCheck = getLatestOfferCheck(candidates);

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: "230-V-Sauna Vergleich", description: metadata.description as string, path: "/de/vergleiche/230-v-sauna/" })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Produkte", path: "/de/produkte/" },
        { name: "230-V-Sauna", path: "/de/vergleiche/230-v-sauna/" },
      ])} />
      <SiteHeader />
      <article>
        <header className="comparison-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
            <Link href="/de/">Start</Link><span>/</span><Link href="/de/produkte/">Produkte</Link><span>/</span><span>230-V-Sauna</span>
          </nav>
          <p className="eyebrow">Datenvergleich · Stand {latestOfferCheck ? formatGermanDate(latestOfferCheck) : "nicht verfügbar"}</p>
          <h1>230 V vergleichen,<span>ohne Äpfel mit Saunen zu mischen.</span></h1>
          <p>Diese Seite vergleicht belegte Herstellerangaben zu Anschluss, Leistung, Abmessungen und Preisstand. Eigene Produkttests liegen nicht vor.</p>
          <div className="guide-path-links" aria-label="Vergleich vorbereiten"><Link className="button button-primary" href="/de/saunatechnik/230-v-sauna/">230 V verstehen ↗</Link><Link className="text-link" href="/de/planung/platzbedarf/">Platzbedarf prüfen ↗</Link></div>
        </header>

        <section className="comparison-data page-shell" aria-labelledby="comparison-data-title">
          <div className="comparison-data-head">
            <div><p className="eyebrow">Kompakte Übersicht</p><h2 id="comparison-data-title">{candidates.length} verifizierte Datensätze.</h2></div>
            <p>Sortierung folgt keinem geheimen Score. Öffne den Datensatz, prüfe die Quelle und entscheide nach deinen Constraints.</p>
          </div>
          <div className="product-comparison-table">
            <div className="product-comparison-row product-comparison-heading">
              <span>Produkt</span><span>Außenmaß B × T × H</span><span>Kapazität</span><span>Leistung</span><span>Preis</span>
            </div>
            {candidates.map((product) => (
              <Link className="product-comparison-row" href={`/de/produkte/${product.product_id}/`} key={product.product_id}>
                <span><small>{product.brand} · {product.sauna.type}</small><strong>{product.model}</strong></span>
                <span>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</span>
                <span>bis {product.people.max} {product.people.max === 1 ? "Person" : "Personen"}</span>
                <span>{formatPower(product.power.kw)}</span>
                <span>{formatPrice(product)} ↗</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="comparison-method page-shell">
          <div><p className="eyebrow">Einordnung</p><h2>Grenzen der Vergleichsdaten.</h2></div>
          <div>
            <ul>
              <li>Aufheizzeit und Komfort wurden bisher nicht selbst getestet.</li>
              <li>Die Eignung von 230 V hängt vom konkreten Gerät, Raum und Stromkreis ab.</li>
              <li>Die aktuellen Händlerlinks sind nicht affiliiert; Provisionen beeinflussen die Sortierung nicht.</li>
            </ul>
            <p className="safety-box"><strong>Elektrik:</strong> Herstelleranleitung, Stromkreis und örtliche Bedingungen prüfen. Arbeiten an Netzspannung gehören in die Hände einer Elektrofachkraft.</p>
            <div className="collection-planning">
              <p className="eyebrow">Versorgung im Zusammenhang</p>
              <p>Spannung und Ofenleistung werden erst zusammen mit Raumvolumen, Absicherung und Herstellerfreigabe zu einer belastbaren Auswahl.</p>
              <div className="collection-planning-links">
                <Link href="/de/planung/230-v-vs-400-v-sauna/"><small>Anschluss und Leistung</small><strong>230 V oder 400 V einordnen</strong><span>Planung öffnen ↗</span></Link>
                <Link href="/de/planung/saunagroesse-3-6-kw/"><small>Ofen und Raumvolumen</small><strong>Welche Größe passt zu 3,6 kW?</strong><span>Planung öffnen ↗</span></Link>
              </div>
            </div>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
