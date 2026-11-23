import type { ReactNode } from "react";
import Link from "next/link";
import { StructuredData } from "@/app/_components/StructuredData";
import { UsSaunaRows } from "./UsCatalog";

import {
  getUsEditorialPages,
  getUsEditorialSources,
  getUsHomeSources,
  selectUsBrandConfigurations,
  selectUsComparisonConfigurations,
  selectUsGuideConfigurations,
  usEditorialPath,
  type UsEditorialProduct,
} from "@/lib/us/content";
import { getUsPublicCatalogItems } from "@/lib/us/catalog-index";
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
import { costPerHourUsd, formatUsd, median, ratedPowerW, statePricesSorted, usElectricityPrices } from "@/lib/us/running-cost";
import {
  usBreadcrumbJsonLd,
  usEditorialJsonLd,
  usHomeJsonLd,
  usOrganizationJsonLd,
  usWebsiteJsonLd,
} from "@/lib/us/structured-data";

const indexCopy = {
  comparison: { title: "Sauna comparisons", description: "Lists of saunas that answer one question each, like size or voltage." },
  brand: { title: "Sauna brands", description: "What each brand makes and how the models differ." },
  guide: { title: "Guides", description: "Power, running cost and the other things worth checking before you order." },
} satisfies Record<UsEditorialPageType, { title: string; description: string }>;

function documentedValue<T>(fact: UsFact<T>) {
  return fact.status === "documented" ? fact.value : null;
}

function measurement(value: UsDimensions["width"]) {
  return `${value.value} ${value.unit}`;
}

function dimensionsLabel(configuration: UsProductConfiguration) {
  const dimensions = documentedValue(configuration.dimensions.exterior);
  if (!dimensions) return "–";
  return `${measurement(dimensions.width)} × ${measurement(dimensions.depth)} × ${measurement(dimensions.height)}`.replace(/ in(?= ×)/g, "");
}

function voltageLabel(configuration: UsProductConfiguration) {
  const voltages = [...new Set(configuration.electrical_supply_options.flatMap((option) =>
    option.requirements.flatMap((requirement) => {
      const voltage = documentedValue(requirement.voltage_v);
      return voltage === null ? [] : [voltage];
    })))].sort((left, right) => left - right);
  return voltages.length > 0 ? voltages.map((value) => `${value} V`).join(" or ") : "–";
}

function powerLabel(configuration: UsProductConfiguration) {
  const watts = ratedPowerW(configuration);
  return watts === null ? "–" : `${(watts / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} kW`;
}

function relatedLabel(path: string) {
  const fixed: Record<string, string> = {
    "/us/": "Home",
    "/us/saunas/": "All saunas",
    "/us/sauna-finder/": "Sauna finder",
  };
  return fixed[path] ?? getUsEditorialPages("comparison").concat(getUsEditorialPages("guide"), getUsEditorialPages("brand")).find((page) => usEditorialPath(page) === path)?.title ?? path;
}

function ModelTable({ items, title }: { items: UsEditorialProduct[]; title: string }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2>{title}</h2>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">Model</th><th scope="col">Seats</th><th scope="col">Outside size (W × D × H)</th><th scope="col">Voltage</th><th scope="col">Power</th></tr></thead>
        <tbody>{items.map(({ product, configuration }) => (
          <tr key={configuration.id}>
            <th scope="row"><Link href={`/us/saunas/${product.slug}/`}>{product.brand_name} {product.model}</Link></th>
            <td>{documentedValue(configuration.capacity.seated) ?? "–"}</td>
            <td>{dimensionsLabel(configuration)}</td>
            <td>{voltageLabel(configuration)}</td>
            <td>{powerLabel(configuration)}</td>
          </tr>
        ))}</tbody>
      </table></div>
      <p className="updated">A dash means the manufacturer doesn&apos;t say.</p>
    </section>
  );
}

