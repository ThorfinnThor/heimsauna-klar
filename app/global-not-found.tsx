import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Seite nicht gefunden | Select Your Sauna",
  description: "Die angeforderte Seite ist nicht verfügbar.",
};

export default function GlobalNotFound() {
  return (
    <html lang="de">
      <body>
        <main className="not-found-page">
          <p className="eyebrow">404</p>
          <h1>Diese Seite gibt es nicht.</h1>
          <p>
            Möglicherweise wurde die Adresse geändert oder der Link ist nicht mehr
            aktuell.
          </p>
          <Link className="button button-primary" href="/de/">
            Zur Startseite
          </Link>
        </main>
      </body>
    </html>
  );
}
