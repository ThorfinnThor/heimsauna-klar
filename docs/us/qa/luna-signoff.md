# US fachliche Go-/No-go-Empfehlung

**Reviewdatum:** 14. September 2026  
**Ticket:** L-16
**Scope:** geschützter US-Research-Pilot, nicht öffentliche Produktion

## Entscheidung

**NO-GO für öffentliche US-Veröffentlichung und US-Affiliate-Launch.**

Die Research-Preview ist in Datenbeziehungen, Quellenführung, Seitenstruktur, SEO-Schutz und technischen Gates konsistent. Die Voraussetzungen für eine öffentliche Veröffentlichung sind jedoch nicht vollständig nachgewiesen. Diese Entscheidung ist eine fachliche Empfehlung und keine Betreiberfreigabe.

## Geprüfter Stand

| Bereich | Stand | Bewertung |
| --- | --- | --- |
| Katalog | 100 Kandidaten, 100 Konfigurationen, 56 Quellen und 200 Evidenzdatensätze | Für geschützte Recherche ausreichend, noch nicht veröffentlicht |
| Produktidentität | Jede Konfiguration ist genau einem Produkt zugeordnet | Bestanden |
| Quellen und Claims | Keine erfundenen Werte, Rankings, Tests oder Verfügbarkeitszusagen | Bestanden mit offenen Datenlücken |
| Affiliate-Programme | 4 Awin-Profile, alle `needs-account-check` | Blocker |
| Affiliate-Angebote | 0 Angebote, 0 Affiliate-URLs, 0 freigegebene Tracking-Hosts | Blocker für Affiliate-Launch |
| Bildrechte | 10 Einträge, alle `not-requested` | Blocker für Bildnutzung |
| Recht und Betreiberfreigabe | Trust-Seiten technisch integriert, Produktionsstatus noch nicht freigegeben | Blocker |
| Indexierung | 0 US-Routen discoverable; alle Schalter deaktiviert | Sicherheitszustand korrekt |
| Technische Ausführung | 119 US-Tests, geschützter Preview mit 114 Routen, Build sowie Link-, SEO-, Diversity- und Security-Gates grün | Bestanden |

## Luna-Datenpflege in diesem Batch

Sieben bislang nur über Sammelseiten belegte Kandidaten wurden mit offiziellen Modellseiten abgeglichen. Für Redwood Outdoors wurden Extra-Wide Outdoor Barrel Sauna with Porch 6 Person, Barrel Outdoor Sauna 8 Person und Noctra Outdoor Sauna 8 Person ergänzt. Für SaunaLife wurden die Modelle E8, E8W, E8G und CL7G mit Modellmaßen, Versandmaßen, Gewicht und den jeweils genannten Materialien ergänzt. Bei den drei Redwood-Modellen wurden außerdem die dokumentierte traditionelle Ausführung, elektrische Energiequelle sowie die auf der Produktseite genannte 240-V-Heizeroption erfasst. Heizungsvarianten, Stromkreisdetails und Installationsabstände, die die Quellen nicht eindeutig festlegen, bleiben offen. Der Finder liefert für die geprüfte Kombination Außenbereich, mindestens sechs Personen und 240 V nun 11 bekannte Treffer, 26 Kandidaten zur Prüfung und 63 Ausschlüsse.

## Nicht freigegebener Umfang

Die folgenden Aussagen dürfen aus diesem Signoff nicht abgeleitet werden:

- keine Bestätigung, dass das Publisherkonto 3037577 für einen US-Advertiser angenommen wurde;
- keine Bestätigung eines aktuellen US-Preises, einer Lieferbarkeit oder eines Deeplinks;
- keine Bildlizenz und keine Nutzungserlaubnis für Hersteller-Assets;
- keine Installations- oder Elektrofreigabe für ein konkretes Modell;
- kein Live-Klick-, Checkout- oder Conversion-Test;
- keine Freigabe von `routes_enabled`, `indexing_enabled`, `affiliate_links_enabled` oder `feed_sync_enabled`.

## Bedingungen für eine spätere Go-Empfehlung

1. Für jeden geplanten Advertiser liegt eine datierte Awin-Kontoannahme für Publisher 3037577 vor.
2. Promotionarten, Feed-/Deeplinkstatus, Tracking-Host, Advertiser-ID und zulässige Zielregion sind dokumentiert.
3. Mindestens ein exaktes Produktangebot ist einer bekannten Konfiguration zugeordnet und mit einer gültigen Awin-URL belegt.
4. Preis-, Verfügbarkeits-, Versand- und Bildrechte sind für dieses Angebot aktuell und nachvollziehbar.
5. O-03/S-18 wird durch den Betreiber beziehungsweise die zuständige rechtliche Prüfung freigegeben.
6. Sol prüft den neuen Snapshot technisch, die Veröffentlichung wird durch O-04 autorisiert und S-24 führt den Live-Smoke-Test durch.

## Nachweise

- L-11: `docs/us/qa/content-review.md`
- L-12: `docs/us/qa/luna-preview-review.md`
- L-13: `docs/us/qa/affiliate-tracking-report.md`
- L-14: `docs/us/qa/luna-seo-review.md`
- S-22: `docs/us/qa/sol-signoff.md`
- S-23: `docs/us/release-runbook.md`
- Technischer Stand: GitHub-CI-Run `34846172358`

**L-16 ist damit fachlich abgeschlossen: Research-Preview akzeptiert, Produktionsfreigabe und US-Affiliate-Launch abgelehnt, bis die genannten Bedingungen erfüllt sind. Der nächste Schritt ist eine separate Sol-Abnahme dieses Daten-Snapshots.**
