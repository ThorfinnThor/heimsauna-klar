import { siteUrl } from "@/lib/site";
import { formatVoltage, getEligibleOffers, getProductOfferUrl, type Product } from "@/lib/products";

export type JsonLd = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  path: string;
};

type PageData = {
  title: string;
  description: string;
  path: string;
};

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Select Your Sauna",
    alternateName: ["SelectYourSauna", "SelectYourSauna.com"],
    url: `${siteUrl}/`,
    inLanguage: "de-DE",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Select Your Sauna",
    legalName: "SeitenHafen361",
    url: `${siteUrl}/`,
    description: "Unabhängige deutschsprachige Planungs- und Vergleichsplattform für private Saunen.",
    publishingPrinciples: absoluteUrl("/de/ueber-uns/"),
    email: "info@selectyoursauna.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Freienwalder Str. 34",
      postalCode: "13359",
      addressLocality: "Berlin",
      addressCountry: "DE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Redaktionelle und allgemeine Anfragen",
      email: "info@selectyoursauna.com",
      availableLanguage: ["de"],
    },
  };
}

export function editorialAuthorJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/de/ueber-uns/#schayan-yousefian`,
    name: "Schayan Yousefian",
    url: absoluteUrl("/de/ueber-uns/#redaktion"),
    jobTitle: "Inhaber und redaktionell verantwortlich",
    worksFor: { "@id": `${siteUrl}/#organization` },
  };
}

export function aboutPageJsonLd({ title, description, path }: PageData): JsonLd {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${url}#webpage`,
    name: title,
    description,
    url,
    inLanguage: "de-DE",
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: { "@id": `${siteUrl}/#organization` },
    about: { "@id": `${siteUrl}/de/ueber-uns/#schayan-yousefian` },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  const pageUrl = absoluteUrl(items[items.length - 1]?.path ?? "/de/");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionPageJsonLd({ title, description, path }: PageData): JsonLd {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    name: title,
    description,
    url,
    inLanguage: "de-DE",
    isPartOf: { "@id": `${siteUrl}/#website` },
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  updatedAt,
  sources,
}: PageData & { updatedAt: string; sources: string[] }): JsonLd {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description,
    dateModified: `${updatedAt}T00:00:00Z`,
    inLanguage: "de-DE",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": `${siteUrl}/#website` },
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/de/ueber-uns/#schayan-yousefian`,
      name: "Schayan Yousefian",
      url: absoluteUrl("/de/ueber-uns/#redaktion"),
    },
    publisher: { "@id": `${siteUrl}/#organization` },
    citation: sources,
  };
}

function availabilityUrl(value: string) {
  if (value === "in-stock" || value === "low-stock-listed") return "https://schema.org/InStock";
  return undefined;
}

export function productJsonLd(product: Product): JsonLd {
  const path = `/de/produkte/${product.product_id}/`;
  const url = absoluteUrl(path);
  const offers = getEligibleOffers(product).map((offer) => {
    const availability = availabilityUrl(offer.availability);
    return {
      "@type": "Offer",
      url: getProductOfferUrl(product, offer.url),
      priceCurrency: product.commercial.currency,
      price: offer.price,
      seller: { "@type": "Organization", name: offer.merchant },
      ...(availability ? { availability } : {}),
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${product.brand} ${product.model}`,
    sku: product.product_id,
    model: product.model,
    brand: { "@type": "Brand", name: product.brand },
    category: product.sauna.type,
    description: product.editorial.disclosure,
    url,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Außenmaß", value: `${product.dimensions_cm.width} × ${product.dimensions_cm.depth} × ${product.dimensions_cm.height} cm` },
      { "@type": "PropertyValue", name: "Kapazität", value: `bis ${product.people.max} ${product.people.max === 1 ? "Person" : "Personen"}` },
      { "@type": "PropertyValue", name: "Spannung", value: formatVoltage(product.power.voltage) },
      { "@type": "PropertyValue", name: "Wärmeart", value: product.sauna.heater_type },
    ],
    ...(offers.length > 0 ? { offers } : {}),
  };
}
