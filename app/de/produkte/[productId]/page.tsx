import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/app/_components/Blocks";
import { OfferLink } from "@/app/_components/OfferLink";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { collections, getCollectionPath, getCollectionProducts } from "@/lib/collections";
import { createPageMetadata } from "@/lib/metadata";
import { dimensions, knownText, listPrice, plainPoints, powerText, shortPrice } from "@/lib/product-facts";
import {
  formatCapacity,
  formatGermanDate,
  getEligibleOffers,
  getProduct,
  getProductEditorialOverride,
  getProductFamily,
  getProductSourceUrl,
  isProductIndexable,
  products,
  type Product,
} from "@/lib/products";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ productId: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ productId: product.product_id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) return {};
  return createPageMetadata({
    title: `${product.brand} ${product.model}: Maße, Anschluss, Preis`,
    description: `${product.brand} ${product.model}: ${product.sauna.type}, ${dimensions(product)}, ${formatCapacity(product)}. ${powerText(product)}`,
    path: `/de/produkte/${product.product_id}/`,
    indexable: isProductIndexable(product),
  });
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();
  const offers = [...getEligibleOffers(product)].sort((a, b) => a.price - b.price);
  const family = getProductFamily(product);
  const override = getProductEditorialOverride(product.product_id);
  const pros = plainPoints(product.editorial.pros);
  const cons = plainPoints(product.editorial.cons);
  const lists = collections
    .filter((collection) => getCollectionProducts(collection).some((candidate) => candidate.product_id === product.product_id))
    .slice(0, 4);
  const outdoor = product.sauna.indoor_outdoor === "outdoor";
  const path = `/de/produkte/${product.product_id}/`;

  return (
    <main>
      <StructuredData data={productJsonLd(product)} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Alle Saunen", path: "/de/produkte/" },
        { name: product.model, path },
      ])} />
      <SiteHeader />
      <article className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Alle Saunen", href: "/de/produkte/" }, { label: `${product.brand} ${product.model}` }]} />
        <h1>{product.brand} {product.model}</h1>
        <div className="product-top">
          <div>
            <p className="lead">{product.sauna.type} {outdoor ? "für draußen" : "für drinnen"}, {formatCapacity(product)}, {dimensions(product)}.</p>
            {override ? <p data-product-copy="true">{override.intro}</p> : null}
            <Drawing product={product} />
          </div>
          <OfferBox product={product} offers={offers} />
        </div>

        <h2>Daten</h2>
        <div className="table-wrap"><table className="facts"><tbody>
          <tr><th scope="row">Breite × Tiefe × Höhe</th><td>{dimensions(product)}</td></tr>
          <tr><th scope="row">Platz für</th><td>{formatCapacity(product)}{product.people.lying_places ? `, davon ${product.people.lying_places} im Liegen` : ""}</td></tr>
          {knownText(product.sauna.wood_type) ? <tr><th scope="row">Holz</th><td>{product.sauna.wood_type}</td></tr> : null}
          {knownText(product.sauna.heater_type) ? <tr><th scope="row">Heizung</th><td>{product.sauna.heater_type}</td></tr> : null}
          {product.sauna.max_temp_c ? <tr><th scope="row">Höchste Temperatur</th><td>{product.sauna.max_temp_c} °C laut Hersteller</td></tr> : null}
        </tbody></table></div>

        <section className="text">
          <h2>Strom und Ofen</h2>
          <p data-product-copy="true">{override?.detail ?? powerText(product)}</p>
        </section>

        {pros.length > 0 || cons.length > 0 ? (
          <div className="two">
            {pros.length > 0 ? <section><h2>Gut daran</h2><ul>{pros.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
            {cons.length > 0 ? <section><h2>Nicht so gut</h2><ul>{cons.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
          </div>
        ) : null}

        {family.length > 1 && product.family ? <FamilyTable product={product} family={family} /> : null}

        {offers.length > 0 ? (
          <section className="text">
            <h2>Wo es die Sauna gibt</h2>
            <OfferBox product={product} offers={offers} heading={false} />
          </section>
        ) : null}

        <div className="two">
          <section>
            <h2>Ähnliche Saunen</h2>
            <ul>{lists.map((collection) => <li key={collection.id}><Link href={getCollectionPath(collection)}>{collection.title}</Link></li>)}</ul>
          </section>
          <section>
            <h2>Vor dem Kauf lesen</h2>
            <ul>
              <li><Link href="/de/planung/platzbedarf/">Wie viel Platz braucht eine Sauna?</Link></li>
              <li>{outdoor ? <Link href="/de/planung/boden-und-fundament/">Boden und Fundament</Link> : <Link href="/de/planung/lueftung/">Lüftung planen</Link>}</li>
              <li>{product.power.voltage === 230 ? <Link href="/de/saunatechnik/230-v-sauna/">230-Volt-Sauna erklärt</Link> : <Link href="/de/planung/230-v-vs-400-v-sauna/">230 oder 400 Volt?</Link>}</li>
              <li><Link href="/de/planung/sauna-kosten/">Was kostet eine Heimsauna?</Link></li>
            </ul>
          </section>
        </div>

        <section className="text sources">
          <h2>Quellen</h2>
          <p>Wir haben diese Sauna nicht selbst aufgebaut. Die Angaben stammen von hier:</p>
          <ul>{product.sources.map((source) => <li key={source.url}><a href={getProductSourceUrl(product, source.url)} rel="noreferrer" target="_blank">{source.title}</a></li>)}</ul>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}

function OfferBox({ product, offers, heading = true }: { product: Product; offers: ReturnType<typeof getEligibleOffers>; heading?: boolean }) {
  return (
    <div className="offer-box">
      {heading ? <h2>{offers.length === 0 ? "Kein aktueller Preis" : offers.length === 1 ? "Preis" : `${offers.length} Angebote`}</h2> : null}
      {offers.length === 0 ? <p>Gerade kennen wir keinen Shop, der diese Sauna mit aktuellem Preis führt.</p> : null}
      {offers.map((offer) => (
        <div className="offer" key={`${offer.merchant}-${offer.url}`}>
          <div className="offer-head"><span>{offer.merchant}</span><b>{product.commercial.price_status === "from" && offer === offers[0] ? "ab " : ""}{shortPrice(offer.price)}</b></div>
          <p>
            {offer.configuration ? `${offer.configuration}. ` : ""}
            {offer.selection_required ? "Im Shop die passende Ausführung wählen. " : ""}
            Stand {formatGermanDate(offer.last_checked)}
          </p>
          <OfferLink product={product} offer={offer} placement="product-detail">Bei {offer.merchant} ansehen</OfferLink>
        </div>
      ))}
    </div>
  );
}

// Top view with the outer dimensions.
function Drawing({ product }: { product: Product }) {
  const { width, depth, height } = product.dimensions_cm;
  const scale = Math.min(280 / width, 170 / depth);
  const w = width * scale;
  const d = depth * scale;
  const number = (value: number) => value.toLocaleString("de-DE");
  return (
    <svg className="drawing" viewBox="0 0 400 230" role="img" aria-label={`Grundriss: ${number(width)} cm breit, ${number(depth)} cm tief, ${number(height)} cm hoch`}>
      <rect className="cabin" x="10" y="10" width={w} height={d} />
      <text x={10 + w / 2} y={10 + d / 2 + 4} textAnchor="middle">{number(height)} cm hoch</text>
      <line x1="10" y1={d + 22} x2={10 + w} y2={d + 22} />
      <text x={10 + w / 2} y={d + 40} textAnchor="middle">{number(width)} cm</text>
      <line x1={w + 22} y1="10" x2={w + 22} y2={10 + d} />
      <text x={w + 30} y={10 + d / 2 + 4}>{number(depth)} cm</text>
    </svg>
  );
}

function FamilyTable({ product, family }: { product: Product; family: Product[] }) {
  return (
    <section>
      <h2>Andere Ausführungen</h2>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">Ausführung</th><th scope="col">Größe</th><th scope="col">Personen</th><th scope="col">Preis</th></tr></thead>
        <tbody>{family.map((item) => {
          const current = item.product_id === product.product_id;
          const name = item.family?.variant ?? item.model;
          return (
            <tr key={item.product_id}>
              <th scope="row">{current ? <span className="current">{name} (diese)</span> : <Link href={`/de/produkte/${item.product_id}/`}>{name}</Link>}</th>
              <td>{dimensions(item)}</td>
              <td>{formatCapacity(item)}</td>
              <td>{listPrice(item) ?? "–"}</td>
            </tr>
          );
        })}</tbody>
      </table></div>
    </section>
  );
}
