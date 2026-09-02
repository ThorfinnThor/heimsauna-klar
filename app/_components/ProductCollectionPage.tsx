import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import {
  collections,
  getCollectionProducts,
  getFootprintSquareMeters,
  getLowestPrice,
  type Collection,
} from "@/lib/collections";
import {
  getCollectionPresentation,
  getCollectionProfile,
  type CollectionModule,
  type CollectionPresentation,
} from "@/lib/page-presentations";
import { getPlanningGuide, type PlanningGuide } from "@/lib/planning-guides";
import {
  formatPower,
  formatPrice,
  formatVoltage,
  type Product,
} from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const sectionLabels: Record<Collection["section"], string> = {
  "indoor-sauna": "Indoor-Sauna",
  "outdoor-sauna": "Outdoor-Sauna",
  vergleiche: "Vergleiche",
};

type CollectionPageContext = {
  collection: Collection;
  candidates: Product[];
  planningGuides: PlanningGuide[];
  presentation: CollectionPresentation;
};

export function ProductCollectionPage({ collection }: { collection: Collection }) {
  const candidates = getCollectionProducts(collection);
  const minimumFootprint = Math.min(...candidates.map(getFootprintSquareMeters));
  const documentedPrices = candidates.map(getLowestPrice).filter((price): price is number => price !== null);
  const lowestPrice = documentedPrices.length > 0 ? Math.min(...documentedPrices) : null;
  const relatedCollections = collection.related_ids.map((id) => collections.find((item) => item.id === id)).filter((item): item is Collection => Boolean(item));
  const planningGuides = collection.planning.guide_ids.map(getPlanningGuide).filter((guide): guide is PlanningGuide => Boolean(guide));
  const presentation = getCollectionPresentation(collection.id);
  const pageContext = { collection, candidates, planningGuides, presentation };
  const path = `/de/${collection.section}/${collection.slug}/`;

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: collection.title, description: collection.description, path })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Produkte", path: "/de/produkte/" },
        { name: collection.title, path },
      ])} />
      <SiteHeader />
      <article data-page-kind="collection" data-page-profile={getCollectionProfile(presentation)}>
        <CollectionHero
          collection={collection}
          candidates={candidates}
          minimumFootprint={minimumFootprint}
          lowestPrice={lowestPrice}
          hero={presentation.hero}
        />
        {presentation.flow.map((module) => <CollectionModuleBlock context={pageContext} module={module} key={module} />)}
        <CollectionRelated collection={collection} collections={relatedCollections} />
      </article>
      <SiteFooter />
    </main>
  );
}

