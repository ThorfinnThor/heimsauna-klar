import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import { createPageMetadata } from "@/lib/metadata";

const path = "/de/ueber-uns/";
const title = "Über Select Your Sauna: Redaktion und Methodik";
const description = "Wer Select Your Sauna betreibt, wie Produktdaten geprüft werden und nach welchen Regeln die Planungshilfen und Vergleiche entstehen.";

export const metadata = createPageMetadata({
  title,
  description,
  path,
});

export default function AboutPage() {
  return (
    <main>
      <StructuredData data={aboutPageJsonLd({ title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Über uns", path },
      ])} />
      <SiteHeader />
      <article className="about-page">
        <header className="about-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
            <Link href="/de/">Start</Link><span>/</span><span>Über uns</span>
          </nav>
          <p className="eyebrow">Über Select Your Sauna · Stand 28.08.2026</p>
          <h1>Saunaplanung mit nachvollziehbaren Produktdaten.</h1>
          <div className="about-hero-copy">
            <p>Select Your Sauna ist eine deutschsprachige Planungs- und Vergleichsplattform für private Saunen. Betreiber ist das Einzelunternehmen SeitenHafen361 von Schayan Yousefian.</p>
            <p>Die Website verkauft keine Saunen. Sie führt technische Angaben, Preise und Bezugsquellen zusammen, damit sich Modelle anhand des vorgesehenen Standorts, der verfügbaren Fläche, des Stromanschlusses und des Budgets eingrenzen lassen.</p>
          </div>
        </header>

        <section className="about-purpose page-shell" aria-labelledby="about-purpose-title">
          <div>
            <p className="eyebrow">Aufgabe der Website</p>
            <h2 id="about-purpose-title">Welche Fragen die Inhalte beantworten</h2>
          </div>
          <div className="about-purpose-copy">
            <p>Der Sauna-Finder und die Vergleichsseiten ordnen dokumentierte Produkte nach konkreten Anforderungen. Dazu zählen unter anderem Innen- oder Außenaufstellung, Personenzahl, Produktfläche, Wärmeart, Spannung und Preisrahmen.</p>
            <p>Planungsratgeber behandeln Themen, die vor der Produktauswahl geklärt werden sollten: Elektroanschluss, Aufstellfläche, Abstände, Belüftung und die Grenzen von Herstellerangaben.</p>
            <div className="about-actions">
              <Link className="button button-primary" href="/de/#finder">Sauna-Finder öffnen</Link>
              <Link className="text-link" href="/de/planung/">Planungsratgeber ansehen →</Link>
            </div>
          </div>
        </section>

        <section className="about-method" aria-labelledby="about-method-title">
          <div className="page-shell about-method-grid">
            <div>
              <p className="eyebrow eyebrow-light">Arbeitsweise</p>
              <h2 id="about-method-title">So werden Produktangaben geprüft</h2>
            </div>
            <ol>
              <li><span>01</span><div><h3>Quelle erfassen</h3><p>Ausgangspunkt sind öffentlich zugängliche Herstellerseiten, technische Unterlagen und konkrete Angebotsseiten. Die verwendete URL und das Prüfdatum bleiben am Produkt sichtbar.</p></div></li>
              <li><span>02</span><div><h3>Angaben getrennt führen</h3><p>Maße, Kapazität, Spannung, Ofenart und Preis werden als einzelne Datenpunkte gespeichert. Fehlende technische Angaben werden nicht aus ähnlichen Modellen abgeleitet.</p></div></li>
              <li><span>03</span><div><h3>Widersprüche kenntlich machen</h3><p>Weichen Quellen voneinander ab oder ist eine Eigenschaft nicht belegt, wird die Lücke im Datensatz ausgewiesen. Ein unbekannter Wert gilt im Finder nicht als bestätigte Übereinstimmung.</p></div></li>
              <li><span>04</span><div><h3>Einordnung ergänzen</h3><p>Die redaktionelle Einordnung beschreibt Einsatzbereich und Grenzen eines Modells. Sie wird von den übernommenen Hersteller- und Händlerangaben getrennt.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="about-standards page-shell" aria-labelledby="about-standards-title">
          <header>
            <p className="eyebrow">Redaktionelle Regeln</p>
            <h2 id="about-standards-title">Wie Produkte eingeordnet werden</h2>
          </header>
          <div className="about-standard-grid">
            <article><h3>Bewertung nach Anforderungen</h3><p>Ein Produkt erscheint passend, wenn seine dokumentierten Eigenschaften zu den gewählten Anforderungen passen. Die Reihenfolge ist kein Beleg für einen allgemeinen Testsieg.</p></article>
            <article><h3>Praxistests nur mit Dokumentation</h3><p>Die aktuellen Inhalte beruhen auf Quellen- und Datenprüfung. Eigene Messungen oder Langzeittests werden nur genannt, wenn sie tatsächlich durchgeführt und beschrieben wurden.</p></article>
            <article><h3>Kennzeichnung von Werbung</h3><p>Vergütete Links werden gekennzeichnet. Eine mögliche Provision verändert weder den Preis für Nutzer noch die dokumentierten Produkteigenschaften.</p></article>
          </div>
          <div className="about-reference-row">
            <Link className="text-link" href="/de/produkte/">Produktkatalog öffnen →</Link>
            <Link className="text-link" href="/de/transparenz/affiliate/">Affiliate-Regeln und aktuellen Status lesen →</Link>
          </div>
        </section>

        <section className="about-contact page-shell" aria-labelledby="about-contact-title">
          <p className="eyebrow">Kontakt</p>
          <div>
            <h2 id="about-contact-title">Verantwortung und Rückfragen</h2>
            <p>Betreiber: SeitenHafen361, Inhaber Schayan Yousefian, Freienwalder Str. 34, 13359 Berlin.</p>
            <p>Hinweise zu fehlerhaften oder veralteten Produktangaben können per E-Mail an <a className="text-link" href="mailto:info@selectyoursauna.com">info@selectyoursauna.com</a> gesendet werden.</p>
            <Link className="text-link" href="/de/rechtliches/">Impressum und Datenschutz →</Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
