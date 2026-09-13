# Select Your Sauna US — Pfad- und Änderungslandkarte

**Ticket:** S-01

**Stand:** 2026-09-13

**Ziel:** Additive US-Erweiterung ohne Änderung bestehender öffentlicher DE-URLs

## Leitentscheidung

Die US-Sektion wird in der vorhandenen Next.js-Anwendung statisch erzeugt. Gemeinsame Designkomponenten dürfen geteilt werden. Marktdaten, Navigation, Texte, Metadaten, Angebote, Finderregeln und Publication-Gates bleiben explizit getrennt.

## Bestehende Pfade

| Aktueller Pfad | Verantwortung | US-Auswirkung |
|---|---|---|
| `next.config.ts` | Statischer Export, Trailing Slash, Bildmodus, Offer-Datum | Beibehalten; keine OpenNext-Konfiguration |
| `wrangler.toml` | Cloudflare Static Assets | Beibehalten; US liegt ebenfalls in `out/` |
| `app/layout.tsx` | Globales DE-HTML, globale strukturierte Daten | Vor `/us/` in marktbezogene Root Layouts aufteilen |
| `app/de/**` | Sämtliche DE-Routen | Öffentliche URLs unverändert erhalten |
| `app/_components/**` | Geteilte DE-Komponenten | Nur abstrahieren, wenn Markt/Copy/Links als Parameter klar werden |
| `lib/products.ts` | DE-Produktmodell, Filter, Formatierung | DE stabil lassen; US-Loader separat beginnen |
| `lib/affiliate.ts` | DE-Programme, Links, ClickRefs | Link-Kern wiederverwenden, Programmauswahl marktbezogen machen |
| `lib/metadata.ts` | DE-Locale und Social-Metadaten | Marktparameter ergänzen |
| `lib/structured-data.ts` | Organisation, Artikel, Produktdaten | Markt-, URL-, Sprache- und Offer-Eingaben explizit machen |
| `app/sitemap.ts` | Eine statische DE-Sitemap | Freigegebene US-URLs additiv aufnehmen |
| `app/robots.ts` | Globales Indexierungs-Gate | Beibehalten; US-Seitengates zusätzlich in Metadata/Sitemap |
| `app/llms.txt/route.ts` | Statisches Discovery-Dokument | US-Abschnitt erst nach Publication-Gate ergänzen |
| `data/products.json` | 516 DE-Produkte | Nicht migrieren oder umschreiben |
| `data/merchants.json` | DE-Händler und Programmstatus | Nicht mit US-Beziehungen vermischen |
| `content/de/**` | DE-Editorial, Legal, Affiliate, Präsentationen | Unverändert; US erhält eigene Dateien |
| `scripts/validate-data.mjs` | Zentrale DE-Datenprüfung | US-Validator separat aufrufen, später gemeinsame Invarianten teilen |
| `scripts/awin/**` | DE-Feed-Discovery und Sync | Marktparameter und US-Allowlist erst nach Accountfreigabe ergänzen |
| `.github/workflows/**awin**` | Manuelle Awin-Imports und Review-PR | US zunächst eigener Workflow/Marktinput, keine automatische Publikation |
| `public/_redirects` | Root-Redirect auf `/de/` | Für Pilot unverändert |
| `public/_headers` | Security- und Preview-Indexierungsregeln | US erbt dieselben statischen Header |

## Vorgesehene neue Datenpfade in S-02

```text
data/us/
  publication.json
  products.json
  configurations.json
  sources.json
  merchants.json
  programs.json
  offers.json
  mappings.json

content/us/
  navigation.json
  home.json
  affiliate.json
  legal.json
  page-presentations.json

docs/us/
  data-contract.md
  decisions.md
  coverage-matrix.json
  rights-register.json
  merchant-programs.md
  qa/
```

S-02 legt nur leere Vorlagen beziehungsweise klar als Fixture gekennzeichnete Testdaten an. Es werden keine erfundenen Produkte öffentlich gebaut.

## Vorgesehene Codepfade nach S-02

```text
lib/markets.ts                       Markt- und Locale-Konfiguration
lib/us/catalog.ts                    US-Loader und Beziehungen
lib/us/validation.ts                 Typen und reine Validierungsfunktionen
scripts/us/validate-data.mjs         JSON-Eingangsprüfung
scripts/us/check-market-isolation.mjs
```

Die endgültigen Namen werden in S-02 anhand minimaler Komplexität festgelegt. Kein generisches Framework bauen, bevor der reale Pilot den Bedarf bestätigt.

## Route-Plan für S-03 bis S-11

Das globale `lang="de"` verhindert eine korrekte additive `/us/`-Route unter dem heutigen Root Layout. Empfohlene Struktur:

```text
app/
  (de)/
    layout.tsx                       <html lang="de">
    page.tsx                         bestehende Root-Ausgabe; Redirect bleibt extern
    de/**                            bestehende DE-Routen, URLs unverändert
  (us)/
    layout.tsx                       <html lang="en-US">
    us/
      page.tsx
      saunas/page.tsx
      saunas/[productId]/page.tsx
      sauna-finder/page.tsx
      compare/page.tsx
      compare/[slug]/page.tsx
      guides/page.tsx
      guides/[slug]/page.tsx
      brands/page.tsx
      brands/[slug]/page.tsx
      about/page.tsx
      methodology/page.tsx
      affiliate-disclosure/page.tsx
      privacy/page.tsx
      contact/page.tsx
```

Route Groups erscheinen nicht in der URL. Die Verschiebung bestehender Dateien wird in einem eigenen Commit mit vollständiger DE-Regression durchgeführt. Alternativen, die `lang` erst clientseitig ändern, werden wegen falschem statischem HTML und SEO nicht verwendet.

## Reihenfolge

1. **S-02:** Datenvertrag, JSON-Vorlagen, Validatoren und Publication-Gates.
2. **L-01/L-02:** US-Scope und echte Programm-/Account-Dossiers.
3. **L-03 bis L-05:** 5–8 reale Produkte, Quellen, Angebote und Rechte im neuen Vertrag.
4. **S-03:** Route-Group-Aufteilung und marktbezogene Metadaten ohne öffentliche US-Indexierung.
5. **S-05 bis S-10:** Pilotimport, Katalog, Produktseite und Finder.
6. **L-06:** Fachliche Abnahme des gesamten Piloten.
7. Erst danach Katalog- und Contentausbau.

## Nicht Teil der ersten Umsetzung

- Datenbank oder CMS
- OpenNext oder Worker-Runtime-Code
- Server Actions, Cookies oder IP-/Sprachumleitung
- Clientseitiges Analytics
- Automatischer Revenue-Import
- Öffentliche US-Pagination bei nur 5–30 Produkten
- Getrennte Sitemap-Dateien ohne Größenbedarf
- Produktbilder ohne dokumentierte Nutzungsrechte
- Root-Umbau zu einer neutralen Marktseite
