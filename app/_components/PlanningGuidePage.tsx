import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import {
  getPlanningPresentation,
  getPlanningProfile,
  type PlanningModule,
  type PlanningPresentation,
} from "@/lib/page-presentations";
import { formatGermanDate, getOfferDateRange, products } from "@/lib/products";
import { getPlanningGuide, getPlanningJourney, getPriceSnapshot, type PlanningGuide } from "@/lib/planning-guides";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
}

type PlanningPageContext = {
  guide: PlanningGuide;
  presentation: PlanningPresentation;
  offerDateRange: { oldest: string | null; newest: string | null };
};

export function PlanningGuidePage({ guide }: { guide: PlanningGuide }) {
  const journey = getPlanningJourney(guide.slug);
  const relatedGuides = journey?.related_slugs.flatMap((slug) => {
    const relatedGuide = getPlanningGuide(slug);
    return relatedGuide ? [relatedGuide] : [];
  }) ?? [];
  const offerDateRange = getOfferDateRange(products);
  const presentation = getPlanningPresentation(guide.slug);
  const context = { guide, presentation, offerDateRange };
  const path = `/de/planung/${guide.slug}/`;

  return (
    <main>
      <StructuredData data={articleJsonLd({
        title: guide.title,
        description: guide.description,
        path,
        updatedAt: guide.updated_at,
        sources: guide.sources.map((source) => source.url),
      })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Planung", path: "/de/planung/" },
        { name: guide.title, path },
      ])} />
      <SiteHeader />
      <article data-page-kind="planning-guide" data-page-profile={getPlanningProfile(presentation)}>
        <PlanningHero guide={guide} presentation={presentation} productHref={journey?.product_href ?? "/de/produkte/"} productLabel={journey?.product_label ?? "Produkte filtern"} />
        {presentation.flow.map((module) => <PlanningModuleBlock context={context} module={module} key={module} />)}
        <PlanningRelated guide={guide} guides={relatedGuides} />
      </article>
      <SiteFooter />
    </main>
  );
}

function PlanningHero({ guide, presentation, productHref, productLabel }: {
  guide: PlanningGuide;
  presentation: PlanningPresentation;
  productHref: string;
  productLabel: string;
}) {
  return (
    <header className={`guide-hero guide-hero-${presentation.hero} page-shell`}>
      <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
        <Link href="/de/">Start</Link><span>/</span><Link href="/de/planung/">Planung</Link><span>/</span><span>{guide.title}</span>
      </nav>
      <div className="guide-hero-copy">
        <p className="eyebrow">{guide.eyebrow}</p>
        <h1>{guide.title}<span>{guide.accent}</span></h1>
        <p>{guide.description}</p>
        <p className="content-byline">Redaktion: <Link href="/de/ueber-uns/#redaktion">Schayan Yousefian</Link> · aktualisiert {formatGermanDate(guide.updated_at)}</p>
      </div>
      <div className="quick-answer"><strong>Kurzantwort</strong><p>{guide.summary}</p></div>
      <div className="guide-path-links" aria-label="Planung anwenden">
        <Link className="button button-primary" href={productHref}>{productLabel} ↗</Link>
        <Link className="text-link" href="/de/#finder">Sauna-Finder starten ↗</Link>
      </div>
    </header>
  );
}

function PlanningModuleBlock({ context, module }: { context: PlanningPageContext; module: PlanningModule }) {
  if (module === "insight") return <PlanningInsight presentation={context.presentation} />;
  if (module === "sections") return <PlanningSections guide={context.guide} variant={context.presentation.sections} />;
  if (module === "snapshot") return <GuidePriceSnapshot offerDateRange={context.offerDateRange} />;
  if (module === "checks") return <PlanningChecks guide={context.guide} />;
  return <PlanningSources guide={context.guide} />;
}

