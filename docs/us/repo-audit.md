# Select Your Sauna US — Repository- und DE-Baseline-Audit

**Ticket:** S-01

**Status:** ACCEPTED

**Prüfdatum:** 2026-09-13

**Repository-Commit:** `aac432595ba89f42d692a50f01ba2a1749a3c5b5`

**Produktionsdomain:** `https://selectyoursauna.com`

## Ergebnis

Der US-Bereich kann in derselben Codebasis umgesetzt werden. Die vorhandene Architektur ist bereits für statische, reviewbare Inhalte ausgelegt und soll nicht durch eine Datenbank, OpenNext oder einen Laufzeit-Feed ersetzt werden. US wird als neuer marktbezogener JSON-Bereich ergänzt. Bestehende DE-IDs, URLs, Inhalte, Angebote und die aktuelle Indexierungsentscheidung bleiben unverändert.

Vor dem ersten US-Route-Code ist ein kleiner Datenvertrag nötig. Das aktuelle DE-Modell bildet nur eine Produktvariante, eine zusammengefasste Stromangabe und numerische Kaufangebote ab. Für US müssen konkrete Konfigurationen, mehrteilige elektrische Anforderungen, unbekannte beziehungsweise konfliktbehaftete Fakten, Quote-Angebote und der genaue Lieferumfang getrennt erfasst werden.

## Tatsächlicher Stack

| Bereich | Festgestellter Stand | Konsequenz für US |
|---|---|---|
| Framework | Next.js 16.3.2, App Router, React 19.2.6, TypeScript 5.9 | Vor Codeänderungen gelten die lokalen Next-16-Dokumente in `node_modules/next/dist/docs/` |
| Rendering | `output: "export"`, `trailingSlash: true`, vollständig statisch | Alle dynamischen US-Pfade benötigen `generateStaticParams`; keine Request-Runtime |
| Build | `npm run build` mit Daten-, Link-, SEO-, Diversitäts-, Security- und Discovery-Prüfungen | US muss in dieselben Gates aufgenommen werden |
| Daten | Versionierte JSON-Dateien unter `data/` und `content/de/` | Neuer Bereich `data/us/` und `content/us/`; keine Laufzeitdatenbank |
| Hosting | Cloudflare Worker mit ausschließlich `[assets] directory = "./out"` | Kein OpenNext-Bundle und kein serverseitiger Worker-Code |
| Deployment | GitHub `main` löst den Cloudflare-Build aus; CI prüft Push und PR | US-Änderungen bleiben reviewbar und atomar deploybar |
| Affiliate-Import | Awin-Feedliste als GitHub-Secret; GitHub Actions schreiben bereinigte Reports/PRs | Bestehende Pipeline erweitern, US-Feeds niemals im Nutzerrequest abrufen |
| Bilder | Next-Image-Optimierung deaktiviert; aktuelle Produktseiten sind überwiegend bildlos | US-Pilot bleibt ohne fremde Produktbilder möglich; Rechte vor Nutzung dokumentieren |
| Analytics | Kein Analytics- oder Marketing-Skript im Client festgestellt | Trackingfreier US-MVP bleibt Standard; Analytics ist kein P0-Zwang |

## Statische Rahmenbedingungen

Die Next.js-16-Dokumentation bestätigt für `output: "export"`:

- Server Components laufen beim Build und liefern statisches HTML.
- Dynamische Routen sind nur mit vollständigen `generateStaticParams`-Listen zulässig.
- Request-basierte Route Handler, Cookies, Server Actions, ISR, Proxy/Middleware, Next-Rewrites und Next-Headers stehen nicht zur Verfügung.
- Redirects und Security-Header werden deshalb wie bisher über `public/_redirects` und `public/_headers` ausgeliefert.
- GET-Route-Handler wie `app/llms.txt/route.ts` sind zulässig, wenn ihre Ausgabe beim Build vollständig statisch ist.

Diese Grenzen schließen eine rein statische US-Umsetzung nicht aus. Sie verhindern lediglich serverseitige Sprache-, Geo-, Auth- oder Feedlogik im öffentlichen Renderpfad.

## Bestehende Routen und Seitengenerierung

