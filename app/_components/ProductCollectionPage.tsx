import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import {
  collectionSectionLabels,
  collections,
  countFittingProducts,
  fillCollectionText,
  getCollectionDescription,
  getCollectionPath,
  getCollectionPicks,
  getCollectionProducts,
  getDimensionProfile,
  type Collection,
  type CollectionBlock,
  type DimensionProfileRow,
} from "@/lib/collections";
import { getPlanningGuide, type PlanningGuide } from "@/lib/planning-guides";
import { shortPrice } from "@/lib/product-facts";
import type { Product } from "@/lib/products";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";
import { Breadcrumbs, LinkList, TextSection } from "./Blocks";
import { ProductPicks, ProductRows } from "./ProductRows";

export function ProductCollectionPage({ collection }: { collection: Collection }) {
  const products = getCollectionProducts(collection);
  const fill = (text: string) => fillCollectionText(text, products);
  const path = getCollectionPath(collection);
  const related = collection.related_ids.flatMap((id) => collections.find((item) => item.id === id) ?? []);
  const guides = collection.guide_ids.flatMap((slug): PlanningGuide[] => {
    const guide = getPlanningGuide(slug);
    return guide ? [guide] : [];
  });

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: collection.title, description: getCollectionDescription(collection), path })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Vergleiche", path: "/de/vergleiche/" },
        { name: collection.title, path },
      ])} />
      <SiteHeader />
      <article
        className="wrap page"
        data-page-kind="collection"
        data-page-id={collection.id}
        data-page-status={collection.indexable === false ? "draft" : "published"}
      >
        <Breadcrumbs items={[
          { label: "Start", href: "/de/" },
          { label: "Vergleiche", href: "/de/vergleiche/" },
          ...(collection.section === "vergleiche" ? [] : [{ label: collectionSectionLabels[collection.section], href: `/de/vergleiche/#${collection.section}` }]),
          { label: collection.title },
        ]} />
        <h1>{collection.title}</h1>
        <div className="text">{collection.intro.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{fill(paragraph)}</p>)}</div>
        {collection.blocks.map((block, index) => (
          <Block block={block} collection={collection} products={products} fill={fill} key={`${block.type}-${index}`} />
        ))}
        <div className="two" data-page-module="related">
          <section>
            <h2>Ähnliche Vergleiche</h2>
            <ul>{related.map((item) => <li key={item.id}><Link href={getCollectionPath(item)}>{item.title}</Link></li>)}</ul>
          </section>
          <section>
            <h2>Vor dem Kauf lesen</h2>
            <ul>{guides.map((guide) => <li key={guide.slug}><Link href={`/de/planung/${guide.slug}/`}>{guide.title}</Link></li>)}</ul>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

function Block({ block, collection, products, fill }: {
  block: CollectionBlock;
  collection: Collection;
  products: Product[];
  fill: (text: string) => string;
}) {
  if (block.type === "text") return <TextSection block={block} fill={fill} />;
  if (block.type === "links") return <div data-page-module="links"><LinkList links={block.links} /></div>;
  if (block.type === "picks") return <div data-page-module="picks"><ProductPicks picks={getCollectionPicks(products)} /></div>;
  if (block.type === "table") return <SizeTable collection={collection} products={products} />;
  return (
    <section data-page-module="products">
      <h2>{fill(block.heading)}</h2>
      <p className="updated">Sortiert nach {collection.sort === "price" ? "Preis" : "Stellfläche"}. Der Preis ist das günstigste Angebot, das wir kennen, ohne Versand und Zubehör.</p>
      <ProductRows products={products} />
    </section>
  );
}

const squareMetres = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const kilowatts = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

function SizeRow({ row }: { row: DimensionProfileRow }) {
  return (
    <tr>
      <th scope="row">{row.label}</th>
      <td>{row.count}</td>
      <td>{Math.round(row.medianWidth)} × {Math.round(row.medianDepth)} cm</td>
      <td>{row.minFootprint === row.maxFootprint ? squareMetres.format(row.minFootprint) : `${squareMetres.format(row.minFootprint)} bis ${squareMetres.format(row.maxFootprint)}`} m²</td>
      <td>{row.plugCount} von {row.count}</td>
      <td>{row.lyingCount} von {row.count}</td>
      <td>{row.medianKw === null ? "–" : `${kilowatts.format(row.medianKw)} kW`}{row.medianKw !== null && row.kwCount < row.count ? <small>bei {row.kwCount} Modellen bekannt</small> : null}</td>
      <td>{row.lowestPrice === null ? "–" : `ab ${shortPrice(Math.round(row.lowestPrice))}`}</td>
    </tr>
  );
}

function SizeTable({ collection, products }: { collection: Collection; products: Product[] }) {
  const profile = collection.profile;
  if (!profile) return null;
  const { rows, total } = getDimensionProfile(products, profile.group_by);
  const group = profile.group_by === "voltage" ? "Anschluss" : profile.group_by === "people" ? "Personen" : "Art";
  return (
    <section data-page-module="table">
      <h2>{profile.title}</h2>
      <div className="text">{profile.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{paragraph}</p>)}</div>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">{group}</th><th scope="col">Modelle</th><th scope="col">Übliche Größe</th><th scope="col">Stellfläche</th><th scope="col">230 Volt</th><th scope="col">Liegeplatz</th><th scope="col">Übliche Leistung</th><th scope="col">Preis</th></tr></thead>
        <tbody>{rows.map((row) => <SizeRow row={row} key={row.label} />)}</tbody>
        {rows.length > 1 ? <tfoot><SizeRow row={total} /></tfoot> : null}
      </table></div>
      <ul>
        {profile.fit_checks.map(({ width, depth }) => (
          <li key={`${width}x${depth}`}>In {width} × {depth} cm passen {countFittingProducts(products, width, depth)} von {products.length} Modellen.</li>
        ))}
      </ul>
    </section>
  );
}
