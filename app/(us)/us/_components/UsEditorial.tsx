import type { ReactNode } from "react";
import Link from "next/link";
import { StructuredData } from "@/app/_components/StructuredData";

import {
  getUsEditorialSources,
  getUsHomeSources,
  selectUsBrandConfigurations,
  selectUsComparisonConfigurations,
  selectUsGuideConfigurations,
  usEditorialPath,
  type UsEditorialProduct,
} from "@/lib/us/content";
import type {
  UsComparisonPage,
  UsEditorialPage,
  UsEditorialPageType,
  UsHomePage,
  UsEditorialSection,
  UsPagePresentation,
  UsTrustPage,
} from "@/lib/us/content-types";
import type { UsDimensions, UsFact, UsProductConfiguration } from "@/lib/us/types";
import {
  usBreadcrumbJsonLd,
  usEditorialJsonLd,
  usHomeJsonLd,
  usOrganizationJsonLd,
  usWebsiteJsonLd,
} from "@/lib/us/structured-data";

const indexCopy = {
  comparison: {
    eyebrow: "Curated comparisons",
    title: "Compare documented US sauna configurations.",
    description: "Each comparison has a defined scope and includes only configurations supported by the required source data.",
  },
  brand: {
    eyebrow: "Brand research",
    title: "See which configurations belong to each brand.",
    description: "Brand pages keep model identity, technical configuration and source coverage separate from merchant offers.",
  },
  guide: {
    eyebrow: "Planning guides",
    title: "Plan around the requirements that change the project.",
    description: "Guides address a specific planning question and link technical claims to the source material used for the page.",
  },
} satisfies Record<UsEditorialPageType, { eyebrow: string; title: string; description: string }>;

function documentedValue<T>(fact: UsFact<T>) {
  return fact.status === "documented" ? fact.value : null;
}

function measurement(value: UsDimensions["width"]) {
  return `${value.value} ${value.unit}`;
}

function dimensionsLabel(configuration: UsProductConfiguration) {
  const dimensions = documentedValue(configuration.dimensions.exterior);
  if (!dimensions) return "Not documented";
  return `${measurement(dimensions.width)} × ${measurement(dimensions.depth)} × ${measurement(dimensions.height)}`;
}

function voltageLabel(configuration: UsProductConfiguration) {
  const voltages = [...new Set(configuration.electrical_supply_options.flatMap((option) =>
    option.requirements.flatMap((requirement) => {
      const voltage = documentedValue(requirement.voltage_v);
      return voltage === null ? [] : [voltage];
    })))].sort((left, right) => left - right);
  return voltages.length > 0 ? voltages.map((value) => `${value} V`).join(" or ") : "Not documented";
}

