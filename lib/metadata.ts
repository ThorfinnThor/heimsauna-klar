import type { Metadata } from "next";
import { getMarketConfig, type MarketCode } from "./markets.ts";
import { siteUrl } from "./site.ts";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "article" | "website";
  indexable?: boolean;
  market?: MarketCode;
  languageAlternates?: Record<string, string>;
};

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  indexable = true,
  market: marketCode = "DE",
  languageAlternates,
}: PageMetadataInput): Metadata {
  const market = getMarketConfig(marketCode);
  const url = new URL(path, `${siteUrl}/`).toString();
  const socialTitle = `${title} | Select Your Sauna`;
  const socialImage = {
    url: new URL("/opengraph-image", `${siteUrl}/`).toString(),
    width: 1200,
    height: 630,
    alt: marketCode === "DE"
      ? "Select Your Sauna – Planungshilfe für private Saunen"
      : "Select Your Sauna – independent sauna planning guide",
  };

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    ...(type === "article" ? {
      authors: marketCode === "DE"
        ? [{
            name: "Schayan Yousefian",
            url: new URL("/de/ueber-uns/#redaktion", `${siteUrl}/`).toString(),
          }]
        : [{ name: "Schayan Yousefian" }],
    } : {}),
    alternates: {
      canonical: path,
      ...(languageAlternates && Object.keys(languageAlternates).length > 0
        ? { languages: languageAlternates }
        : {}),
    },
    openGraph: {
      type,
      locale: market.openGraphLocale,
      url,
      siteName: "Select Your Sauna",
      title: socialTitle,
      description,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage.url],
    },
    robots: indexable
      ? { index: true, follow: true }
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
  };
}
