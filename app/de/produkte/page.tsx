import type { Metadata } from "next";
import { ProductCatalog } from "@/app/_components/ProductCatalog";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { products } from "@/lib/products";

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

      <ProductCatalog products={products} />
      <SiteFooter />
    </main>
  );
}
