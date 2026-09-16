# US-Katalog Batch 4: Harvia

**Prüfdatum:** 16.09.2026  
**Umfang:** 14 neue US-Forschungsdatensätze

## Ergebnis

Der US-Katalog umfasst jetzt 215 Produkte und 215 zugeordnete Konfigurationen. Der Harvia-Batch enthält elf Sauna-Kabinen beziehungsweise Saunen und drei Saunaöfen. Alle 14 Einträge sind als `candidate` hinterlegt. Sie erscheinen deshalb weder im öffentlichen Produktkatalog noch als bestätigte Finder-Treffer und erzeugen keine Affiliate-Links.

Der öffentliche Stand bleibt bei 23 geprüften Produktseiten und 13 aktiven Sweat-Kingdom-Angeboten. 192 Datensätze warten auf technische Einzelprüfung.

## Quellen und Abgrenzung

Die Modellidentität wurde anhand der offiziellen Harvia-US-Produktseiten geprüft. Aufgenommen wurden unter anderem Legend, Solide, Variant, Polaris, Block, Alaska, Fenix und Ventura sowie die Heizermodelle Concept R, Virta Wall und Legend PO70FC. Jede Quelle ist im Datenbestand mit der konkreten Produktseite verknüpft.

Nicht belegte Felder bleiben ausdrücklich unbekannt. Dazu gehören unter anderem vollständige Sitzkapazität, standardisierte Netzspannung, Leistung, Stromkreis, Lieferumfang, Versanddaten und Montageabstände, soweit sie nicht für den einzelnen Katalogeintrag eindeutig normalisiert wurden. Preise, Bewertungen, Testergebnisse und Herstellerbilder wurden nicht ergänzt. Bildrechte stehen weiterhin auf `not-requested`.

## Technische Prüfung

- `npm run us:data:check` erfolgreich: 215 Produkte, 215 Konfigurationen, 13 Angebote, 0 Warnungen.
- `npm run us:test` erfolgreich: 129 von 129 Tests.
- `npm run us:indexing:plan:check` erfolgreich; die Veröffentlichung bleibt auf den geprüften ersten US-Stand begrenzt.
- Der Release-Snapshot wurde auf 215 Forschungsdatensätze, 192 Kandidaten und 23 veröffentlichte Produkte aktualisiert.

Der nächste Schritt ist die technische Vertiefung ausgewählter Harvia-Modelle oder ein weiterer Hersteller-Batch. Eine Veröffentlichung erfolgt erst nach belegten Spezifikationen und redaktioneller Prüfung.
