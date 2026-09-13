import type { Metadata } from "next";
import { getMarketConfig, type MarketCode } from "@/lib/markets";
import { siteUrl } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "article" | "website";
  indexable?: boolean;
  market?: MarketCode;
};

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  indexable = true,
  market: marketCode = "DE",
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
      authors: [{
        name: "Schayan Yousefian",
        url: new URL(
          marketCode === "DE" ? "/de/ueber-uns/#redaktion" : "/us/about/#editorial",
          `${siteUrl}/`,
        ).toString(),
      }],
    } : {}),
    alternates: { canonical: path },
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
