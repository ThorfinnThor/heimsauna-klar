import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { formatPrice, products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Sauna-Produkte mit geprüften technischen Daten",
  description: "Ein wachsender Katalog für Heimsaunen mit Quellen, Prüfdatum und transparentem Teststatus.",
  alternates: { canonical: "/de/produkte/" },
};

export default function ProductsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero page-shell">
        <p className="eyebrow">Produktkatalog · Deutschland</p>
        <h1>Technische Daten,<span>bevor wir bewerten.</span></h1>
        <p>Jeder veröffentlichte Datensatz nennt seine Quelle, das letzte Prüfdatum und ob ein Produkt tatsächlich getestet wurde.</p>
        <div className="catalog-metrics">
          <span><strong>{products.length}</strong> verifizierte Datensätze</span>
          <span><strong>0</strong> bezahlte Platzierungen</span>
          <span><strong>0</strong> behauptete Tests ohne Test</span>
        </div>
      </section>

      <section className="catalog-list page-shell" aria-label="Verifizierte Produkte">
        {products.map((product, index) => (
          <article className="catalog-row" key={product.product_id}>
            <span className="catalog-index">0{index + 1}</span>
            <div>
              <p className="type-label">{product.brand} · {product.sauna.type}</p>
              <h2>{product.model}</h2>
              <p>{product.editorial.disclosure}</p>
            </div>
            <dl>
              <div><dt>Maße</dt><dd>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</dd></div>
              <div><dt>Strom</dt><dd>{product.power.voltage} V{product.power.kw ? ` · ${product.power.kw} kW` : ""}</dd></div>
              <div><dt>Kapazität</dt><dd>bis {product.people.max} {product.people.max === 1 ? "Person" : "Personen"}</dd></div>
              <div><dt>Preisstatus</dt><dd>{formatPrice(product)}</dd></div>
            </dl>
            <a className="catalog-row-link" href={`/de/produkte/${product.product_id}/`}>Datensatz ansehen <span aria-hidden="true">↗</span></a>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
