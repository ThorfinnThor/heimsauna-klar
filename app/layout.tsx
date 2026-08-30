import type { Metadata } from "next";
import { StructuredData } from "@/app/_components/StructuredData";
import { isIndexingEnabled, siteUrl } from "@/lib/site";
import { editorialAuthorJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Select Your Sauna — die passende Sauna für dein Zuhause",
    template: "%s | Select Your Sauna",
  },
  description:
    "Unabhängige Planungshilfe für Heimsaunen: nach Platz, Stromanschluss, Budget und Nutzungsprofil.",
  creator: "Schayan Yousefian",
  publisher: "SeitenHafen361",
  robots: isIndexingEnabled ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <StructuredData data={organizationJsonLd()} />
        <StructuredData data={editorialAuthorJsonLd()} />
        <StructuredData data={websiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
