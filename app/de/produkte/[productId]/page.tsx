import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { formatGermanDate, formatPrice, getProduct, products } from "@/lib/products";

type Props = { params: Promise<{ productId: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ productId: product.product_id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) return {};
  const title = `${product.brand} ${product.model}: Maße, Strom und Einordnung`;
  const description = `${product.dimensions_cm.width} × ${product.dimensions_cm.depth} × ${product.dimensions_cm.height} cm, ${product.power.voltage} V und Platz für bis zu ${product.people.max} Personen. Quellengeprüfter Datensatz.`;
  return {
    title,
    description,
    alternates: { canonical: `/de/produkte/${product.product_id}/` },
    openGraph: { title, description, images: [] },
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();
  const offer = product.commercial.offers[0];

  return (
    <main>
      <SiteHeader />
      <article>
        <header className="product-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
            <a href="/de/">Start</a><span>/</span><Link href="/de/produkte/">Produkte</Link><span>/</span><span>{product.model}</span>
          </nav>
          <div className="product-title-grid">
            <div>
              <p className="eyebrow">{product.brand} · Herstellerdaten geprüft {formatGermanDate(product.updated_at)}</p>
              <h1>{product.model}</h1>
              <p className="product-lede">{product.editorial.disclosure}</p>
            </div>
            <div className="product-price-card">
              <small>Preis beim Hersteller</small>
              <strong>{formatPrice(product)}</strong>
              <span>Stand {formatGermanDate(offer.last_checked)}</span>
              <a href={offer.url} rel="nofollow noreferrer" target="_blank">Herstellerseite öffnen ↗</a>
              <em>Kein Affiliate-Link</em>
            </div>
          </div>
        </header>

        <section className="spec-section page-shell" aria-labelledby="spec-title">
          <div><p className="eyebrow">Kerndaten</p><h2 id="spec-title">Passt das Modell technisch?</h2></div>
          <dl className="spec-grid">
            <div><dt>Außenmaß</dt><dd>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</dd></div>
            <div><dt>Kapazität</dt><dd>bis {product.people.max} {product.people.max === 1 ? "Person" : "Personen"}</dd></div>
            <div><dt>Spannung</dt><dd>{product.power.voltage} V</dd></div>
            <div><dt>Leistung</dt><dd>{product.power.kw ? `${product.power.kw} kW` : "nicht ausgewiesen"}</dd></div>
            <div><dt>Wärmeart</dt><dd>{product.sauna.heater_type}</dd></div>
            <div><dt>Holz</dt><dd>{product.sauna.wood_type}</dd></div>
          </dl>
        </section>

        <section className="editorial-fit page-shell">
          <div className="fit-column fit-positive">
            <p className="eyebrow">Passt wahrscheinlich, wenn …</p>
            <ul>{product.editorial.ideal_for.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="fit-column fit-negative">
            <p className="eyebrow">Eher nicht, wenn …</p>
            <ul>{product.editorial.not_for.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="source-section page-shell">
          <div>
            <p className="eyebrow">Transparenz</p>
            <h2>Was wir wissen — und was nicht.</h2>
          </div>
          <div>
            <p>Dieser Datensatz basiert auf Herstellerangaben. Wir haben das Produkt noch nicht selbst aufgebaut, vermessen oder im Betrieb getestet.</p>
            <ul className="source-list">
              {product.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} rel="noreferrer" target="_blank">{source.title} ↗</a>
                  <span>geprüft {formatGermanDate(source.checked_at)}</span>
                </li>
              ))}
            </ul>
            <p className="safety-box"><strong>Sicherheit:</strong> Herstelleranleitung und örtliche Anschlussbedingungen haben Vorrang. Arbeiten an Netzspannung gehören in die Hände einer Elektrofachkraft.</p>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
