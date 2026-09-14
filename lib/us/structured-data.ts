import { siteUrl } from "../site.ts";
import type { JsonLd } from "../structured-data.ts";
import type { UsEditorialPage, UsHomePage } from "./content-types.ts";
import type { UsEditorialProduct } from "./content.ts";
import type { UsFact, UsMarketProduct, UsProductConfiguration, UsSource } from "./types.ts";

type BreadcrumbItem = { name: string; path: string };

function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

function documentedValue<T>(fact: UsFact<T>) {
  return fact.status === "documented" ? fact.value : undefined;
}

function measurement(value: { value: number; unit: string }) {
  return `${value.value} ${value.unit}`;
}

export function usOrganizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Select Your Sauna",
    legalName: "SeitenHafen361",
    url: `${siteUrl}/`,
    logo: absoluteUrl("/brand/sauna-512.png"),
    email: "info@selectyoursauna.com",
  };
}

export function usWebsiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/us/#website`,
    name: "Select Your Sauna",
    url: absoluteUrl("/us/"),
    inLanguage: "en-US",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function usBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  const currentPath = items.at(-1)?.path ?? "/us/";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(currentPath)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function usProductJsonLd(product: UsMarketProduct, configuration: UsProductConfiguration): JsonLd {
  const path = `/us/saunas/${product.slug}/`;
  const dimensions = documentedValue(configuration.dimensions.exterior);
  const capacity = documentedValue(configuration.capacity.seated);
  const sku = documentedValue(configuration.manufacturer_sku);
  const materials = documentedValue(configuration.materials);
  const voltages = [...new Set(configuration.electrical_supply_options.flatMap((option) =>
    option.requirements.flatMap((requirement) => {
      const voltage = documentedValue(requirement.voltage_v);
      return voltage === undefined ? [] : [voltage];
    })))].sort((left, right) => left - right);
  const additionalProperty = [
    ...(dimensions ? [{
      "@type": "PropertyValue",
      name: "Exterior dimensions (W × D × H)",
      value: `${measurement(dimensions.width)} × ${measurement(dimensions.depth)} × ${measurement(dimensions.height)}`,
    }] : []),
    ...(capacity !== undefined ? [{ "@type": "PropertyValue", name: "Seated capacity", value: capacity }] : []),
    ...(voltages.length > 0 ? [{ "@type": "PropertyValue", name: "Documented supply voltage", value: voltages.map((value) => `${value} V`).join(" or ") }] : []),
    ...(materials ? [{ "@type": "PropertyValue", name: "Documented materials", value: materials.join(", ") }] : []),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(path)}#product`,
    name: `${product.brand_name} ${product.model}`,
    model: product.model,
    brand: { "@type": "Brand", name: product.brand_name },
    url: absoluteUrl(path),
    description: `Documented configuration record for the ${product.brand_name} ${product.model} in the United States.`,
    ...(sku ? { sku } : {}),
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
  };
}

export function usEditorialJsonLd(page: UsEditorialPage, items: UsEditorialProduct[], sources: UsSource[]): JsonLd {
  const path = page.page_type === "comparison"
    ? `/us/compare/${page.slug}/`
    : `/us/${page.page_type}s/${page.slug}/`;
  const url = absoluteUrl(path);

  if (page.page_type === "comparison") {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url}#item-list`,
      name: page.title,
      description: page.description,
      url,
      inLanguage: "en-US",
      numberOfItems: items.length,
      itemListElement: items.map(({ product }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${product.brand_name} ${product.model}`,
        url: absoluteUrl(`/us/saunas/${product.slug}/`),
      })),
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: page.title,
    description: page.description,
    url,
    inLanguage: "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: { "@id": `${siteUrl}/#organization` },
    citation: sources.map((source) => source.url),
  };
}

export function usHomeJsonLd(page: UsHomePage): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/us/")}#webpage`,
    name: page.title,
    description: page.description,
    url: absoluteUrl("/us/"),
    inLanguage: "en-US",
    isPartOf: { "@id": `${siteUrl}/us/#website` },
  };
}
