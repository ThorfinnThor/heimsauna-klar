import Link from "next/link";
import { Breadcrumbs } from "@/app/_components/Blocks";
import { ProductCatalog } from "@/app/_components/ProductCatalog";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { createPageMetadata } from "@/lib/metadata";
import { getCatalogStats, products } from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const title = "Alle Saunen und Infrarotkabinen";
const description = "Über 500 Saunen und Infrarotkabinen durchsuchen: nach Größe, Personenzahl, Stromanschluss und Preis filtern und Händler vergleichen.";

export const metadata = createPageMetadata({ title, description, path: "/de/produkte/" });

export default function ProductsPage() {
  const { total, categoryCounts } = getCatalogStats(products);
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title, description, path: "/de/produkte/" })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Alle Saunen", path: "/de/produkte/" }])} />
      <SiteHeader />
      <div className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Alle Saunen" }]} />
        <h1>{title}</h1>
        <p className="text">{total} Modelle, davon {categoryCounts.indoor} Innensaunen, {categoryCounts.outdoor} Gartensaunen, {categoryCounts.infrared} Infrarotkabinen und {categoryCounts.mobile} Saunazelte. Lieber vorsortiert? Dann schau in die <Link href="/de/vergleiche/">Vergleiche</Link>.</p>
        <ProductCatalog products={products} />
      </div>
      <SiteFooter />
    </main>
  );
}