function PlanningInsight({ presentation }: { presentation: PlanningPresentation }) {
  const { insight } = presentation;
  return (
    <section className={`planning-insight planning-insight-${presentation.insight_style} page-shell`} aria-labelledby="planning-insight-title" data-page-module="insight">
      <div><p className="eyebrow">{insight.kicker}</p><h2 id="planning-insight-title">{insight.title}</h2></div>
      <div className="planning-insight-reading">
        {insight.copy.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}
        {insight.points.length > 0 ? <ul>{insight.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
      </div>
    </section>
  );
}

function PlanningSections({ guide, variant }: { guide: PlanningGuide; variant: PlanningPresentation["sections"] }) {
  return (
    <section className={`planning-sections planning-sections-${variant} page-shell`} aria-label="Planungsschritte" data-page-module="sections">
      {guide.sections.map((section, index) => <PlanningSection section={section} index={index} variant={variant} key={section.title} />)}
    </section>
  );
}

function PlanningSection({ section, index, variant }: {
  section: PlanningGuide["sections"][number];
  index: number;
  variant: PlanningPresentation["sections"];
}) {
  const number = `0${index + 1}`;
  if (variant === "technical") return <section className="planning-section planning-section-technical"><header><span>{number}</span><h2>{section.title}</h2></header><div><p data-editorial-copy="true">{section.copy}</p>{section.points.length > 0 ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}</div></section>;
  if (variant === "timeline") return <section className="planning-section planning-section-timeline"><span>{number}</span><div><p className="eyebrow">Planungsabschnitt</p><h2>{section.title}</h2><p data-editorial-copy="true">{section.copy}</p></div>{section.points.length > 0 ? <ol>{section.points.map((point, pointIndex) => <li key={point}><small>{index + 1}.{pointIndex + 1}</small>{point}</li>)}</ol> : null}</section>;
  if (variant === "cards") return <article className="planning-section planning-section-card"><span>{number}</span><h2>{section.title}</h2><p data-editorial-copy="true">{section.copy}</p>{section.points.length > 0 ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}</article>;
  if (variant === "ledger") return <section className="planning-section planning-section-ledger"><header><span>{number}</span><h2>{section.title}</h2><p data-editorial-copy="true">{section.copy}</p></header>{section.points.length > 0 ? <dl>{section.points.map((point, pointIndex) => <div key={point}><dt>{String(pointIndex + 1).padStart(2, "0")}</dt><dd>{point}</dd></div>)}</dl> : null}</section>;
  if (variant === "alternating") return <section className="planning-section planning-section-alternating"><div><span>{number}</span><h2>{section.title}</h2></div><div><p data-editorial-copy="true">{section.copy}</p>{section.points.length > 0 ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}</div></section>;
  return <section className="planning-section planning-section-staggered"><span>{number}</span><div><h2>{section.title}</h2><p data-editorial-copy="true">{section.copy}</p>{section.points.length > 0 ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}</div></section>;
}

function PlanningChecks({ guide }: { guide: PlanningGuide }) {
  return (
    <section className="guide-checks page-shell" aria-labelledby="planning-checklist-title" data-page-module="checks">
      <div><p className="eyebrow">{guide.module_copy.checklist_kicker}</p><h2 id="planning-checklist-title">{guide.module_copy.checklist_title}</h2></div>
      <ol>{guide.checklist.map((item, index) => <li key={item}><span>0{index + 1}</span><div><p>{item}</p></div></li>)}</ol>
    </section>
  );
}

function PlanningSources({ guide }: { guide: PlanningGuide }) {
  return (
    <section className="guide-sources page-shell" aria-labelledby="planning-sources-title" data-page-module="sources">
      <div><p className="eyebrow">{guide.module_copy.sources_kicker}</p><h2 id="planning-sources-title">{guide.module_copy.sources_title}</h2></div>
      <div>
        <ol>{guide.sources.map((source) => <li key={source.url}><span>{formatGermanDate(source.checked_at)}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ol>
        <p className="safety-box"><strong>Hinweis</strong> {guide.module_copy.source_note}</p>
      </div>
    </section>
  );
}

function PlanningRelated({ guide, guides }: { guide: PlanningGuide; guides: PlanningGuide[] }) {
  return (
    <aside className="collection-related page-shell" aria-labelledby="related-planning-title" data-page-module="related">
      <div><p className="eyebrow">{guide.module_copy.related_kicker}</p><h2 id="related-planning-title">{guide.module_copy.related_title}</h2></div>
      <div className="collection-related-grid">{guides.map((item) => <Link href={`/de/planung/${item.slug}/`} key={item.slug}><small>Planungsseite</small><strong>{item.title}</strong><span>Weiterlesen ↗</span></Link>)}</div>
    </aside>
  );
}

function GuidePriceSnapshot({ offerDateRange }: { offerDateRange: { oldest: string | null; newest: string | null } }) {
  return (
    <section className="price-snapshot page-shell" aria-labelledby="price-snapshot-title" data-page-module="snapshot">
      <div className="price-snapshot-head"><div><p className="eyebrow">Katalog-Momentaufnahme</p><h2 id="price-snapshot-title">Produktpreise, die wir belegen können.</h2></div><p>{offerDateRange.oldest && offerDateRange.newest ? `Angebote geprüft zwischen ${formatGermanDate(offerDateRange.oldest)} und ${formatGermanDate(offerDateRange.newest)}.` : "Kein aktuelles Prüfdatum verfügbar."} Montage- und Projektkosten sind nicht enthalten.</p></div>
      <div className="price-snapshot-grid">{getPriceSnapshot().map((item) => <article key={item.id}><small>{item.label} · {item.count} Preise</small><strong>{formatEuro(item.median)}</strong><span>Median · Spanne {formatEuro(item.minimum)} bis {formatEuro(item.maximum)}</span></article>)}</div>
    </section>
  );
}
