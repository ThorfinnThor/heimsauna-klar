# Select Your Sauna US — Datenvertrag v1

**Ticket:** S-02

**Status:** TECHNICAL REVIEW

**Stand:** 2026-09-13

## Zweck und Grenze

Dieser Vertrag beschreibt den additiven US-Datenbereich. Er ersetzt weder `data/products.json` noch andere bestehende DE-Dateien. Alle US-Daten bleiben versioniertes JSON und werden beim Build geprüft. Die Anwendung ruft im öffentlichen Renderpfad keine Produkt- oder Affiliate-Daten zur Laufzeit ab.

Die eingecheckten US-Dateien sind absichtlich leer und alle vier Publication-Schalter stehen auf `false`. Der Datensatz erzeugt deshalb noch keine öffentliche US-Seite. Reale Produkte werden von Luna recherchiert und zunächst als `candidate` oder `draft` erfasst.

## Dateien

| Datei | Inhalt |
|---|---|
| `data/us/publication.json` | Unabhängige Schalter für Routen, Indexierung, Affiliate-Links und Feed-Sync |
| `data/us/products.json` | Eine redaktionelle US-Produktidentität je tatsächlichem Modell |
| `data/us/configurations.json` | Konkrete Ausführungen, Komponenten, Maße und alternative elektrische Versorgungen |
| `data/us/sources.json` | Quellen und feldbezogene Evidenz |
| `data/us/merchants.json` | Händler beziehungsweise Hersteller mit erlaubten Zielhosts |
| `data/us/programs.json` | Marktbezogene Affiliate-Beziehung, nicht bloß öffentliches Programmprofil |
| `data/us/offers.json` | Händlerangebot für genau eine Konfiguration |
| `data/us/mappings.json` | Geprüfte Zuordnung externer Produktkennungen zu Konfigurationen |
| `content/us/*.json` | Noch nicht veröffentlichte, marktbezogene Inhaltsvorlagen |

Alle Datendateien tragen `schema_version: 1` und `market: "US"`. IDs und Slugs verwenden stabile, kleingeschriebene Kebab-Case-Werte. Eine spätere Änderung der Bedeutung bestehender Felder erfordert eine Schema-Versionserhöhung. Additive optionale Felder dürfen innerhalb von Version 1 ergänzt werden, wenn Validator und Dokumentation gleichzeitig aktualisiert werden.

## Beziehungen

```text
MarketProduct
  └── ProductConfiguration[]
        ├── Component[]
        ├── ElectricalSupplyOption[]
        │     └── ElectricalRequirement[]
        ├── Certification[]
        ├── Warranty[]
        └── Offer[]

Merchant
  └── AffiliateProgram
        └── Offer[]

Source
  └── FieldEvidence[]
        └── Fact references
```

Ein Händlerangebot ist kein zusätzliches Produkt. Ein Angebot muss auf genau eine Konfiguration zeigen. Eine Konfiguration gehört genau zu einem Produkt und wird auch in dessen `configuration_ids` geführt. Eine ähnliche Modellbezeichnung reicht nicht zur globalen DE-/US-Zuordnung.

## Fakten und Datenlücken

Kritische Produkt- und Konfigurationsangaben verwenden einen expliziten Faktenstatus:

```ts
type UsFact<T> =
  | { status: "documented"; value: T; evidence_ids: string[] }
  | { status: "unknown"; reason: string }
  | { status: "not-applicable"; reason: string }
  | { status: "conflict"; evidence_ids: string[]; note: string };
```

`documented` benötigt mindestens eine vorhandene Evidenz-ID. `conflict` benötigt mindestens zwei Evidenzen. `unknown` ist kein Nullwert, keine Schätzung und kein negativer Fakt. Ein fehlender Zertifizierungsnachweis bedeutet beispielsweise „nicht verifiziert“, nicht „nicht zertifiziert“.

Quellen beschreiben das Dokument. `program-terms` belegt Programmbedingungen, während `account-approval` ausschließlich die redigierte Prüfung der tatsächlichen Publisher-Beziehung dokumentiert. Ein Account-Nachweis enthält weder Zugangstoken noch persönliche Login-Daten. `FieldEvidence.entity_id` verweist auf die übergeordnete Produkt-, Konfigurations-, Angebots-, Händler- oder Programm-ID. Das verschachtelte Feld wird mit `field_path` benannt. `raw_value` bewahrt bei Bedarf den Originalwert; `interpretation_note` erklärt nur nachvollziehbare Normalisierung oder Umrechnung. Elektrische Anforderungen, Sicherheitsabstände oder Lieferumfang werden nicht aus anderen Werten abgeleitet.

## Produkt und Konfiguration

`MarketProduct` enthält Marke, Modell, Produkttyp, Wärmeart, Energiequellen, Standort, Bauform, Quellen und Veröffentlichungsstatus. Zubehör, Saunaöfen und Saunadecken bleiben eigene Produkttypen und werden nicht als Kabinen gezählt.

`ProductConfiguration` beschreibt die tatsächlich angebotene US-Ausführung. Außen-, Innen- und Versandmaße bleiben getrennt. Jede Achse trägt ihren ursprünglichen Einheitenwert. Sitz- und Liegekapazität, Netto- und Versandgewicht sowie enthaltene oder ausgeschlossene Komponenten werden nicht zusammengelegt.

Ein Produkt mit `reviewed` oder `published` benötigt:

- mindestens eine zugehörige geprüfte Konfiguration;
- mindestens eine Herstellerseite, Anleitung oder ein Datenblatt als maßgebliche Quelle;
- dokumentierte Kernfelder für die spätere öffentliche Darstellung;
- sichtbare Gründe für weiterhin unbekannte oder widersprüchliche Angaben.

