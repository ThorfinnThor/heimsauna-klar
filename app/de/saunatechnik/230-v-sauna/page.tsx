import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import guide from "@/content/de/guides/230-v-sauna.json";
import { formatGermanDate, products } from "@/lib/products";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "230-V-Sauna: Anschluss, Leistung und Grenzen verständlich erklärt",
  description: guide.description,
  alternates: { canonical: "/de/saunatechnik/230-v-sauna/" },
};

export default function GuidePage() {
  const matchingProducts = products.filter((product) => product.power.voltage === 230);

  return (
    <main>
      <StructuredData data={articleJsonLd({ title: "230-V-Sauna: Anschluss, Leistung und Grenzen", description: guide.description, path: "/de/saunatechnik/230-v-sauna/", updatedAt: guide.updated_at })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Planung", path: "/de/planung/" },
        { name: "230-V-Sauna", path: "/de/saunatechnik/230-v-sauna/" },
      ])} />
      <SiteHeader />
      <article>
        <header className="guide-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
            <Link href="/de/">Start</Link><span>/</span><Link href="/de/planung/">Planung</Link><span>/</span><span>230-V-Sauna</span>
          </nav>
          <p className="eyebrow">Saunatechnik · aktualisiert {formatGermanDate(guide.updated_at)}</p>
          <h1>230 V ist ein Anschluss.<span>Noch keine Kaufentscheidung.</span></h1>
          <p>{guide.description}</p>
          <div className="quick-answer"><strong>Kurzantwort</strong><p>{guide.quick_answer}</p></div>
          <div className="guide-path-links" aria-label="Nächste Schritte"><Link className="button button-primary" href="/de/vergleiche/230-v-sauna/">230-V-Modelle vergleichen ↗</Link><Link className="text-link" href="/de/planung/platzbedarf/">Platzbedarf zuerst prüfen ↗</Link></div>
        </header>

        <section className="guide-checks page-shell" aria-labelledby="checks-title">
          <div><p className="eyebrow">Vor dem Produktvergleich</p><h2 id="checks-title">Diese drei Prüfungen sparen Fehlkäufe.</h2></div>
          <ol>
            {guide.checks.map((item, index) => (
              <li key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.copy}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="voltage-comparison page-shell" aria-labelledby="comparison-heading">
          <div>
            <p className="eyebrow">Orientierung, keine Installationsanleitung</p>
            <h2 id="comparison-heading">230 V und 400 V im Planungsprozess.</h2>
          </div>
          <table className="comparison-table">
            <caption className="visually-hidden">Planungsvergleich 230 Volt und 400 Volt</caption>
            <thead>
              <tr className="comparison-table-head">
                <th scope="col">Kriterium</th><th scope="col">230 V</th><th scope="col">400 V</th>
              </tr>
            </thead>
            <tbody>
              {guide.comparison.map((row) => (
                <tr className="comparison-table-row" key={row.label}>
                  <th scope="row">{row.label}</th><td>{row.v230}</td><td>{row.v400}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="matching-products page-shell" aria-labelledby="matching-title">
          <div>
            <p className="eyebrow">Im aktuellen Katalog</p>
            <h2 id="matching-title">Verifizierte 230-V-Datensätze.</h2>
            <p>Diese Liste ist noch keine Bestenliste. Sie zeigt nur Produkte, deren Kerndaten wir an der Herstellerquelle geprüft haben.</p>
          </div>
          <div className="matching-product-links">
            {matchingProducts.map((product) => (
              <Link href={`/de/produkte/${product.product_id}/`} key={product.product_id}>
                <small>{product.brand} · {product.sauna.type}</small>
                <strong>{product.model}</strong>
                <span>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm ↗</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="guide-sources page-shell">
          <div><p className="eyebrow">Quellen</p><h2>Technische Angaben und ihre Herkunft.</h2></div>
          <ol>
            {guide.sources.map((source) => (
              <li key={source.url}><span>{source.publisher}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>
            ))}
          </ol>
          <p className="safety-box"><strong>Wichtig:</strong> Diese Seite ersetzt weder die Herstelleranleitung noch die Prüfung durch eine Elektrofachkraft. Maßgeblich sind das konkrete Produkt, der vorhandene Stromkreis und die örtlichen Bedingungen.</p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