function RunningCost({ items }: { items: UsEditorialProduct[] }) {
  const rows = items
    .map((item) => ({ ...item, watts: ratedPowerW(item.configuration) }))
    .filter((row): row is UsEditorialProduct & { watts: number } => row.watts !== null)
    .sort((left, right) => left.watts - right.watts
      || left.product.brand_name.localeCompare(right.product.brand_name, "en-US")
      || left.product.model.localeCompare(right.product.model, "en-US"));
  const states = statePricesSorted();
  const cheapest = states[0];
  const dearest = states[states.length - 1];
  const heatLabel = (item: UsEditorialProduct) => documentedValue(item.product.heat_type) ?? "–";
  const typical = (heat: string) => median(rows.filter((row) => heatLabel(row) === heat).map((row) => row.watts));
  const infraredW = typical("infrared");
  const traditionalW = typical("traditional");
  const average = usElectricityPrices.us_average;
  return (
    <section>
      <h2>Cost of one hour, model by model</h2>
      <p className="text">At full power, with the average home electricity price of {average.toFixed(2)} cents per kWh ({usElectricityPrices.period_label}, EIA). {cheapest.state} is cheapest at {cheapest.cents.toFixed(2)} cents, {dearest.state} most expensive at {dearest.cents.toFixed(2)}.</p>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">Model</th><th scope="col">Heat</th><th scope="col">Power</th><th scope="col">{cheapest.state}</th><th scope="col">US average</th><th scope="col">{dearest.state}</th></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.configuration.id}>
            <th scope="row"><Link href={`/us/saunas/${row.product.slug}/`}>{row.product.brand_name} {row.product.model}</Link></th>
            <td>{heatLabel(row)}</td>
            <td>{powerLabel(row.configuration)}</td>
            <td>{formatUsd(costPerHourUsd(row.watts, cheapest.cents))}</td>
            <td>{formatUsd(costPerHourUsd(row.watts, average))}</td>
            <td>{formatUsd(costPerHourUsd(row.watts, dearest.cents))}</td>
          </tr>
        ))}</tbody>
      </table></div>
      {infraredW !== null && traditionalW !== null ? (
        <>
          <h2 id="running-cost-states-title">Cost per hour by state</h2>
          <p className="text">For a typical infrared cabin ({(infraredW / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} kW) and a typical traditional sauna ({(traditionalW / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} kW).</p>
          <div className="table-wrap"><table aria-describedby="running-cost-states-title">
            <thead><tr><th scope="col">State</th><th scope="col">Cents per kWh</th><th scope="col">Infrared</th><th scope="col">Traditional</th></tr></thead>
            <tbody>{states.map(({ state, cents }) => (
              <tr key={state}>
                <th scope="row">{state}</th>
                <td>{cents.toFixed(2)}</td>
                <td>{formatUsd(costPerHourUsd(infraredW, cents))}</td>
                <td>{formatUsd(costPerHourUsd(traditionalW, cents))}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </>
      ) : null}
    </section>
  );
}

function Sections({ sections }: { sections: UsEditorialSection[] }) {
  return (
    <div className="text">
      {sections.map((section) => (
        <section key={section.id}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.points?.length ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
        </section>
      ))}
    </div>
  );
}

function isEditorialPage(page: UsEditorialPage | UsHomePage): page is UsEditorialPage {
  return "page_type" in page;
}

function Sources({ page }: { page: UsEditorialPage | UsHomePage }) {
  const sources = isEditorialPage(page) ? getUsEditorialSources(page) : getUsHomeSources(page);
  if (sources.length === 0) return null;
  const list = <ul>{sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>, {source.publisher}</li>)}</ul>;
  return (
    <section className="text sources">
      <h2>Sources</h2>
      {sources.length > 12 ? <details><summary>{sources.length} manufacturer pages and documents</summary>{list}</details> : list}
    </section>
  );
}

function RelatedPages({ page }: { page: Pick<UsEditorialPage, "related_paths"> | UsHomePage }) {
  if (page.related_paths.length === 0) return null;
  return (
    <nav aria-label="Related pages">
      <h2>Read next</h2>
      <ul>{page.related_paths.map((path) => <li key={path}><Link href={path}>{relatedLabel(path)}</Link></li>)}</ul>
    </nav>
  );
}

function pageProducts(page: UsEditorialPage, includeNonPublic: boolean) {
  const options = { includeNonPublic };
  if (page.page_type === "comparison") return selectUsComparisonConfigurations(page, options);
  if (page.page_type === "brand") return selectUsBrandConfigurations(page, options);
  return selectUsGuideConfigurations(page, options);
}

export function UsEditorialIndex({ pageType, pages }: { pageType: UsEditorialPageType; pages: UsEditorialPage[]; isPreview: boolean }) {
  const copy = indexCopy[pageType];
  return (
    <div className="wrap page">
      <h1>{copy.title}</h1>
      <p className="text">{copy.description}</p>
      <ul className="articles">
        {pages.map((page) => <li key={page.id}><Link href={usEditorialPath(page)}>{page.title}</Link><p>{page.description}</p></li>)}
        {pageType === "comparison" ? <li><Link href="/us/compare/models/">Compare any models side by side</Link><p>Pick two to four saunas and see them in one table.</p></li> : null}
      </ul>
    </div>
  );
}

export function UsEditorialPageView({ page, presentation, isPreview }: { page: UsEditorialPage; presentation: UsPagePresentation; isPreview: boolean }) {
  const products = pageProducts(page, isPreview);
  const usesRunningCost = presentation.module_order.includes("running-cost");
  const allProducts = usesRunningCost
    ? selectUsComparisonConfigurations({ ...page, page_type: "comparison", selection: { heat_types: ["infrared", "traditional", "hybrid"] } } as UsComparisonPage, { includeNonPublic: isPreview })
    : [];
  const sources = getUsEditorialSources(page);
  const pagePath = usEditorialPath(page);
  const sectionLabel = page.page_type === "comparison" ? "Comparisons" : page.page_type === "brand" ? "Brands" : "Guides";
  const sectionPath = page.page_type === "comparison" ? "/us/compare/" : `/us/${page.page_type}s/`;
  const modules: Record<string, ReactNode> = {
    selection: page.page_type === "comparison" ? <ModelTable items={products} title={`${products.length} ${products.length === 1 ? "model" : "models"}`} /> : null,
    catalog: <ModelTable items={products} title={page.page_type === "guide" ? "Models mentioned here" : "The models"} />,
    sections: <Sections sections={page.sections} />,
    sources: <Sources page={page} />,
    related: <RelatedPages page={page} />,
    "running-cost": usesRunningCost ? <RunningCost items={allProducts} /> : null,
  };
  return (
    <article className="wrap page">
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
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/us/">Home</Link><span>›</span><Link href={sectionPath}>{sectionLabel}</Link><span>›</span><span>{page.title}</span></nav>
      <h1>{page.heading}</h1>
      <div className="text">{page.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      {presentation.module_order.map((module) => <div data-module={module} key={module}>{modules[module]}</div>)}
    </article>
  );
}

export function UsHomePageView({ page, isPreview }: { page: UsHomePage; isPreview: boolean }) {
  const items = getUsPublicCatalogItems();
  const brands = [...new Set(items.map((item) => item.brand))].sort();
  const guides = getUsEditorialPages("guide");
  const comparisons = getUsEditorialPages("comparison");
  return (
    <div className="wrap page">
      {!isPreview ? (
        <>
          <StructuredData data={usOrganizationJsonLd()} />
          <StructuredData data={usWebsiteJsonLd()} />
          <StructuredData data={usHomeJsonLd(page)} />
        </>
      ) : null}
      <h1>{page.heading}</h1>
      <div className="text">{page.introduction.map((paragraph) => <p className="lead" key={paragraph}>{paragraph}</p>)}</div>
      <p className="actions"><Link className="btn" href="/us/sauna-finder/">Find a sauna by size and power</Link>{items.length > 0 ? <Link href="/us/saunas/">See all {items.length} saunas</Link> : null}</p>
      {items.length > 0 ? (
        <>
          <h2>Some of the saunas we list</h2>
          <UsSaunaRows items={items.slice(0, 8)} />
          <p>Brands: {brands.join(", ")}. <Link href="/us/compare/models/">Compare models side by side</Link></p>
        </>
      ) : null}
      <div className="two">
        {comparisons.length > 0 ? <section><h2>Comparisons</h2><ul>{comparisons.map((item) => <li key={item.id}><Link href={usEditorialPath(item)}>{item.title}</Link></li>)}</ul></section> : null}
        {guides.length > 0 ? <section><h2>Guides</h2><ul>{guides.map((item) => <li key={item.id}><Link href={usEditorialPath(item)}>{item.title}</Link></li>)}</ul></section> : null}
      </div>
      <Sections sections={page.sections} />
      <Sources page={page} />
    </div>
  );
}

export function UsTrustPageView({ page }: { page: UsTrustPage; isPreview: boolean }) {
  return (
    <article className="wrap page legal">
      <h1>{page.heading}</h1>
      <div className="text">
        {page.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {page.contact_email ? <p><a href={`mailto:${page.contact_email}`}>{page.contact_email}</a></p> : null}
      </div>
      <Sections sections={page.sections} />
    </article>
  );
}
