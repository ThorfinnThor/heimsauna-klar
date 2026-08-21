import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { formatGermanDate, formatPrice, getLatestOfferCheck, products } from "@/lib/products";
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
          <p>Diese Seite vergleicht nur Felder, die wir an einer Herstellerquelle nachvollziehen können. Sie ist keine bezahlte Rangliste und kein eigener Produkttest.</p>
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
                <span>{product.power.kw ? `${product.power.kw} kW` : "nicht ausgewiesen"}</span>
                <span>{formatPrice(product)} ↗</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="comparison-method page-shell">
          <div><p className="eyebrow">Einordnung</p><h2>Was diese Tabelle nicht behauptet.</h2></div>
          <div>
            <ul>
              <li>Keine Aussage über reale Aufheizzeit oder Komfort — dafür fehlt ein eigener Test.</li>
              <li>Keine pauschale Aussage, dass 230 V für jeden Raum oder Stromkreis geeignet ist.</li>
              <li>Kein Ranking nach Provision: Die aktuellen Links sind nicht affiliiert.</li>
            </ul>
            <p className="safety-box"><strong>Elektrik:</strong> Herstelleranleitung, Stromkreis und örtliche Bedingungen prüfen. Arbeiten an Netzspannung gehören in die Hände einer Elektrofachkraft.</p>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