function CollectionHero({ collection, candidates, minimumFootprint, lowestPrice, hero }: {
  collection: Collection;
  candidates: Product[];
  minimumFootprint: number;
  lowestPrice: number | null;
  hero: CollectionPresentation["hero"];
}) {
  return (
    <header className={`collection-hero collection-hero-${hero} page-shell`}>
      <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
        <Link href="/de/">Start</Link><span>/</span><Link href="/de/produkte/">Produkte</Link><span>/</span>
        <span>{sectionLabels[collection.section]}</span><span>/</span><span>{collection.title}</span>
      </nav>
      <div className="collection-hero-copy">
        <p className="eyebrow">{collection.eyebrow}</p>
        <h1>{collection.title}{" "}<span>{collection.accent}</span></h1>
        <p>{collection.intro}</p>
      </div>
      <div className="collection-metrics" aria-label="Kennzahlen der Auswahl">
        <span><strong>{candidates.length}</strong> passende Produkte</span>
        <span><strong>{minimumFootprint.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m²</strong> kleinste Stellfläche</span>
        <span><strong>{lowestPrice === null ? "kein aktueller Preis" : `ab ${lowestPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}`}</strong> dokumentierter Preis</span>
      </div>
    </header>
  );
}

function CollectionModuleBlock({ context, module }: { context: CollectionPageContext; module: CollectionModule }) {
  if (module === "insight") return <CollectionInsight presentation={context.presentation} />;
  if (module === "editorial") return <CollectionEditorial collection={context.collection} />;
  if (module === "method") return <CollectionMethod collection={context.collection} planningGuides={context.planningGuides} variant={context.presentation.method} />;
  if (module === "results") return <CollectionResults collection={context.collection} candidates={context.candidates} variant={context.presentation.results} />;
  return <CollectionChecks collection={context.collection} />;
}

function CollectionInsight({ presentation }: { presentation: CollectionPresentation }) {
  const { insight } = presentation;
  return (
    <section className={`collection-insight collection-insight-${presentation.hero} page-shell`} aria-labelledby="collection-insight-title" data-page-module="insight">
      <div><p className="eyebrow">{insight.kicker}</p><h2 id="collection-insight-title">{insight.title}</h2></div>
      <div className="collection-insight-reading">
        {insight.copy.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}
        {insight.points.length > 0 ? <ul>{insight.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
      </div>
    </section>
  );
}

function CollectionMethod({ collection, planningGuides, variant }: {
  collection: Collection;
  planningGuides: PlanningGuide[];
  variant: CollectionPresentation["method"];
}) {
  return (
    <section className={`collection-method collection-method-${variant} page-shell`} aria-labelledby="collection-method-title" data-page-module="method">
      <div><p className="eyebrow">{collection.module_copy.method_kicker}</p><h2 id="collection-method-title">{collection.module_copy.method_title}</h2></div>
      <div>
        <ul>{collection.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
        <p>Die aufgeführten Werte stammen aus den dokumentierten Produkt- und Händlerangeboten.</p>
        <div className="collection-planning">
          <p className="eyebrow">{collection.planning.kicker}</p><p>{collection.planning.intro}</p>
          <div className="collection-planning-links">{planningGuides.map((guide) => <Link href={`/de/planung/${guide.slug}/`} key={guide.slug}><small>{guide.eyebrow}</small><strong>{guide.title}</strong><span>Planung öffnen ↗</span></Link>)}</div>
        </div>
      </div>
    </section>
  );
}

function CollectionResults({ collection, candidates, variant }: { collection: Collection; candidates: Product[]; variant: CollectionPresentation["results"] }) {
  return (
    <section className={`collection-results collection-results-${variant} page-shell`} aria-labelledby="collection-results-title" data-page-module="results">
      <div className="collection-results-head">
        <div><p className="eyebrow">{collection.module_copy.results_kicker}</p><h2 id="collection-results-title">{collection.module_copy.results_title.replace("{count}", String(candidates.length))}</h2></div>
        <p>{collection.module_copy.results_intro}</p>
      </div>
      {variant === "table" ? <CollectionResultsTable collection={collection} candidates={candidates} /> : null}
      {variant === "cards" ? <CollectionResultsCards candidates={candidates} /> : null}
      {variant === "ledger" ? <CollectionResultsLedger candidates={candidates} /> : null}
    </section>
  );
}

function CollectionResultsTable({ collection, candidates }: { collection: Collection; candidates: Product[] }) {
  return (
    <div className="collection-table-wrap"><table className="collection-table">
      <caption className="visually-hidden">{collection.title}: Vergleich der passenden Produkte</caption>
      <thead><tr><th>Produkt</th><th>Aufstellung</th><th>Stellfläche</th><th>Außenmaß B × T × H</th><th>Kapazität</th><th>Anschluss</th><th>Preis</th></tr></thead>
      <tbody>{candidates.map((product) => <tr key={product.product_id}>
        <td><small>{product.brand} · {product.sauna.type}</small><Link href={`/de/produkte/${product.product_id}/`}>{product.model} ↗</Link></td>
        <td>{product.sauna.indoor_outdoor === "indoor" ? "Innen" : "Außen"}</td><td>{formatFootprint(product)}</td><td>{formatDimensions(product)}</td><td>{formatCapacity(product)}</td><td>{formatConnection(product)}</td><td>{formatPrice(product)}</td>
      </tr>)}</tbody>
    </table></div>
  );
}

function CollectionResultsCards({ candidates }: { candidates: Product[] }) {
  return (
    <div className="collection-result-cards">{candidates.map((product, index) => <article key={product.product_id}>
      <span className="collection-result-index">{String(index + 1).padStart(2, "0")}</span><small>{product.brand} · {product.sauna.indoor_outdoor === "indoor" ? "Innen" : "Außen"}</small><h3>{product.model}</h3>
      <dl><div><dt>Fläche</dt><dd>{formatFootprint(product)}</dd></div><div><dt>Kapazität</dt><dd>{formatCapacity(product)}</dd></div><div><dt>Anschluss</dt><dd>{formatConnection(product)}</dd></div><div><dt>Preis</dt><dd>{formatPrice(product)}</dd></div></dl>
      <Link href={`/de/produkte/${product.product_id}/`}>Produkt ansehen ↗</Link>
    </article>)}</div>
  );
}

function CollectionResultsLedger({ candidates }: { candidates: Product[] }) {
  return (
    <ol className="collection-result-ledger">{candidates.map((product, index) => <li key={product.product_id}>
      <span>{String(index + 1).padStart(2, "0")}</span><div><small>{product.brand} · {product.sauna.type}</small><h3>{product.model}</h3></div>
      <p>{formatFootprint(product)}<small>{formatDimensions(product)}</small></p><p>{formatCapacity(product)}<small>{formatConnection(product)}</small></p><p>{formatPrice(product)}</p>
      <Link href={`/de/produkte/${product.product_id}/`} aria-label={`${product.brand} ${product.model} öffnen`}>↗</Link>
    </li>)}</ol>
  );
}

function CollectionChecks({ collection }: { collection: Collection }) {
  return (
    <section className="collection-checks page-shell" aria-labelledby="collection-checks-title" data-page-module="checks">
      <div><p className="eyebrow">{collection.module_copy.checks_kicker}</p><h2 id="collection-checks-title">{collection.module_copy.checks_title}</h2></div>
      <ol>{collection.checks.map((check, index) => <li key={check}><span>0{index + 1}</span><p>{check}</p></li>)}</ol>
    </section>
  );
}

function CollectionRelated({ collection, collections: relatedCollections }: { collection: Collection; collections: Collection[] }) {
  return (
    <aside className="collection-related page-shell" aria-labelledby="collection-related-title" data-page-module="related">
      <div><p className="eyebrow">{collection.module_copy.related_kicker}</p><h2 id="collection-related-title">{collection.module_copy.related_title}</h2></div>
      <div className="collection-related-grid">{relatedCollections.map((item) => <Link href={`/de/${item.section}/${item.slug}/`} key={item.id}><small>{item.kind}</small><strong>{item.title}</strong><span>{getCollectionProducts(item).length} Produkte ↗</span></Link>)}</div>
    </aside>
  );
}

function CollectionEditorial({ collection }: { collection: Collection }) {
  const { editorial } = collection;
  if (collection.layout === "budget") return <section className="collection-editorial collection-editorial-budget page-shell" aria-labelledby="collection-editorial-title" data-page-module="editorial"><div><p className="eyebrow">{editorial.kicker}</p><h2 id="collection-editorial-title">{editorial.title}</h2><p className="editorial-callout">{editorial.callout}</p></div><div className="budget-reading">{editorial.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}<h3>{editorial.pointsTitle}</h3><ul>{editorial.points.map((point) => <li key={point}>{point}</li>)}</ul></div></section>;
  if (collection.layout === "outdoor") return <section className="collection-editorial collection-editorial-outdoor page-shell" aria-labelledby="collection-editorial-title" data-page-module="editorial"><div><p className="eyebrow">{editorial.kicker}</p><h2 id="collection-editorial-title">{editorial.title}</h2>{editorial.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}</div><div className="outdoor-order"><p className="editorial-callout">{editorial.callout}</p><p className="eyebrow">{editorial.pointsTitle}</p><ol>{editorial.points.map((point, index) => <li key={point}><span>0{index + 1}</span>{point}</li>)}</ol></div></section>;
  if (collection.layout === "heat" || collection.layout === "technical") return <section className={`collection-editorial collection-editorial-${collection.layout} page-shell`} aria-labelledby="collection-editorial-title" data-page-module="editorial"><div className={`${collection.layout}-callout`}><p className="eyebrow">{editorial.kicker}</p><blockquote id="collection-editorial-title">{editorial.callout}</blockquote></div><div><h2>{editorial.title}</h2>{editorial.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}<h3>{editorial.pointsTitle}</h3><ul>{editorial.points.map((point) => <li key={point}>{point}</li>)}</ul></div></section>;
  if (collection.layout === "tradeoff") return <section className="collection-editorial collection-editorial-tradeoff page-shell" aria-labelledby="collection-editorial-title" data-page-module="editorial"><div><p className="eyebrow">{editorial.kicker}</p><h2 id="collection-editorial-title">{editorial.title}</h2>{editorial.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}</div><div className="tradeoff-reading"><p className="editorial-callout">{editorial.callout}</p><h3>{editorial.pointsTitle}</h3><ol>{editorial.points.map((point, index) => <li key={point}><span>0{index + 1}</span>{point}</li>)}</ol></div></section>;
  if (collection.layout === "capacity") return <section className="collection-editorial collection-editorial-capacity page-shell" aria-labelledby="collection-editorial-title" data-page-module="editorial"><div><p className="eyebrow">{editorial.kicker}</p><h2 id="collection-editorial-title">{editorial.title}</h2><p className="editorial-callout">{editorial.callout}</p></div><div className="capacity-reading">{editorial.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}<div className="capacity-points">{editorial.points.map((point, index) => <div key={point}><span>0{index + 1}</span><p>{point}</p></div>)}</div><h3>{editorial.pointsTitle}</h3></div></section>;
  return <section className="collection-editorial collection-editorial-space page-shell" aria-labelledby="collection-editorial-title" data-page-module="editorial"><div><p className="eyebrow">{editorial.kicker}</p><h2 id="collection-editorial-title">{editorial.title}</h2></div><div className="space-reading">{editorial.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}<p className="editorial-callout">{editorial.callout}</p><h3>{editorial.pointsTitle}</h3><ul>{editorial.points.map((point) => <li key={point}>{point}</li>)}</ul></div></section>;
}

function formatFootprint(product: Product) { return `${getFootprintSquareMeters(product).toLocaleString("de-DE", { maximumFractionDigits: 2 })} m²`; }
function formatDimensions(product: Product) { return `${product.dimensions_cm.width} × ${product.dimensions_cm.depth} × ${product.dimensions_cm.height} cm`; }
function formatCapacity(product: Product) { return `bis ${product.people.max} ${product.people.max === 1 ? "Person" : "Personen"}`; }
function formatConnection(product: Product) { return `${formatVoltage(product.power.voltage)}${product.power.kw ? ` · ${formatPower(product.power.kw)}` : ""}`; }
