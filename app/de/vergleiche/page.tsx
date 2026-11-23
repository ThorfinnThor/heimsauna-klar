import Link from "next/link";
import { Breadcrumbs } from "@/app/_components/Blocks";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { collectionSectionLabels, getCollectionPath, getCollectionProducts, indexableCollections, type Collection } from "@/lib/collections";
import { createPageMetadata } from "@/lib/metadata";
import { products } from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const title = "Sauna-Vergleiche nach Größe, Personen und Preis";
const description = "Alle Sauna-Vergleiche im Überblick: Innensaunen, Infrarotkabinen und Gartensaunen nach Personenzahl, Stellfläche, Stromanschluss und Budget.";
const path = "/de/vergleiche/";

export const metadata = createPageMetadata({ title, description, path });

const sections: Collection["section"][] = ["indoor-sauna", "outdoor-sauna", "vergleiche"];

export default function ComparisonsHubPage() {
  const plugCount = products.filter((product) => product.power.voltage === 230).length;
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Vergleiche", path }])} />
      <SiteHeader />
      <div className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Vergleiche" }]} />
        <h1>Sauna-Vergleiche</h1>
        <p className="text">Jede Liste hat einen anderen Schwerpunkt. Wenn du noch nicht weißt, wie viel Platz du brauchst, hilft der Beitrag <Link href="/de/planung/platzbedarf/">Wie viel Platz braucht eine Sauna?</Link> Was dich das Ganze kostet, steht unter <Link href="/de/planung/sauna-kosten/">Was kostet eine Heimsauna?</Link></p>
        {sections.map((section) => (
          <section id={section} key={section}>
            <h2>{collectionSectionLabels[section]}</h2>
            <ul className="linklist">
              {section === "vergleiche" ? <li><Link href="/de/vergleiche/230-v-sauna/">Saunen für 230 Volt</Link> <small>({plugCount})</small></li> : null}
              {indexableCollections.filter((collection) => collection.section === section).map((collection) => (
                <li key={collection.id}><Link href={getCollectionPath(collection)}>{collection.title}</Link> <small>({getCollectionProducts(collection).length})</small></li>
              ))}
            </ul>
          </section>
        ))}
        <p><Link href="/de/produkte/">Alle Saunen mit Filter</Link></p>
      </div>
      <SiteFooter />
    </main>
  );
}
