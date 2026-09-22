import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "404 | Select Your Sauna",
  description: "The requested page is not available. Die angeforderte Seite ist nicht verfügbar.",
};

export default function GlobalNotFound() {
  return (
    <html lang="de" data-market="DE">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { const isUs = location.pathname === "/us" || location.pathname.startsWith("/us/"); const root = document.documentElement; root.dataset.market = isUs ? "US" : "DE"; root.lang = isUs ? "en-US" : "de"; document.title = isUs ? "Page not found | Select Your Sauna" : "Seite nicht gefunden | Select Your Sauna"; })();`,
          }}
        />
      </head>
      <body>
        <main className="not-found-page not-found-copy" data-market="DE">
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
        <main className="not-found-page not-found-copy" data-market="US">
          <p className="eyebrow">404</p>
          <h1>This page does not exist.</h1>
          <p>The address may have changed, or the link may no longer be current.</p>
          <Link className="button button-primary" href="/us/">
            Return to the US home page
          </Link>
        </main>
      </body>
    </html>
  );
}
