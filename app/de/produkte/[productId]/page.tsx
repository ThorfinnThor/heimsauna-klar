import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { collections, getCollectionProducts } from "@/lib/collections";
import { getOfferDisclosure } from "@/lib/affiliate";
import { formatGermanDate, formatOfferPrice, formatPower, formatPrice, formatVoltage, getProduct, getProductFamily, products } from "@/lib/products";
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
  const title = `${product.brand} ${product.model}: Maße, Strom und Einordnung`;
  const description = `${product.brand} ${product.model}: ${product.dimensions_cm.width} × ${product.dimensions_cm.depth} × ${product.dimensions_cm.height} cm, ${formatVoltage(product.power.voltage)} und Platz für bis zu ${product.people.max} Personen. Quellengeprüfter Datensatz.`;
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
  const offers = [...product.commercial.offers].sort((a, b) => a.price - b.price);
  const familyProducts = getProductFamily(product);
  const matchingCollections = collections
    .filter((collection) => getCollectionProducts(collection).some((candidate) => candidate.product_id === product.product_id))
    .slice(0, 3);
  const productFrame = getProductFrame(product);
  const planningLinks = product.power.voltage === 230
    ? [
        { href: "/de/planung/platzbedarf/", label: "Planungsseite", title: "Platzbedarf prüfen" },
        { href: "/de/saunatechnik/230-v-sauna/", label: "Saunatechnik", title: "230 V richtig einordnen" },
        { href: "/de/planung/sauna-kosten/", label: "Planungsseite", title: "Gesamtbudget kalkulieren" },
      ]
    : [
        { href: "/de/planung/platzbedarf/", label: "Planungsseite", title: "Platzbedarf prüfen" },
        { href: product.sauna.indoor_outdoor === "outdoor" ? "/de/planung/boden-und-fundament/" : "/de/planung/lueftung/", label: "Planungsseite", title: product.sauna.indoor_outdoor === "outdoor" ? "Fundament prüfen" : "Lüftung planen" },
        { href: "/de/planung/sauna-kosten/", label: "Planungsseite", title: "Gesamtbudget kalkulieren" },
      ];
  const path = `/de/produkte/${product.product_id}/`;

  return (
    <main>
      <StructuredData data={productJsonLd(product)} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Produkte", path: "/de/produkte/" },
        { name: product.model, path },
      ])} />
      <SiteHeader />
      <article>
        <header className="product-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
            <Link href="/de/">Start</Link><span>/</span><Link href="/de/produkte/">Produkte</Link><span>/</span><span>{product.model}</span>
          </nav>
          <div className="product-title-grid">
            <div>
              <p className="eyebrow">{product.brand} · Herstellerdaten geprüft {formatGermanDate(product.updated_at)}</p>
              <h1>{product.model}</h1>
              <p className="product-lede">{product.editorial.disclosure}</p>
            </div>
            <div className="product-price-card">
              <small>{offers.length > 1 ? `${offers.length} geprüfte Angebote` : "Geprüftes Angebot"}</small>
              <strong>{formatPrice(product)}</strong>
              {offers.length > 0 ? (
                <div className="product-offer-list">
                  {offers.map((offer) => (
                    <div className="product-offer" key={`${offer.merchant}-${offer.url}`}>
                      <div>
                        <b>{offer.merchant}</b>
                        {offer.configuration ? <span>{offer.configuration}</span> : null}
                        <span>{formatOfferPrice(offer, product.commercial.currency)} · Stand {formatGermanDate(offer.last_checked)}</span>
                      </div>
                      <a
                        href={offer.url}
                        rel={offer.affiliate ? "sponsored nofollow noreferrer" : "nofollow noreferrer"}
                        target="_blank"
                      >
                        {offer.selection_required ? "Konfigurator öffnen ↗" : "Angebot öffnen ↗"}
                      </a>
                      {offer.selection_required ? <span className="product-offer-note">Konfiguration im Shop erneut auswählen und Preis prüfen.</span> : null}
                      <em>{getOfferDisclosure(offer)}</em>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <span>Aktueller Preis auf der geprüften Produktseite nicht ausgewiesen.</span>
                  <em>Kein Affiliate-Link</em>
                </>
              )}
            </div>
          </div>
        </header>

        {product.category === "outdoor" ? <ProductEditorialFrame product={product} frame={productFrame} /> : null}

        <section className="spec-section page-shell" aria-labelledby="spec-title">
          <div><p className="eyebrow">Kerndaten</p><h2 id="spec-title">Passt das Modell technisch?</h2></div>
          <div>
            <dl className="spec-grid">
              <div><dt>Außenmaß</dt><dd>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</dd></div>
              <div><dt>Kapazität</dt><dd>bis {product.people.max} {product.people.max === 1 ? "Person" : "Personen"}</dd></div>
              <div><dt>Spannung</dt><dd>{formatVoltage(product.power.voltage)}</dd></div>
              <div><dt>Leistung</dt><dd>{formatPower(product.power.kw)}</dd></div>
              <div><dt>Wärmeart</dt><dd>{product.sauna.heater_type}</dd></div>
              <div><dt>Holz</dt><dd>{product.sauna.wood_type}</dd></div>
            </dl>
            <p className="power-evidence-note">
              <strong>Anschluss-Einordnung:</strong> {product.power.notes}
            </p>
          </div>
        </section>

        {product.category === "infrared" ? <ProductEditorialFrame product={product} frame={productFrame} /> : null}

        {familyProducts.length > 1 && product.family && (
          <section className="variant-section page-shell" aria-labelledby="variant-title">
            <div className="variant-intro">
              <p className="eyebrow">Produktreihe · {familyProducts.length} Varianten</p>
              <h2 id="variant-title">{product.family.name} im Variantenvergleich.</h2>
              <p>Die Modelle gehören zur gleichen Produktreihe, unterscheiden sich aber bei Ausführung, Maßen, Wärmeart oder Preis. Jeder Eintrag bleibt ein eigener, quellengeprüfter Datensatz.</p>
            </div>
            <div className="variant-grid">
              {familyProducts.map((variant) => {
                const isCurrent = variant.product_id === product.product_id;
                const content = (
                  <>
                    <small>{isCurrent ? "Aktuelles Modell" : "Weitere Variante"}</small>
                    <strong>{variant.family?.variant}</strong>
                    <span>{variant.dimensions_cm.width} × {variant.dimensions_cm.depth} × {variant.dimensions_cm.height} cm</span>
                    <span>{variant.sauna.type} · {formatPrice(variant)}</span>
                  </>
                );

                return isCurrent ? (
                  <div className="variant-card variant-card-current" key={variant.product_id}>{content}</div>
                ) : (
                  <Link className="variant-card" href={`/de/produkte/${variant.product_id}/`} key={variant.product_id}>{content}</Link>
                );
              })}
            </div>
          </section>
        )}

        {product.category !== "outdoor" && product.category !== "infrared" ? <ProductEditorialFrame product={product} frame={productFrame} /> : null}

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

        <aside className="collection-related page-shell" aria-labelledby="product-next-title">
          <div><p className="eyebrow">Vom Datensatz zur Entscheidung</p><h2 id="product-next-title">Weiter prüfen, bevor du kaufst.</h2></div>
          <div className="collection-related-grid">
            {planningLinks.map((item) => (
              <Link href={item.href} key={item.href}><small>{item.label}</small><strong>{item.title}</strong><span>Öffnen ↗</span></Link>
            ))}
            {matchingCollections.map((collection) => (
              <Link href={`/de/${collection.section}/${collection.slug}/`} key={collection.id}><small>{collection.kind}</small><strong>{collection.title}</strong><span>Weitere passende Modelle ↗</span></Link>
            ))}
          </div>
        </aside>
      </article>
      <SiteFooter />
    </main>
  );
}

type ProductFrame = {
  className: string;
  kicker: string;
  title: string;
  intro: string;
  detail: string;
};

function getProductFrame(product: NonNullable<ReturnType<typeof getProduct>>): ProductFrame {
  if (product.category === "outdoor") {
    return {
      className: "product-frame-outdoor",
      kicker: "Standort vor Bestellung",
      title: "Outdoor-Daten beginnen nicht am Warenkorb.",
      intro: "Außenmaß und Kapazität machen ein Modell auffindbar. Ob es auf deinem Grundstück funktioniert, entscheidet zusätzlich die Fläche für Fundament, Zugang, Wetterschutz und Anschluss.",
      detail: `Dieses Modell ist für außen dokumentiert und misst ${product.dimensions_cm.width} × ${product.dimensions_cm.depth} cm. Prüfe die reale Aufstellfläche einschließlich Abständen, Entwässerung und Montageweg.`,
    };
  }
  if (product.category === "infrared") {
    return {
      className: "product-frame-heat",
      kicker: "Wärmeprofil statt Größenranking",
      title: "Eine Infrarotkabine ist kein kleiner Saunaofen.",
      intro: "Die kompakte Bauform kann für manche Räume ideal sein, aber das Nutzungsprinzip bleibt ein anderes. Strahler, Temperaturbereich, Regelung und Aufheizverhalten gehören in den Vergleich.",
      detail: `Die Quelle weist dieses Modell als ${product.sauna.heater_type} mit ${formatVoltage(product.power.voltage)} aus. Die Angaben beschreiben den Datensatz, nicht ein eigenes Praxistestergebnis.`,
    };
  }
  return {
    className: "product-frame-indoor",
    kicker: "Raum- und Anschlusslogik",
    title: "Passt das Modell in deinen Alltag?",
    intro: "Ein quellengeprüftes Außenmaß ist ein guter Start, ersetzt aber keine Prüfung von Tür, Montageweg, Raumhöhe und Anschlussbedingungen.",
    detail: `Für bis zu ${product.people.max} ${product.people.max === 1 ? "Person" : "Personen"} sind ${formatVoltage(product.power.voltage)} und ${formatPower(product.power.kw)} dokumentiert. Herstelleranleitung und Fachplanung entscheiden über die konkrete Eignung.`,
  };
}

function ProductEditorialFrame({ product, frame }: { product: NonNullable<ReturnType<typeof getProduct>>; frame: ProductFrame }) {
  return (
    <section className={`product-frame page-shell ${frame.className}`} aria-labelledby="product-frame-title">
      <div>
        <p className="eyebrow">{frame.kicker}</p>
        <h2 id="product-frame-title">{frame.title}</h2>
        <p>{frame.intro}</p>
      </div>
      <div className="product-frame-reading">
        <p className="product-frame-detail">{frame.detail}</p>
        <div className="product-frame-columns">
          <div><small>Spricht dafür</small><ul>{product.editorial.pros.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><small>Vorher klären</small><ul>{product.editorial.cons.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
      </div>
    </section>
  );
}
