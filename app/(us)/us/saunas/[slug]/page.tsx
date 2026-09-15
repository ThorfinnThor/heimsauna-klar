import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "@/app/_components/StructuredData";
import { getUsOfferPresentationsForConfiguration } from "@/lib/us/affiliate";
import {
  getUsConfigurationsForProduct,
  getUsProductBySlug,
  getUsPublicProducts,
  getUsResearchProducts,
  getUsSources,
} from "@/lib/us/catalog";
import { getUsProductEditorial, isUsResearchPreview } from "@/lib/us/content";
import { createUsPageMetadata } from "@/lib/us/seo";
import { usBreadcrumbJsonLd, usProductJsonLd } from "@/lib/us/structured-data";
import type { UsDimensions, UsFact, UsMeasurement } from "@/lib/us/types";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  const products = isUsResearchPreview() ? getUsResearchProducts() : getUsPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

function resolveProduct(slug: string) {
  return getUsProductBySlug(slug, { includeNonPublic: isUsResearchPreview() });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = resolveProduct(slug);
  if (!product) return {};
  const editorial = getUsProductEditorial(product.id, { includeNonPublic: product.publication_status !== "published" });
  const hasPublishedConfiguration = getUsConfigurationsForProduct(product.id)
    .some((configuration) => configuration.publication_status === "published");
  return createUsPageMetadata({
    title: `${product.brand_name} ${product.model}`,
    description: editorial?.summary
      ?? `Documented US configuration details, dimensions and electrical requirements for the ${product.brand_name} ${product.model}.`,
    path: `/us/saunas/${product.slug}/`,
    pageClass: "detail",
    publicationStatus: product.publication_status,
    hasPublishedContent: hasPublishedConfiguration,
  });
}

function measurement(value: UsMeasurement) {
  return `${value.value} ${value.unit}`;
}

function dimensions(value: UsDimensions) {
  return `${measurement(value.width)} × ${measurement(value.depth)} × ${measurement(value.height)}`;
}

function offerPrice(amountMinor: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountMinor / 100);
}

function FactValue<T>({ fact, format = String }: { fact: UsFact<T>; format?: (value: T) => string }) {
  if (fact.status === "documented") return <span>{format(fact.value)}</span>;
  if (fact.status === "conflict") return <span className="us-fact-open">Conflicting sources <small>{fact.note}</small></span>;
  return <span className="us-fact-open">Not documented <small>{fact.reason}</small></span>;
}

