import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { formatSquareMetres, getFootprintGroups } from "@/lib/footprint";
import {
  getFootprintLink,
  getNicheFit,
  getPlanningGuide,
  getPlanningJourney,
  getPriceSnapshot,
  type PlanningBlock,
  type PlanningGuide,
} from "@/lib/planning-guides";
import { shortPrice } from "@/lib/product-facts";
import { formatGermanDate } from "@/lib/products";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import { Breadcrumbs, Checklist, TextSection } from "./Blocks";

export function PlanningGuidePage({ guide }: { guide: PlanningGuide }) {
  const journey = getPlanningJourney(guide.slug);
  const related = journey?.related_slugs.flatMap((slug) => getPlanningGuide(slug) ?? []) ?? [];
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
        { name: "Ratgeber", path: "/de/planung/" },
        { name: guide.title, path },
      ])} />
      <SiteHeader />
      <article className="wrap page" data-page-kind="planning-guide">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Ratgeber", href: "/de/planung/" }, { label: guide.title }]} />
        <h1>{guide.title}</h1>
        <p className="updated">Aktualisiert am {formatGermanDate(guide.updated_at)}</p>
        <div className="text">{guide.intro.map((paragraph) => <p className="lead" data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}</div>
        {guide.blocks.map((block, index) => <Block block={block} guide={guide} key={`${block.type}-${index}`} />)}
        <section className="text sources" data-page-module="sources">
          <h2>Quellen</h2>
          <ul>{guide.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
        </section>
        <div className="two" data-page-module="related">
          <section>
            <h2>Passt dazu</h2>
            <ul>{related.map((item) => <li key={item.slug}><Link href={`/de/planung/${item.slug}/`}>{item.title}</Link></li>)}</ul>
          </section>
          {journey && journey.collection_links.length > 0 ? (
            <section>
              <h2>Modelle vergleichen</h2>
              <ul>{journey.collection_links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
            </section>
          ) : null}
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

function Block({ block, guide }: { block: PlanningBlock; guide: PlanningGuide }) {
  if (block.type === "text") return <TextSection block={block} />;
  if (block.type === "checklist") return <Checklist block={block} />;
  if (block.type === "prices") return <PriceTable />;
  if (block.type === "footprint") return <FootprintTables />;
  return <NicheTable guide={guide} />;
}

function PriceTable() {
  return (
    <section data-page-module="prices">
      <h2>Was die Saunen aktuell kosten</h2>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">Art</th><th scope="col">Angebote</th><th scope="col">Günstigstes</th><th scope="col">Die Hälfte kostet weniger als</th><th scope="col">Teuerstes</th></tr></thead>
        <tbody>{getPriceSnapshot().map((row) => (
          <tr key={row.id}><th scope="row">{row.label}</th><td>{row.count}</td><td>{shortPrice(row.minimum)}</td><td>{shortPrice(Math.round(row.median))}</td><td>{shortPrice(row.maximum)}</td></tr>
        ))}</tbody>
      </table></div>
    </section>
  );
}

function FootprintTables() {
  const groups = getFootprintGroups();
  return (
    <section data-page-module="footprint">
      <h2>Stellfläche nach Personenzahl</h2>
      {groups.map((group) => (
        <div className="table-wrap" key={group.id}>
          <table>
            <caption>{group.label}</caption>
            <thead><tr><th scope="col">Personen</th><th scope="col">Üblich</th><th scope="col">Größte</th><th scope="col">Höhe</th><th scope="col">Kleinstes Modell</th><th scope="col">Alle ansehen</th></tr></thead>
            <tbody>{group.rows.map((row) => {
              const link = getFootprintLink(group.id, row.capacity);
              const smallest = row.smallest.product;
              return (
                <tr key={row.capacity}>
                  <th scope="row">{row.capacity}</th>
                  <td>{formatSquareMetres(row.medianSquareMetres)}</td>
                  <td>{formatSquareMetres(row.largestSquareMetres)}</td>
                  <td>{Math.round(row.medianHeightCm)} cm</td>
                  <td><Link href={`/de/produkte/${smallest.product_id}/`}>{smallest.brand} {smallest.model}</Link><small>{smallest.dimensions_cm.width} × {smallest.dimensions_cm.depth} cm, {formatSquareMetres(row.smallest.squareMetres)}</small></td>
                  <td>{link ? <Link href={link.href}>{link.label}</Link> : "–"}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

function NicheTable({ guide }: { guide: PlanningGuide }) {
  const niches = guide.catalog_niches;
  if (!niches) return null;
  return (
    <section data-page-module="niches">
      <h2>{niches.title}</h2>
      <div className="text">{niches.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}</div>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">Nische</th><th scope="col">Modelle</th><th scope="col">Infrarot</th><th scope="col">Sauna mit Ofen</th><th scope="col">Dampfdusche</th><th scope="col">230 Volt</th><th scope="col">bis 2 m hoch</th></tr></thead>
        <tbody>{getNicheFit(niches.sizes).map((row) => (
          <tr key={`${row.width}x${row.depth}`}><th scope="row">{row.width} × {row.depth} cm</th><td>{row.total}</td><td>{row.infrared}</td><td>{row.sauna}</td><td>{row.steamShower}</td><td>{row.plug230}</td><td>{row.upTo200cm}</td></tr>
        ))}</tbody>
      </table></div>
    </section>
  );
}
