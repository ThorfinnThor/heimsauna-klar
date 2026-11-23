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
      ?? `${product.brand_name} ${product.model}: size, seats, power and materials from the manufacturer.`,
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
  return `${measurement(value.width)} × ${measurement(value.depth)} × ${measurement(value.height)}`.replace(/ in(?= ×)/g, "");
}

function offerPrice(amountMinor: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountMinor / 100);
}

// Only facts the manufacturer states become table rows.
function factRow<T>(label: string, fact: UsFact<T>, format: (value: T) => string = String) {
  if (fact.status === "documented") return [{ label, value: format(fact.value) }];
  if (fact.status === "conflict") return [{ label, value: "The manufacturer gives two different values." }];
  return [];
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

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

  const rows = [
    ...factRow("Seats", configuration.capacity.seated),
    ...factRow("Outside (W × D × H)", configuration.dimensions.exterior, dimensions),
    ...factRow("Inside (W × D × H)", configuration.dimensions.interior, dimensions),
    ...factRow("Wood and materials", configuration.materials, (value) => value.join(", ")),
    ...factRow("Weight", configuration.net_weight, (value) => `${value.value} ${value.unit}`),
    ...factRow("Clearances", configuration.dimensions.minimum_clearances, (value) => Object.entries(value).map(([side, size]) => `${side} ${measurement(size)}`).join(", ")),
    ...factRow("Shipping size", configuration.dimensions.shipping, dimensions),
    ...factRow("Model number", configuration.manufacturer_sku),
  ];
  const power = configuration.electrical_supply_options.map((option) => option.requirements.flatMap((requirement) => [
    ...factRow("Voltage", requirement.voltage_v, (value) => `${value} V`),
    ...factRow("Power", requirement.rated_power_w, (value) => `${value.toLocaleString("en-US")} W`),
    ...factRow("Circuit", requirement.required_circuit_a, (value) => `${value} A`),
    ...factRow("Dedicated circuit", requirement.dedicated_circuit, (value) => value ? "required" : "not required"),
    ...factRow("Connection", requirement.connection),
    ...factRow("Plug", requirement.plug_type),
  ])).filter((option) => option.length > 0);

  return (
    <article className="wrap page">
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
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/us/">Home</Link><span>›</span><Link href="/us/saunas/">Saunas</Link><span>›</span><span>{product.brand_name} {product.model}</span></nav>
      <h1>{product.brand_name} {product.model}</h1>
      <div className="product-top">
        <div>
          <p className="lead">{editorial?.summary ?? `${product.form.status === "documented" ? capitalize(product.form.value) : "Sauna"}${placement ? ` for ${placement} use` : ""}${capacity ? `, seats ${capacity}` : ""}.`}</p>
          {editorial?.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="offer-box">
          <h2>Where to buy</h2>
          {offerPresentations.length === 0 ? <p>We don&apos;t have a shop link for this one. Try the manufacturer&apos;s page under Sources.</p> : null}
          {offerPresentations.map(({ offer, merchant, link, priceVisible, statusLabel }) => (
            <div className="offer" key={offer.id}>
              <div className="offer-head"><span>{merchant?.name ?? "Shop"}</span>{priceVisible && offer.price ? <b>{offer.offer_type === "from-price" ? "from " : ""}{offerPrice(offer.price.amount_minor)}</b> : null}</div>
              {priceVisible && offer.price ? null : <p>{statusLabel}</p>}
              {link ? <a className="btn" href={link.href} rel={link.rel} target={link.target}>See it at {merchant?.name ?? "the shop"}</a> : null}
              {link ? <small>Affiliate link</small> : null}
            </div>
          ))}
        </div>
      </div>

      <h2>Specs</h2>
      <div className="table-wrap"><table className="facts"><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody></table></div>

      <h2>Power</h2>
      {power.length === 0 ? <p className="text">The manufacturer doesn&apos;t publish electrical details for this model. Ask for them before you order.</p> : null}
      {power.map((option, index) => (
        <div className="table-wrap" key={index}><table className="facts">
          {power.length > 1 ? <caption>Option {index + 1}</caption> : null}
          <tbody>{option.map((row, rowIndex) => <tr key={`${row.label}-${rowIndex}`}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody>
        </table></div>
      ))}
      <p className="text">Local rules differ, so have an electrician look at the manual before you commit.</p>

      {editorial ? (
        <div className="two">
          <section><h2>Worth knowing</h2><ul>{editorial.decision_points.map((point) => <li key={point}>{point}</li>)}</ul></section>
          {editorial.limitations.length > 0 ? <section><h2>What we couldn&apos;t find out</h2><ul>{editorial.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></section> : null}
        </div>
      ) : null}

      <section className="text sources">
        <h2>Sources</h2>
        <p>We haven&apos;t tried this sauna ourselves. The specs come from:</p>
        <ul>{sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>, {source.publisher}</li>)}</ul>
      </section>
    </article>
  );
}
