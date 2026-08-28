import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "article" | "website";
};

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = new URL(path, `${siteUrl}/`).toString();
  const socialTitle = `${title} | Select Your Sauna`;
  const socialImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "Select Your Sauna – Planungshilfe für private Saunen",
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "de_DE",
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
  };
}