| Pfad/Modul | Stand |
|---|---|
| `/` | Statische DE-Startseite; Cloudflare-Redirect `/ → /de/` mit 301 |
| `/de/` | Homepage |
| `/de/produkte/` | Katalog mit clientseitigen Filtern |
| `/de/produkte/{productId}/` | 516 statisch erzeugte Produktseiten |
| `/de/{section}/{slug}/` | 27 kuratierte Collection-/Vergleichsseiten |
| `/de/planung/{slug}/` | 12 statische Planungsratgeber |
| `/de/vergleiche/` | Vergleichsübersicht |
| `/de/rechtliches/`, `/de/ueber-uns/`, `/de/transparenz/affiliate/` | Vertrauens- und Rechtspfad |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/opengraph-image` | Statische Discovery- und Social-Dateien |

## Markttrennung: bestätigte Blocker vor `/us/`

### 1. Dokumentensprache

`app/layout.tsx` setzt global `<html lang="de">`. Eine neue `/us/`-Seite unter demselben Root Layout würde falsches HTML ausliefern. Da ein verschachteltes Layout kein zweites `<html>` setzen darf, benötigt S-03 marktbezogene Root Layouts über Route Groups. Die interne Dateiverschiebung darf die bestehenden öffentlichen `/de/`-URLs nicht ändern.

### 2. Metadaten

`lib/metadata.ts` setzt `openGraph.locale = "de_DE"`, einen deutschen Bild-Alt-Text und bei Artikeln einen `/de/`-Autorenpfad. Das Modul benötigt eine explizite Markt-/Locale-Konfiguration. Canonicals müssen weiterhin aus der Produktionsdomain und dem jeweiligen Marktpfad entstehen.

### 3. Navigation und Seitenkomponenten

`SiteChrome`, Homepage, Katalog, Finder und mehrere Produktmodule enthalten deutsche Labels und feste `/de/`-Links. Gemeinsame Designkomponenten sind wiederverwendbar; Navigation, Wörterbuch, Inhalte und Linkziele müssen explizit nach Markt übergeben werden.

### 4. Produkte und Finder

`lib/products.ts` importiert global `data/products.json`, formatiert ausschließlich mit `de-DE` und modelliert Strom als einzelnen Wert `230`, `400`, `wood` oder `none`. Der bestehende DE-Finder darf nicht erweitert werden, indem US-Semantik in dieselben Felder gepresst wird. US erhält zunächst einen separaten Loader und einen kompatiblen, reicheren Datenvertrag.

### 5. Affiliate-Programme

`lib/affiliate.ts` importiert ausschließlich `content/de/affiliate.json` und globale DE-Produkte. Programmstatus, Händler, erlaubte Hosts, Angebote und ClickRefs müssen marktbezogen ausgewählt werden. Die vorhandenen Schutzregeln bleiben erhalten: nur freigegebenes Programm, aktiver Merchant, passende Program-ID, HTTPS-Link und begrenzte ClickRef-Werte.

### 6. Structured Data und Discovery

Organization-/Website-/Article-Daten sind aktuell auf den DE-Pfad ausgerichtet. Sitemap und `llms.txt` enthalten nur freigegebene DE-Inhalte. US darf erst nach eigenem Publication-Gate aufgenommen werden. `hreflang` wird nur für tatsächliche Äquivalente erzeugt; ähnliche Produkte sind keine Sprachpaare.

## Datenbaseline DE

| Kennzahl | Stand 2026-09-13 |
|---|---:|
| Verifizierte Produkte | 516 |
| Produktfamilien | 47 |
| Indoor | 258 |
| Infrarot | 80 |
| Outdoor | 158 |
| Zelt | 20 |
| Dokumentierte Angebote | 601 |
| Aktive Affiliate-Angebote | 210 |
| Indexierbare Produktseiten | 306 |
| Produktseiten mit `noindex` | 210 |
| Händlerdatensätze | 18 |
| Freigegebene DE-Awin-Programme | 8 |
| Collections/Vergleiche | 27 |
| Planungsratgeber | 12 |

Aktive Affiliate-Angebote nach Händler:

| Händler | Links |
|---|---:|
| Demmelhuber | 92 |
| Home Deluxe | 34 |
| GartenHausFabrik | 20 |
| Saunaloft | 18 |
| Wellness-Point | 17 |
| Artsauna | 15 |
| Benz24 | 11 |
| InterGard | 3 |

## SEO-, GEO- und Indexierungsbaseline

- `data/site-publication.json` aktiviert die kanonische Domain `https://selectyoursauna.com` und die Indexierung.
- Produktindexierung ist unabhängig von Affiliate-Status und folgt `data/product-indexing-policy.json`.
- Der aktuelle Build erzeugt eine einzelne Sitemap; bei der vorhandenen Größenordnung ist kein Sitemap-Index nötig.
- `robots.txt` erlaubt allgemeine Crawler sowie OAI-SearchBot, Claude-SearchBot und PerplexityBot.
- `llms.txt` dokumentiert Kataloggröße, indexierbare Produkte und Evidenzmethodik.
- Produkt-, Collection- und Ratgeberseiten werden auf eindeutige Titel, Beschreibungen, Canonicals, H1, JSON-LD und individuelle Texte geprüft.
- Die Präsentationsdiversität von 27 Collections und 12 Planungsratgebern wird automatisiert geprüft.