Die letzte semantische Pilotabnahme durch Luna entscheidet, welche Kernfelder für das konkrete Produkt zusätzlich zwingend sind. Der Validator ersetzt diese fachliche Prüfung nicht.

## Elektrische Versorgungen

Eine `ElectricalSupplyOption` ist eine mögliche Versorgungsvariante. Mehrere Optionen werden als ODER behandelt. Alle `requirements` innerhalb einer Option gelten gemeinsam als UND.

Beispiel: Eine Konfiguration kann entweder eine belegte Versorgungsoption A oder B besitzen. Benötigt ein Hybridprodukt innerhalb von A sowohl einen 240-V-Heizkreis als auch einen separaten 120-V-Kreis für Steuerung und Licht, müssen beide Anforderungen in derselben Option stehen. Ein einzelnes passendes Spannungsfeld darf dieses Produkt später nicht als vollständig passend klassifizieren.

Spannung, Frequenz, Phase, Nennleistung, Stromaufnahme, erforderlicher Stromkreis, genannte Sicherung, Anschlussart, Steckertyp und eigener Stromkreis sind eigenständige Fakten. Der Validator akzeptiert dokumentierte Spannungen außerhalb 120/240 V. Die Finder-Vorauswahl ist keine Datensatz-Zulässigkeitsliste und keine Elektrofreigabe.

## Zertifizierung und Garantie

Zertifizierungen beziehen sich auf eine konkrete Konfiguration und enthalten einen Geltungsbereich. Zulässige Bereiche sind Komplettprodukt, Ofen, Steuerung oder Einzelkomponente. Eine Bauteilzertifizierung darf nicht als Zertifizierung der gesamten Sauna ausgegeben werden.

Garantien enthalten Anbieter, belegte Zusammenfassung und Quellen. Hersteller- und Händlergarantien werden nicht stillschweigend zusammengeführt. Freitext darf keine weitergehende Laufzeit oder US-Geltung behaupten als die Quelle.

## Händler, Programme und Angebote

Der Händlerdatensatz begrenzt direkte Ziel-URLs auf `allowed_hosts`. Ein Programm gehört zu genau einem Händler. `relationship_status: "approved"` wird erst nach belegter Freigabe des tatsächlichen Publisherkontos gesetzt. Ein öffentlich auffindbares Awin-Profil genügt dafür nicht. Der Validator verlangt für `approved` eine `account-approval`-Quelle, ein Datum der Bedingungsprüfung und mindestens eine bestätigte zulässige Promotionsart.

Ein Angebot enthält:

- Produkt-, Konfigurations- und Händlerbezug;
- Direktziel und optional eine Affiliate-URL;
- Preisart und Preisumfang;
- enthaltene sowie erforderliche, aber ausgeschlossene Komponenten;
- Zustand, Verfügbarkeit, Steuer- und Lieferstatus;
- tatsächlichen letzten erfolgreichen Prüfzeitpunkt;
- Verifikationsmethode und Promotion-Status.

`fixed-price` und `from-price` benötigen einen positiven Preis in USD-Cents. `quote-only` darf keinen Preis enthalten und wird später nicht als null Dollar sortiert. Die Affiliate-URL ist nur bei einer belegten `approved`-Programmbeziehung zulässig. Ein `eligible`-Angebot benötigt ebenfalls diese Freigabe. Der globale Schalter entscheidet zusätzlich, ob solche Links öffentlich ausgegeben werden.

## Publication-Gates

```json
{
  "routes_enabled": false,
  "indexing_enabled": false,
  "affiliate_links_enabled": false,
  "feed_sync_enabled": false
}
```

Die Schalter sind unabhängig. Indexierung und Affiliate-Ausgabe können nicht aktiv sein, solange Routen deaktiviert sind. Sichere Umgebungsvariablen dürfen künftig nur weiter einschränken. Sie dürfen keinen in JSON deaktivierten Zustand aktivieren.

Die vorgesehenen Stufen sind:

1. Daten und Inhalte als `candidate` oder `draft` prüfen.
2. US-Routen technisch aktivieren, aber mit `noindex` und ohne Affiliate-Ausgabe testen.
3. Affiliate-Links nach realer Programmbestätigung separat freigeben.
4. Indexierung erst nach Content-, SEO-, Rechts- und Live-Abnahme aktivieren.

## Validator und Abnahme

`npm run us:data:check` prüft die eingecheckten Dateien. `npm run us:test` prüft den Validator gegen positive und negative Fälle. `npm run data:check` ruft den US-Check zusätzlich zur bestehenden DE-Prüfung auf.

Blockierende Fehler umfassen insbesondere:

- doppelte oder ungültige IDs und Slugs;
- fehlende Referenzen zwischen Produkt, Konfiguration, Angebot, Händler und Programm;
- dokumentierte Fakten ohne Evidenz;
- falscher Markt oder EUR-Preis in einem US-Angebot;
- Quote-Angebot mit fingiertem Zahlenpreis;
- Zielhost außerhalb der Händler-Allowlist;
- Affiliate-URL oder `eligible`-Status ohne freigegebene Beziehung;
- Angebot an einer Konfiguration eines anderen Produkts;
- aktivierte Indexierung oder Affiliate-Ausgabe bei deaktivierten Routen.

Die technische Abnahme ist erst vollständig, nachdem Luna reale US-Pilotfälle in diesem Schema erfasst und die fachliche Passung bestätigt hat. Bis dahin bleibt S-02 im Status `TECHNICAL REVIEW` und alle öffentlichen Schalter bleiben aus.
