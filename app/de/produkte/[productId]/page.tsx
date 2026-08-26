import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { collections, getCollectionProducts } from "@/lib/collections";
import { getOfferDisclosure, getOfferHref } from "@/lib/affiliate";
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
              <p className="product-lede" data-product-copy="true">Einordnung des {product.brand} {product.model} anhand geprüfter Herstellerdaten. Eigener Aufbau und eigene Nutzung liegen nicht vor.</p>
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
                        href={getOfferHref(offer)}
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

        {familyProducts.length > 1 && product.family ? <FamilyEditorial product={product} familyProducts={familyProducts} /> : null}

        {familyProducts.length > 1 && product.family && (
          <section className="variant-section page-shell" aria-labelledby="variant-title">
            <div className="variant-intro">
              <p className="eyebrow">Produktreihe · {familyProducts.length} Varianten</p>
              <h2 id="variant-title">{product.family.name} im Variantenvergleich.</h2>
              <p data-product-copy="true">{product.model} gehört zur Reihe {product.family.name}. Die folgenden Varianten machen Unterschiede bei Ausführung, Maßen, Wärmeart und dokumentiertem Preis sichtbar; {product.family.variant} bleibt dabei als eigener Datensatz nachvollziehbar.</p>
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
            <h2>Datenlage zum Produkt.</h2>
          </div>
          <div>
            <p data-product-copy="true">Die Einordnung zu {product.brand} {product.model} stützt sich auf {product.sources.length === 1 ? "eine geprüfte Produktquelle" : `${product.sources.length} geprüfte Produktquellen`}. Eigene Messwerte zu Aufbau, Innenraum oder Betrieb liegen nicht vor.</p>
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
  const footprint = product.dimensions_cm.width * product.dimensions_cm.depth / 10_000;
  const footprintLabel = footprint <= 3 ? "kompakten" : footprint <= 6 ? "mittleren" : "großen";
  const specificPros = product.editorial.pros.filter((item) => !["Innenaufstellung", "Außenaufstellung"].includes(item));
  const strength = specificPros[0] ?? product.editorial.pros[0] ?? "die dokumentierte Ausstattung";
  const secondStrength = specificPros[1] ?? product.editorial.pros[1] ?? "die ausgewiesenen Abmessungen";
  const concern = product.editorial.cons[0] ?? "den konkreten Lieferumfang";
  const useCase = product.editorial.ideal_for[0] ?? "den vorgesehenen Aufstellort";
  const powerSentence = getPowerSentence(product);
  const variant = productHash(product.product_id) % 3;

  if (product.category === "outdoor") {
    const intros = [
      `${product.brand} führt ${product.model} als Außensauna mit ${footprint.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m² rechnerischer Produktfläche. Im Datensatz spricht vor allem „${strength}“ für das Modell; „${concern}“ bleibt vor der Standortentscheidung offen.`,
      `${product.model} richtet sich laut Datenlage besonders an ${useCase}. Die ${footprintLabel} Grundfläche und „${strength}“ sind dafür relevant, während „${concern}“ separat in die Projektplanung gehört.`,
      `Bei ${product.model} treffen ${product.dimensions_cm.width} × ${product.dimensions_cm.depth} cm Außenmaß auf „${strength}“ und „${secondStrength}“. Diese Kombination grenzt das Modell ein, ersetzt aber nicht die Prüfung von „${concern}“.`,
    ];
    return {
      className: "product-frame-outdoor",
      kicker: "Standort vor Bestellung",
      title: `${product.model}: Standort und Ausstattung zusammen prüfen.`,
      intro: intros[variant],
      detail: `${powerSentence} Für die reale Aufstellfläche von ${product.model} kommen zu den Produktmaßen noch Herstellerabstände, Fundament, Entwässerung und Montagezugang hinzu.`,
    };
  }
  if (product.category === "infrared") {
    const intros = [
      `${product.model} ist als ${product.sauna.type} für bis zu ${product.people.max} ${product.people.max === 1 ? "Person" : "Personen"} dokumentiert. „${strength}“ beschreibt einen konkreten Vorteil; „${concern}“ markiert die wichtigste offene Abwägung.`,
      `Für ${useCase} bringt ${product.model} laut Datensatz vor allem „${strength}“ mit. Die Kabine benötigt ${footprint.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m² rechnerische Stellfläche; zusätzlich ist „${concern}“ zu berücksichtigen.`,
      `${product.brand} kombiniert bei ${product.model} die Wärmeart ${product.sauna.heater_type} mit ${product.dimensions_cm.width} × ${product.dimensions_cm.depth} cm Außenmaß. „${strength}“ und „${secondStrength}“ prägen die Auswahl, nicht eine pauschale Qualitätsnote.`,
    ];
    return {
      className: "product-frame-heat",
      kicker: "Wärmeprofil und Abmessungen",
      title: `${product.model}: Wärmeart und Raumbedarf einordnen.`,
      intro: intros[variant],
      detail: `${powerSentence} Bei ${product.model} sollten außerdem Strahlerposition, Regelung und das gewünschte Wärmegefühl mit der Herstellerbeschreibung abgeglichen werden.`,
    };
  }
  const intros = [
    `${product.model} benötigt rechnerisch ${footprint.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m² Produktfläche und ist für bis zu ${product.people.max} ${product.people.max === 1 ? "Person" : "Personen"} ausgewiesen. „${strength}“ ist ein belastbares Merkmal; „${concern}“ muss vor dem Kauf geklärt werden.`,
    `Für ${useCase} kann ${product.model} aufgrund von „${strength}“ interessant sein. Mit ${product.dimensions_cm.width} × ${product.dimensions_cm.depth} × ${product.dimensions_cm.height} cm gehört die Kabine zur ${footprintLabel} Größenklasse; „${concern}“ bleibt ein Gegenpunkt.`,
    `${product.brand} dokumentiert für ${product.model} „${strength}“ sowie „${secondStrength}“. Die Kapazität ist mit bis zu ${product.people.max} ${product.people.max === 1 ? "Person" : "Personen"} angegeben. Ob das Modell zum Standort passt, hängt zusätzlich von Raum und Anschluss ab.`,
  ];
  return {
    className: "product-frame-indoor",
    kicker: "Raum- und Anschlusslogik",
    title: `${product.model}: Maße und Nutzung zusammen lesen.`,
    intro: intros[variant],
    detail: `${powerSentence} Für ${product.model} sind zusätzlich Türöffnung, Transportweg, Raumhöhe und die Abstände aus der konkreten Montageanleitung zu prüfen.`,
  };
}

function productHash(value: string) {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0);
}

