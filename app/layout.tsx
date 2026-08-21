import type { Metadata } from "next";
import { StructuredData } from "@/app/_components/StructuredData";
import { isIndexingEnabled, siteUrl } from "@/lib/site";
import { websiteJsonLd } from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Heimsauna Klar — die passende Sauna für dein Zuhause",
    template: "%s | Heimsauna Klar",
  },
  description:
    "Unabhängige Planungshilfe für Heimsaunen: nach Platz, Stromanschluss, Budget und Nutzungsprofil.",
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
        <StructuredData data={websiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