US-Erweiterungen müssen dieselben Regeln erfüllen. `llms.txt` ist ein ergänzendes Discovery-Dokument, keine Rankinggarantie. Maßgebliche Antworten und Quellen müssen im normalen statischen HTML stehen.

## Datenschutz- und Consent-Baseline

Der Finder verarbeitet Auswahlen ausschließlich im Browser. Es gibt keine Nutzerkonten, Formulare, Newsletter, clientseitige Analyse oder Marketing-Pixel. Ausgehende Affiliate-Links werden erst durch einen bewussten Klick geöffnet. Cloudflare kann technische Zugriffslogs verarbeiten; GitHub und Awin verarbeiten Build-/Programmdaten außerhalb des Browser-Renderpfads. Die US-Rechtstexte müssen diese tatsächliche Verarbeitung abbilden, ohne ein zusätzliches Consent-System zu erfinden.

## Deployment- und Sicherheitsbaseline

- `wrangler.toml` enthält keinen `main`-Entry und kein Runtime-Bundle.
- `public/_headers` versioniert CSP, HSTS, MIME-, Framing-, Referrer- und Permissions-Policy.
- Die `workers.dev`-Domain erhält `X-Robots-Tag: noindex, nofollow`.
- Affiliate-Feed-Geheimnisse werden nur als GitHub-Secrets verwendet.
- Der Feed-Sync öffnet einen Review-Branch beziehungsweise eine PR und führt vor Veröffentlichung Tests aus.
- US-Preview soll lokal oder als separates Branch-Artefakt erfolgen. Eine öffentlich erreichbare geschützte Preview erfordert Cloudflare Access; ein Build-Flag allein ist keine Authentifizierung.

## Tatsächlich ausgeführte Prüfungen

```text
npm run lint
npm run data:check
npm run awin:test
npm run build
```

Ergebnisse:

- Lint bestanden.
- Zehn Awin-Tests bestanden.
- 516 Produktdatensätze und 210 aktive Affiliate-Links validiert.
- 571 statische Seiten erzeugt.
- 568 statische HTML-Seiten mit 14.933 internen Referenzen geprüft; 0 defekte interne Ziele.
- 565 SEO-Seiten geprüft; 306 indexierbare und 210 `noindex`-Produktseiten.
- Content-Diversität, Security-Header und Discovery-Dateien bestanden.
- Öffentliche DE-Homepage war am 2026-09-13 erreichbar.

## Risiken und Entscheidungen für S-02

1. US-Konfigurationen dürfen nicht in das einfache DE-Power-Feld gezwungen werden.
2. Die 516 DE-Produkte werden nicht auf `Fact<T>` migriert; ein Adapter schützt den Bestand.
3. US-Produkte, Konfigurationen, Quellen, Angebote und Programmbeziehungen erhalten getrennte JSON-Dateien.
4. Quote-only und unbekannte Preise benötigen einen eigenen Angebotszustand statt Preis `0`.
5. Ein deutsches Awin-Publisherkonto ist nicht automatisch für US-Programme zugelassen.
6. Keine Produktbilder im Pilot, solange Nutzungsrechte nicht dokumentiert sind.
7. Root-Redirect bleibt zunächst `/ → /de/`; eine neutrale Marktseite ist kein US-Pilot-Blocker.
8. Analytics bleibt außerhalb von P0.

## S-01-Abnahme

S-01 ist erfüllt. Stack, Routing, Daten, SEO/GEO, Affiliate-Integration, Datenschutzbaseline, Deployment und Prüfkommandos sind mit realen Repository-Befunden dokumentiert. Der nächste technische Schritt ist S-02: ein kleiner additiver US-Datenvertrag mit JSON-Vorlagen und Validatoren. Danach kann Luna 5–8 reale Pilotprodukte in genau diesem Vertrag erfassen.
