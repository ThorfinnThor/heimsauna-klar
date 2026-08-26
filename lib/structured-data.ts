import { siteUrl } from "@/lib/site";
import { formatVoltage, type Product } from "@/lib/products";

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
    url: `${siteUrl}/`,
    inLanguage: "de-DE",
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
}: PageData & { updatedAt: string }): JsonLd {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description,
    dateModified: updatedAt,
    inLanguage: "de-DE",
    mainEntityOfPage: url,
    isPartOf: { "@id": `${siteUrl}/#website` },
  };
}

function availabilityUrl(value: string) {
  if (value === "in-stock" || value === "low-stock-listed") return "https://schema.org/InStock";
  return undefined;
}

export function productJsonLd(product: Product): JsonLd {
  const path = `/de/produkte/${product.product_id}/`;
  const url = absoluteUrl(path);
  const offers = product.commercial.offers.map((offer) => {
    const availability = availabilityUrl(offer.availability);
    return {
      "@type": "Offer",
      url: offer.url,
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