function getPowerSentence(product: NonNullable<ReturnType<typeof getProduct>>) {
  const hasVoltage = product.power.voltage !== "none";
  const hasPower = product.power.kw !== null;
  if (hasVoltage && hasPower) return `Für ${product.model} sind ${formatVoltage(product.power.voltage)} und ${formatPower(product.power.kw)} dokumentiert.`;
  if (hasVoltage) return `Für ${product.model} ist ${formatVoltage(product.power.voltage)} dokumentiert; eine belastbare Leistungsangabe fehlt in der geprüften Quelle.`;
  if (hasPower) return `Für ${product.model} sind ${formatPower(product.power.kw)} dokumentiert; die Netzspannung ist in der geprüften Quelle nicht ausgewiesen.`;
  return `Für ${product.model} weist die geprüfte Quelle weder Netzspannung noch elektrische Leistung belastbar aus.`;
}

function ProductEditorialFrame({ product, frame }: { product: NonNullable<ReturnType<typeof getProduct>>; frame: ProductFrame }) {
  return (
    <section className={`product-frame page-shell ${frame.className}`} aria-labelledby="product-frame-title">
      <div>
        <p className="eyebrow">{frame.kicker}</p>
        <h2 id="product-frame-title">{frame.title}</h2>
        <p data-product-copy="true">{frame.intro}</p>
      </div>
      <div className="product-frame-reading">
        <p className="product-frame-detail" data-product-copy="true">{frame.detail}</p>
        <div className="product-frame-columns">
          <div><small>Spricht dafür</small><ul>{product.editorial.pros.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><small>Vorher klären</small><ul>{product.editorial.cons.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
      </div>
    </section>
  );
}

type FamilyEditorial = {
  className: string;
  kicker: string;
  title: string;
  paragraphs: string[];
  pointsTitle: string;
  points: string[];
  callout: string;
};

function getFamilyEditorial(product: NonNullable<ReturnType<typeof getProduct>>, familyProducts: NonNullable<ReturnType<typeof getProduct>>[]): FamilyEditorial {
  const family = product.family;
  if (!family) throw new Error("Family editorial requires a product family");
  const variants = familyProducts.map((item) => item.family?.variant ?? item.model);
  const footprints = familyProducts.map((item) => item.dimensions_cm.width * item.dimensions_cm.depth / 10_000);
  const minFootprint = Math.min(...footprints).toLocaleString("de-DE", { maximumFractionDigits: 2 });
  const maxFootprint = Math.max(...footprints).toLocaleString("de-DE", { maximumFractionDigits: 2 });
  const maxPeople = Math.max(...familyProducts.map((item) => item.people.max));
  const categories = new Set(familyProducts.map((item) => item.category));
  const outdoor = categories.has("outdoor");
  const infrared = categories.has("infrared");
  const voltageLabels = [...new Set(familyProducts.map((item) => formatVoltage(item.power.voltage)))];
  const variantList = variants.slice(0, 3).join(", ");
  const variant = productHash(family.id) % 4;

  if (outdoor) {
    return {
      className: "family-editorial family-editorial-outdoor",
      kicker: "Familienblick · Standort und Ausführung",
      title: `${family.name} ist eine Reihe von Standortentscheidungen.`,
      paragraphs: [
        `Die ${family.name}-Varianten liegen bei etwa ${minFootprint} bis ${maxFootprint} m² rechnerischer Produktfläche und reichen bis zu ${maxPeople} Personen. Das beschreibt die Produktspanne, nicht automatisch die benötigte Grundstücksfläche.`,
        `Verglichen werden hier unter anderem ${variantList}. Fundament, Zugang, Wetterschutz und die Ofen- beziehungsweise Anschlussplanung bleiben je Variante zu prüfen.`,
      ],
      pointsTitle: "Die Reihe sinnvoll lesen",
      points: ["Sockelmaß und reale Aufstellfläche trennen", "Lieferumfang von Ofen und Dach prüfen", `Spannungsangaben der Reihe: ${voltageLabels.join(" / ")}`],
      callout: "Bei einer Outdoor-Familie ist die passende Variante die, die zum Grundstück und zum Bauumfang passt.",
    };
  }

  if (infrared) {
    return {
      className: "family-editorial family-editorial-technical",
      kicker: "Familienblick · Wärmeprofil und Raum",
      title: `${family.name}: gleiche Idee, andere Stellfläche.`,
      paragraphs: [
        `Die ${family.name}-Varianten bleiben Infrarotkabinen, unterscheiden sich aber bei ${variantList}. Die rechnerische Produktfläche reicht von ${minFootprint} bis ${maxFootprint} m².`,
        `Die Reihe deckt unterschiedliche Raumgrößen ab. Strahler, Regelung, Zugang und der konkrete Anschluss müssen für jedes Modell einzeln geprüft werden.`,
      ],
      pointsTitle: "Vor der Größenwahl",
      points: ["Innenmaß und Sitzposition aus der Anleitung prüfen", "Wärmeart nicht mit einer Ofensauna gleichsetzen", `Anschlussdaten je Variante abgleichen: ${voltageLabels.join(" / ")}`],
      callout: "Vergleiche die Varianten anhand von Raummaß, Sitzposition und Anschluss.",
    };
  }

  const rangeCopy = variant % 2 === 0
    ? {
        className: "family-editorial family-editorial-range",
        kicker: "Familienblick · Varianten einordnen",
        title: `${family.name} lässt sich über die Ausführung lesen.`,
        paragraphs: [
          `Die Reihe umfasst ${familyProducts.length} dokumentierte Varianten. Sie bewegen sich zwischen ${minFootprint} und ${maxFootprint} m² Produktfläche und sind für bis zu ${maxPeople} Personen ausgewiesen.`,
          `Die Unterschiede liegen bei ${variantList}. Deshalb sollte zuerst die Nutzung feststehen und erst danach die passende Konfiguration aus der Reihe gewählt werden.`,
        ],
        pointsTitle: "Was sich je Variante ändern kann",
        points: ["Grundriss und Türposition", "Ofen, Steuerung und Leistungsangabe", "Glas, Holz und Lieferumfang"],
        callout: `Die ${family.name}-Reihe umfasst unterschiedliche Größen und Konfigurationen für verschiedene Einbausituationen.`,
      }
    : {
        className: "family-editorial family-editorial-space",
        kicker: "Familienblick · Raum und Nutzung",
        title: `${family.name}: zuerst den Raum, dann die Variante.`,
        paragraphs: [
          `Für ${family.name} sind ${familyProducts.length} Varianten mit unterschiedlichen Ausführungen dokumentiert. Die kleinste und größte rechnerische Produktfläche liegen bei ${minFootprint} beziehungsweise ${maxFootprint} m².`,
          `Die Kapazität reicht in dieser Reihe bis zu ${maxPeople} Personen. Ein größerer Grundriss kann Zugang und Komfort verändern, sagt aber allein noch nichts über Wärmeverteilung oder Montageaufwand aus.`,
        ],
        pointsTitle: "Gemeinsamkeiten nicht überbewerten",
        points: ["Außenmaß gegen Raumabstände rechnen", "Innenraum und Bankanordnung vergleichen", "Anschluss und Montageanleitung je Modell prüfen"],
        callout: `Die passende ${family.name}-Variante ist die, deren Ausführung zu deinem Raum und Ablauf passt.`,
      };
  return rangeCopy;
}

function FamilyEditorial({ product, familyProducts }: { product: NonNullable<ReturnType<typeof getProduct>>; familyProducts: NonNullable<ReturnType<typeof getProduct>>[] }) {
  const editorial = getFamilyEditorial(product, familyProducts);
  if (editorial.className.includes("outdoor")) {
    return (
      <section className={`${editorial.className} page-shell`} aria-labelledby="family-editorial-title">
        <div><p className="eyebrow">{editorial.kicker}</p><h2 id="family-editorial-title">{editorial.title}</h2>{editorial.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="family-editorial-order"><p className="family-editorial-callout">{editorial.callout}</p><p className="eyebrow">{editorial.pointsTitle}</p><ol>{editorial.points.map((point, index) => <li key={point}><span>0{index + 1}</span>{point}</li>)}</ol></div>
      </section>
    );
  }
  if (editorial.className.includes("technical")) {
    return (
      <section className={`${editorial.className} page-shell`} aria-labelledby="family-editorial-title">
        <div className="family-editorial-callout"><p className="eyebrow">{editorial.kicker}</p><blockquote id="family-editorial-title">{editorial.callout}</blockquote></div>
        <div><h2>{editorial.title}</h2>{editorial.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<h3>{editorial.pointsTitle}</h3><ul>{editorial.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
      </section>
    );
  }
  return (
    <section className={`${editorial.className} page-shell`} aria-labelledby="family-editorial-title">
      <div><p className="eyebrow">{editorial.kicker}</p><h2 id="family-editorial-title">{editorial.title}</h2></div>
      <div>{editorial.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p className="family-editorial-callout">{editorial.callout}</p><h3>{editorial.pointsTitle}</h3><ul>{editorial.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
    </section>
  );
}
