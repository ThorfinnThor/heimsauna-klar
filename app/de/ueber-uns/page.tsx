import Link from "next/link";
import { Breadcrumbs } from "@/app/_components/Blocks";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { createPageMetadata } from "@/lib/metadata";
import { products } from "@/lib/products";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

const path = "/de/ueber-uns/";
const title = "Über Select Your Sauna";
const description = "Wer hinter Select Your Sauna steht, woher die Angaben zu den Saunen kommen und womit die Seite Geld verdient.";

export const metadata = createPageMetadata({ title, description, path });

export default function AboutPage() {
  return (
    <main>
      <StructuredData data={aboutPageJsonLd({ title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Über uns", path }])} />
      <SiteHeader />
      <article className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Über uns" }]} />
        <h1>{title}</h1>
        <div className="text">
          <p className="lead">Wer eine Sauna für zu Hause sucht, klickt sich durch viele Shops und findet überall andere Angaben. Hier stehen {products.length} Modelle nebeneinander, mit Maßen, Anschluss und Preis.</p>

          <h2>Woher die Angaben kommen</h2>
          <p>Wir lesen Produktseiten, Datenblätter und Montageanleitungen der Hersteller und die Angebote der Shops. Auf jeder Produktseite sind diese Quellen verlinkt. Steht eine Angabe nirgends, bleibt sie leer. Wir übernehmen sie nicht von einem ähnlichen Modell.</p>
          <p>Aufgebaut oder getestet haben wir die Saunen nicht. Deshalb gibt es hier auch keine Noten und keinen Testsieger. Die Listen sind nach Größe oder Preis sortiert.</p>

          <h2>Womit die Seite Geld verdient</h2>
          <p>Manche Links zu Shops sind Affiliate-Links. Kaufst du darüber, bekommen wir eine Provision, dein Preis bleibt gleich. Diese Links sind gekennzeichnet. Mehr dazu steht unter <Link href="/de/transparenz/affiliate/">Affiliate-Links</Link>.</p>

          <section id="redaktion">
            <h2>Wer dahintersteht</h2>
            <p id="schayan-yousefian">Redaktionell verantwortlich ist Schayan Yousefian, Inhaber des Einzelunternehmens SeitenHafen361, Freienwalder Str. 34, 13359 Berlin.</p>
            <p>Ist dir ein Fehler aufgefallen oder ein Preis veraltet? Schreib an <a href="mailto:info@selectyoursauna.com">info@selectyoursauna.com</a>. Für Elektrik, Statik und Baurecht sind wir die Falschen, da helfen Fachbetriebe und das Bauamt.</p>
            <p><Link href="/de/rechtliches/">Impressum und Datenschutz</Link></p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