export default async function UsSaunaProductPage({ params }: Props) {
  const { slug } = await params;
  const product = resolveProduct(slug);
  if (!product) notFound();
  const configurations = getUsConfigurationsForProduct(product.id);
  const configuration = configurations
    .find((entry) => entry.publication_status === "published")
    ?? configurations.find((entry) => entry.publication_status === "reviewed")
    ?? configurations[0];
  if (!configuration) notFound();
  const sourceIds = [...new Set([...product.source_ids, ...configuration.source_ids])];
  const sources = getUsSources(sourceIds);
  const offerPresentations = getUsOfferPresentationsForConfiguration(configuration.id);
  const isResearchPreview = product.publication_status !== "published";
  const editorial = getUsProductEditorial(product.id, { includeNonPublic: isResearchPreview });
  const placement = product.placements.status === "documented" ? product.placements.value.join(" and ") : null;
  const capacity = configuration.capacity.seated.status === "documented" ? configuration.capacity.seated.value : null;

  return (
    <article className="page-shell us-product-page">
        {!isResearchPreview ? (
          <>
            <StructuredData data={usProductJsonLd(product, configuration)} />
            <StructuredData data={usBreadcrumbJsonLd([
              { name: "US home", path: "/us/" },
              { name: "Saunas", path: "/us/saunas/" },
              { name: `${product.brand_name} ${product.model}`, path: `/us/saunas/${product.slug}/` },
            ])} />
          </>
        ) : null}
        <nav className="us-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/us/">US home</Link><span>/</span><Link href="/us/saunas/">Saunas</Link><span>/</span><span>{product.model}</span>
        </nav>
        <header className="us-product-hero">
          <div>
            <p className="eyebrow">{product.brand_name} · US configuration</p>
            <h1>{product.model}</h1>
            <p>{editorial?.summary ?? (
              <>This product record describes {product.form.status === "documented" ? product.form.value.toLowerCase() : "a sauna configuration"}
                {placement ? ` for ${placement} placement` : ""}{capacity ? ` with documented seating for ${capacity}` : ""}.
                Unknown specifications remain open rather than being inferred from a related model.</>
            )}</p>
          </div>
          <aside>
            {offerPresentations.length > 0 ? (
              <>
                <p>{offerPresentations.length === 1 ? "Offer status" : `${offerPresentations.length} offer statuses`}</p>
                <div className="us-affiliate-offers">
                  {offerPresentations.map(({ offer, merchant, link, priceVisible, statusLabel }) => (
                    <div key={offer.id}>
                      <strong>{merchant?.name ?? "Merchant under review"}</strong>
                      {priceVisible && offer.price ? <span>{offer.offer_type === "from-price" ? "From " : ""}{offerPrice(offer.price.amount_minor)}</span> : <span>{statusLabel}</span>}
                      {link ? <a href={link.href} rel={link.rel} target={link.target}>View offer <span aria-hidden="true">↗</span></a> : null}
                      {link ? <small>Affiliate link</small> : null}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p>Offer status</p>
                <strong>No reviewed offer</strong>
                <span>No merchant or affiliate link is attached to this exact configuration.</span>
              </>
            )}
          </aside>
        </header>

        {editorial ? (
          <section className="us-product-editorial" aria-labelledby="editorial-title">
            <header>
              <p className="eyebrow">{editorial.eyebrow}</p>
              <h2 id="editorial-title">{editorial.heading}</h2>
              {editorial.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </header>
            <div className="us-product-editorial-grid">
              <div>
                <p className="eyebrow">What the record helps compare</p>
                <ul>
                  {editorial.decision_points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
              <aside>
                <p className="eyebrow">Open points</p>
                {editorial.limitations.map((limitation) => <p key={limitation}>{limitation}</p>)}
              </aside>
            </div>
          </section>
        ) : null}

        <section className="us-product-section us-product-overview" aria-labelledby="configuration-title">
          <div>
            <p className="eyebrow">Exact configuration</p>
            <h2 id="configuration-title">{configuration.label}</h2>
          </div>
          <dl className="us-product-facts">
            <div><dt>Manufacturer SKU</dt><dd><FactValue fact={configuration.manufacturer_sku} /></dd></div>
            <div><dt>Seated capacity</dt><dd><FactValue fact={configuration.capacity.seated} format={(value) => `${value} ${value === 1 ? "person" : "people"}`} /></dd></div>
            <div><dt>Exterior W × D × H</dt><dd><FactValue fact={configuration.dimensions.exterior} format={dimensions} /></dd></div>
            <div><dt>Interior W × D × H</dt><dd><FactValue fact={configuration.dimensions.interior} format={dimensions} /></dd></div>
            <div><dt>Net weight</dt><dd><FactValue fact={configuration.net_weight} format={(value) => `${value.value} ${value.unit}`} /></dd></div>
            <div><dt>Materials</dt><dd><FactValue fact={configuration.materials} format={(value) => value.join(", ")} /></dd></div>
            <div><dt>Minimum clearances</dt><dd><FactValue fact={configuration.dimensions.minimum_clearances} format={(value) => Object.entries(value).map(([side, size]) => `${side}: ${measurement(size)}`).join(", ")} /></dd></div>
            <div><dt>Shipping dimensions</dt><dd><FactValue fact={configuration.dimensions.shipping} format={dimensions} /></dd></div>
          </dl>
        </section>

        <section className="us-product-section" aria-labelledby="electrical-title">
          <div>
            <p className="eyebrow">Electrical planning</p>
            <h2 id="electrical-title">Requirements belong to this configuration.</h2>
            <p>Voltage alone is not an installation approval. The circuit, connection, plug and local electrical requirements must be checked together.</p>
          </div>
          <div className="us-electrical-options">
            {configuration.electrical_supply_options.length > 0 ? configuration.electrical_supply_options.map((option, optionIndex) => (
              <section key={option.id}>
                <h3>Supply option {optionIndex + 1}</h3>
                {option.requirements.map((requirement, requirementIndex) => (
                  <dl className="us-product-facts" key={`${option.id}-${requirementIndex}`}>
                    <div><dt>Component</dt><dd>{requirement.component}</dd></div>
                    <div><dt>Voltage</dt><dd><FactValue fact={requirement.voltage_v} format={(value) => `${value} V`} /></dd></div>
                    <div><dt>Rated power</dt><dd><FactValue fact={requirement.rated_power_w} format={(value) => `${value} W`} /></dd></div>
                    <div><dt>Required circuit</dt><dd><FactValue fact={requirement.required_circuit_a} format={(value) => `${value} A`} /></dd></div>
                    <div><dt>Connection</dt><dd><FactValue fact={requirement.connection} /></dd></div>
                    <div><dt>Plug type</dt><dd><FactValue fact={requirement.plug_type} /></dd></div>
                    <div><dt>Dedicated circuit</dt><dd><FactValue fact={requirement.dedicated_circuit} format={(value) => value ? "Required" : "Not required"} /></dd></div>
                  </dl>
                ))}
              </section>
            )) : <p>No electrical supply option has been documented for this configuration.</p>}
          </div>
        </section>

        <section className="us-product-section us-product-status" aria-labelledby="status-title">
          <div>
            <p className="eyebrow">Scope and open records</p>
            <h2 id="status-title">What this record does not establish</h2>
          </div>
          <div>
            <p>{configuration.components.length > 0 ? "Included and excluded components are listed in the configuration record." : "Included components have not yet been normalized into the configuration record."}</p>
            <p>{configuration.certification_ids.length > 0 ? "Certification records are linked to this configuration." : "No certification record has been added. This is a data gap, not a statement that the product lacks certification."}</p>
            <p>{configuration.warranty_ids.length > 0 ? "Warranty records are linked to this configuration." : "No warranty record has been added for this configuration."}</p>
          </div>
        </section>

        <section className="us-product-section us-product-sources" aria-labelledby="sources-title">
          <div>
            <p className="eyebrow">Sources</p>
            <h2 id="sources-title">Documents used for this record</h2>
          </div>
          <ul>
            {sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <span aria-hidden="true">↗</span></a>
                <span>{source.publisher}</span>
              </li>
            ))}
          </ul>
        </section>
    </article>
  );
}
