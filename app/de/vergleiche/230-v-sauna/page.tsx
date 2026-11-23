import Link from "next/link";
import { Breadcrumbs } from "@/app/_components/Blocks";
import { ProductPicks, ProductRows } from "@/app/_components/ProductRows";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { getFootprintSquareMeters, getLowestPrice } from "@/lib/collections";
import { createPageMetadata } from "@/lib/metadata";
import { products, type Product } from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const title = "Saunen für 230 Volt im Vergleich";
const description = "Saunen und Infrarotkabinen, die laut Hersteller an 230 Volt laufen: Größe, Leistung, Personenzahl und Preise im Vergleich.";
const path = "/de/vergleiche/230-v-sauna/";

export const metadata = createPageMetadata({ title, description, path });

const price = (product: Product) => getLowestPrice(product) ?? Number.POSITIVE_INFINITY;

export default function PlugInComparisonPage() {
  const models = products
    .filter((product) => product.power.voltage === 230)
    .toSorted((a, b) => getFootprintSquareMeters(a) - getFootprintSquareMeters(b) || a.model.localeCompare(b.model, "de"));
  const infrared = models.filter((product) => product.category === "infrared");
  const withHeater = models.filter((product) => product.sauna.type === "Finnische Sauna").toSorted((a, b) => price(a) - price(b));
  const cheapestInfrared = infrared.toSorted((a, b) => price(a) - price(b))[0];

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Vergleiche", path: "/de/vergleiche/" }, { name: title, path }])} />
      <SiteHeader />
      <article className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Vergleiche", href: "/de/vergleiche/" }, { label: "Saunen für 230 Volt" }]} />
        <h1>{title}</h1>
        <div className="text">
          <p>{models.length} Modelle laufen laut Hersteller an 230 Volt. Die meisten davon sind Infrarotkabinen. Wer eine richtige Sauna mit Ofen will, findet {withHeater.length} finnische Modelle, fast alle klein und mit einem Ofen um 3,6 kW.</p>
          <p>230 Volt heißt nicht immer Schukostecker. Manche Öfen müssen fest angeschlossen werden, und auch bei einem Stecker sollte auf dem Stromkreis noch genug frei sein. Was dahintersteckt, erklären wir unter <Link href="/de/saunatechnik/230-v-sauna/">230-Volt-Sauna erklärt</Link>.</p>
        </div>
        <ProductPicks picks={[
          { label: "Günstigste Infrarotkabine", product: cheapestInfrared },
          { label: "Günstigste finnische Sauna", product: withHeater[0] },
          { label: "Am kleinsten", product: models[0] },
        ].filter((pick, index, list) => pick.product && list.findIndex((other) => other.product?.product_id === pick.product.product_id) === index)} />
        <section>
          <h2>Alle {models.length} Modelle für 230 Volt</h2>
          <p className="updated">Sortiert nach Stellfläche.</p>
          <ProductRows products={models} />
        </section>
        <section className="text">
          <h2>Mehr dazu</h2>
          <ul>
            <li><Link href="/de/planung/230-v-vs-400-v-sauna/">230 V oder 400 V für die Sauna?</Link></li>
            <li><Link href="/de/planung/saunagroesse-3-6-kw/">Wie groß darf eine Sauna mit 3,6 kW sein?</Link></li>
            <li><Link href="/de/planung/platzbedarf/">Wie viel Platz braucht eine Sauna?</Link></li>
          </ul>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