function relatedLabel(path: string) {
  const slug = path.split("/").filter(Boolean).at(-1) ?? path;
  return slug.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

function ProductCards({ items }: { items: UsEditorialProduct[] }) {
  if (items.length === 0) return null;
  return (
    <section className="us-editorial-products" aria-labelledby="related-products-title">
      <header>
        <p className="eyebrow">Documented configurations</p>
        <h2 id="related-products-title">Products covered by this page</h2>
      </header>
      <div className="us-editorial-product-grid">
        {items.map(({ product, configuration }) => {
          const capacity = documentedValue(configuration.capacity.seated);
          return (
            <article key={configuration.id}>
              <p className="eyebrow">{product.brand_name}</p>
              <h3>{product.model}</h3>
              <dl>
                <div><dt>Capacity</dt><dd>{capacity === null ? "Not documented" : `${capacity} seated`}</dd></div>
                <div><dt>Exterior W × D × H</dt><dd>{dimensionsLabel(configuration)}</dd></div>
                <div><dt>Electrical</dt><dd>{voltageLabel(configuration)}</dd></div>
              </dl>
              <Link href={`/us/saunas/${product.slug}/`}>View configuration <span aria-hidden="true">↗</span></Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ComparisonMatrix({ page, items }: { page: UsComparisonPage; items: UsEditorialProduct[] }) {
  return (
    <section className="us-comparison-matrix" aria-labelledby="comparison-matrix-title">
      <header>
        <p className="eyebrow">Defined comparison set</p>
        <h2 id="comparison-matrix-title">{items.length} documented {items.length === 1 ? "configuration" : "configurations"}</h2>
        <p>The list follows the criteria recorded for this comparison. A missing value never counts as a match.</p>
      </header>
      {items.length > 0 ? (
        <div className="us-comparison-table-wrap">
          <table>
            <thead><tr><th>Configuration</th><th>Capacity</th><th>Exterior W × D × H</th><th>Electrical</th></tr></thead>
            <tbody>
              {items.map(({ product, configuration }) => {
                const capacity = documentedValue(configuration.capacity.seated);
                return (
                  <tr key={configuration.id}>
                    <th><Link href={`/us/saunas/${product.slug}/`}>{product.brand_name} {product.model}</Link></th>
                    <td>{capacity === null ? "Not documented" : `${capacity} seated`}</td>
                    <td>{dimensionsLabel(configuration)}</td>
                    <td>{voltageLabel(configuration)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <p className="us-editorial-empty">No published configuration satisfies the recorded comparison rule.</p>}
      <details className="us-comparison-scope">
        <summary>How this set is selected</summary>
        <dl>
          {page.selection.product_types?.length ? <div><dt>Product type</dt><dd>{page.selection.product_types.join(", ")}</dd></div> : null}
          {page.selection.heat_types?.length ? <div><dt>Heat type</dt><dd>{page.selection.heat_types.join(", ")}</dd></div> : null}
          {page.selection.placements?.length ? <div><dt>Placement</dt><dd>{page.selection.placements.join(", ")}</dd></div> : null}
          {page.selection.minimum_seated_capacity ? <div><dt>Minimum capacity</dt><dd>{page.selection.minimum_seated_capacity} seated</dd></div> : null}
          {page.selection.voltages_v?.length ? <div><dt>Voltage</dt><dd>{page.selection.voltages_v.map((value) => `${value} V`).join(" or ")}</dd></div> : null}
          {page.selection.brands?.length ? <div><dt>Brand</dt><dd>{page.selection.brands.join(", ")}</dd></div> : null}
          {page.selection.product_ids?.length ? <div><dt>Explicit records</dt><dd>{page.selection.product_ids.length}</dd></div> : null}
        </dl>
      </details>
    </section>
  );
}

function EditorialSections({ page }: { page: { sections: UsEditorialSection[] } }) {
  if (page.sections.length === 0) return null;
  return (
    <section className="us-editorial-sections" aria-label="Editorial guidance">
      {page.sections.map((section, index) => (
        <article key={section.id}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.points?.length ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
          </div>
        </article>
      ))}
    </section>
  );
}

function isEditorialPage(page: UsEditorialPage | UsHomePage): page is UsEditorialPage {
  return "page_type" in page;
}

function EditorialSources({ page }: { page: UsEditorialPage | UsHomePage }) {
  const sources = isEditorialPage(page) ? getUsEditorialSources(page) : getUsHomeSources(page);
  if (sources.length === 0) return null;
  return (
    <section className="us-editorial-sources" aria-labelledby="editorial-sources-title">
      <div><p className="eyebrow">Source record</p><h2 id="editorial-sources-title">Material used for this page</h2></div>
      <ul>{sources.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <span aria-hidden="true">↗</span></a>
          <span>{source.publisher}</span>
        </li>
      ))}</ul>
    </section>
  );
}

function RelatedPages({ page }: { page: Pick<UsEditorialPage, "related_paths"> | UsHomePage }) {
  if (page.related_paths.length === 0) return null;
  return (
    <nav className="us-editorial-related" aria-labelledby="related-pages-title">
      <p className="eyebrow">Continue planning</p>
      <h2 id="related-pages-title">Related pages</h2>
      <div>{page.related_paths.map((path) => <Link href={path} key={path}>{relatedLabel(path)} <span aria-hidden="true">↗</span></Link>)}</div>
    </nav>
  );
}

function pageProducts(page: UsEditorialPage, includeNonPublic: boolean) {
  const options = { includeNonPublic };
  if (page.page_type === "comparison") return selectUsComparisonConfigurations(page, options);
  if (page.page_type === "brand") return selectUsBrandConfigurations(page, options);
  return selectUsGuideConfigurations(page, options);
}

export function UsEditorialIndex({ pageType, pages, isPreview }: { pageType: UsEditorialPageType; pages: UsEditorialPage[]; isPreview: boolean }) {
  const copy = indexCopy[pageType];
  return (
    <>
      <section className="page-hero page-shell us-editorial-index-hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </section>
      <section className="page-shell us-editorial-index">
        {isPreview ? <p className="us-preview-notice">Research preview · these pages are not approved for publication</p> : null}
        <div className="us-editorial-index-grid">
          {pages.map((page, index) => (
            <Link href={usEditorialPath(page)} key={page.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p className="eyebrow">{page.eyebrow}</p>
              <h2>{page.heading}</h2>
              <p>{page.description}</p>
              <strong>Open page <span aria-hidden="true">↗</span></strong>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function UsEditorialPageView({ page, presentation, isPreview }: { page: UsEditorialPage; presentation: UsPagePresentation; isPreview: boolean }) {
  const products = pageProducts(page, isPreview);
  const sources = getUsEditorialSources(page);
  const pagePath = usEditorialPath(page);
  const sectionLabel = page.page_type === "comparison" ? "Comparisons" : page.page_type === "brand" ? "Brands" : "Guides";
  const sectionPath = page.page_type === "comparison" ? "/us/compare/" : `/us/${page.page_type}s/`;
  const modules: Record<string, ReactNode> = {
    selection: page.page_type === "comparison" ? <ComparisonMatrix page={page} items={products} /> : null,
    catalog: <ProductCards items={products} />,
    sections: <EditorialSections page={page} />,
    sources: <EditorialSources page={page} />,
    related: <RelatedPages page={page} />,
  };
  return (
    <article className={`us-editorial-page us-editorial-page-${presentation.layout}`}>
      {!isPreview ? (
        <>
          <StructuredData data={usEditorialJsonLd(page, products, sources)} />
          <StructuredData data={usBreadcrumbJsonLd([
            { name: "US home", path: "/us/" },
            { name: sectionLabel, path: sectionPath },
            { name: page.title, path: pagePath },
          ])} />
        </>
      ) : null}
      <header className="page-shell us-editorial-hero">
        {isPreview ? <p className="us-preview-notice">Research preview · this page is not approved for publication</p> : null}
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.heading}</h1>
        <div>{page.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </header>
      <div className="page-shell">
        {presentation.module_order.map((module) => <div data-module={module} key={module}>{modules[module]}</div>)}
      </div>
    </article>
  );
}

export function UsHomePageView({ page, isPreview }: { page: UsHomePage; isPreview: boolean }) {
  return (
    <>
      {!isPreview ? (
        <>
          <StructuredData data={usOrganizationJsonLd()} />
          <StructuredData data={usWebsiteJsonLd()} />
          <StructuredData data={usHomeJsonLd(page)} />
        </>
      ) : null}
      <article className="page-shell us-home-editorial">
        {isPreview ? <p className="us-preview-notice">Research preview · this page is not approved for publication</p> : null}
        <header className="us-editorial-hero">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.heading}</h1>
          <div>{page.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </header>
        <EditorialSections page={page} />
        <EditorialSources page={page} />
        <RelatedPages page={page} />
      </article>
    </>
  );
}

export function UsTrustPageView({ page, isPreview }: { page: UsTrustPage; isPreview: boolean }) {
  return (
    <article className="page-shell us-trust-page">
      {isPreview ? <p className="us-preview-notice">Research preview · this page is not approved for publication</p> : null}
      <header>
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.heading}</h1>
        {page.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {page.contact_email ? <a href={`mailto:${page.contact_email}`}>{page.contact_email}</a> : null}
      </header>
      <section className="us-editorial-sections" aria-label="Contact information">
        {page.sections.map((section, index) => (
          <article key={section.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </article>
        ))}
      </section>
    </article>
  );
}
