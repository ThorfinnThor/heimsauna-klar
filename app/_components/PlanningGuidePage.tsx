import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { formatGermanDate, getLatestOfferCheck, products } from "@/lib/products";
import { getPriceSnapshot, planningGuides, type PlanningGuide } from "@/lib/planning-guides";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
}

export function PlanningGuidePage({ guide }: { guide: PlanningGuide }) {
  const relatedGuides = planningGuides.filter((item) => item.slug !== guide.slug);
  const latestOfferCheck = getLatestOfferCheck(products);
  const path = `/de/planung/${guide.slug}/`;

  return (
    <main>
      <StructuredData data={articleJsonLd({ title: guide.title, description: guide.description, path, updatedAt: guide.updated_at })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Planung", path: "/de/planung/" },
        { name: guide.title, path },
      ])} />
      <SiteHeader />
      <article>
        <header className="guide-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
            <Link href="/de/">Start</Link><span>/</span><Link href="/de/planung/">Planung</Link><span>/</span><span>{guide.title}</span>
          </nav>
          <p className="eyebrow">{guide.eyebrow} · aktualisiert {formatGermanDate(guide.updated_at)}</p>
          <h1>{guide.title}<span>{guide.accent}</span></h1>
          <p>{guide.description}</p>
          <div className="quick-answer"><strong>Kurzantwort</strong><p>{guide.summary}</p></div>
          <div className="guide-path-links" aria-label="Planung anwenden">
            <Link className="button button-primary" href="/de/produkte/">Produkte filtern ↗</Link>
            <Link className="text-link" href="/de/#finder">Sauna-Finder starten ↗</Link>
          </div>
        </header>

        <section className="planning-sections page-shell" aria-label="Planungsschritte">
          {guide.sections.map((section, index) => (
            <section className="planning-section" key={section.title}>
              <span>0{index + 1}</span>
              <div><h2>{section.title}</h2><p>{section.copy}</p><ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
            </section>
          ))}
        </section>

        {guide.catalog_snapshot === "product_prices" ? (
          <section className="price-snapshot page-shell" aria-labelledby="price-snapshot-title">
            <div className="price-snapshot-head">
              <div><p className="eyebrow">Katalog-Momentaufnahme</p><h2 id="price-snapshot-title">Produktpreise, die wir belegen können.</h2></div>
              <p>{latestOfferCheck ? `Angebote zuletzt bis ${formatGermanDate(latestOfferCheck)} geprüft.` : "Kein aktuelles Prüfdatum verfügbar."} Montage- und Projektkosten sind nicht enthalten.</p>
            </div>
            <div className="price-snapshot-grid">
              {getPriceSnapshot().map((item) => (
                <article key={item.id}><small>{item.label} · {item.count} Preise</small><strong>{formatEuro(item.median)}</strong><span>Median · Spanne {formatEuro(item.minimum)} bis {formatEuro(item.maximum)}</span></article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="guide-checks page-shell" aria-labelledby="planning-checklist-title">
          <div><p className="eyebrow">Arbeitsliste</p><h2 id="planning-checklist-title">Vor der Produktauswahl abhaken.</h2></div>
          <ol>{guide.checklist.map((item, index) => <li key={item}><span>0{index + 1}</span><div><p>{item}</p></div></li>)}</ol>
        </section>

        <section className="guide-sources page-shell" aria-labelledby="planning-sources-title">
          <div><p className="eyebrow">Primärquellen</p><h2 id="planning-sources-title">Anleitung vor Allgemeinregel.</h2></div>
          <div>
            <ol>{guide.sources.map((source) => <li key={source.url}><span>{formatGermanDate(source.checked_at)}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ol>
            <p className="safety-box"><strong>Wichtig:</strong> Diese Seite ist eine Planungshilfe. Montageanleitung, Statik, örtliche Bauvorgaben und Arbeiten an der Elektroinstallation gehören zur Prüfung durch die jeweils zuständigen Fachleute.</p>
          </div>
        </section>

        <aside className="collection-related page-shell" aria-labelledby="related-planning-title">
          <div><p className="eyebrow">Weiterplanen</p><h2 id="related-planning-title">Die nächsten offenen Punkte.</h2></div>
          <div className="collection-related-grid">{relatedGuides.map((item) => <Link href={`/de/planung/${item.slug}/`} key={item.slug}><small>Planungsseite</small><strong>{item.title}</strong><span>Weiterlesen ↗</span></Link>)}</div>
        </aside>
      </article>
      <SiteFooter />
    </main>
  );
}
