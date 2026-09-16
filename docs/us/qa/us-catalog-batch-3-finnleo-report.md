# US-Katalog Batch 3: Finnleo

**Prüfdatum:** 16.09.2026  
**Umfang:** 43 neue US-Forschungsdatensätze

## Ergebnis

Der Katalog umfasst jetzt 201 Produkte und 201 zugeordnete Konfigurationen. Der Finnleo-Batch enthält 36 Sauna-Kabinen beziehungsweise Modelle und sieben Saunaöfen. Alle 43 Einträge sind als `candidate` hinterlegt. Damit erscheinen sie weder im öffentlichen Produktkatalog noch im Finder als bestätigte Treffer und erzeugen keine Affiliate-Links.

Der öffentliche US-Stand bleibt unverändert bei 23 geprüften Produktseiten und 13 aktiven Sweat-Kingdom-Angeboten. Insgesamt bleiben 178 Datensätze für die technische Einzelprüfung offen.

## Quellen und Abgrenzung

Die Modellidentität wurde ausschließlich anhand der offiziellen Finnleo-US-Produktseiten geprüft. Die Quellen liegen jeweils unter `https://www.finnleo.com/products/{handle}` und sind mit dem konkreten Produkt verknüpft. Ergänzt wurden unter anderem Euro- und NorthStar-Modelle, Hallmark, InfraSauna, S-Serie, Custom-Saunen sowie die Finnleo-Heizer Designer-B, Designer-SL2, Himalaya, Karhu 20 Home, Laava, Magma und Saga 22.

Für die neuen Datensätze wurden nicht belegte Felder bewusst als unbekannt markiert. Dazu zählen insbesondere vollständige Außen- und Innenmaße, Sitzkapazität, Netzspannung, Leistung, Stromkreis, Lieferumfang, Versanddaten und Montageabstände. Es wurden keine Preise, Bewertungen, Testergebnisse oder Herstellerbilder ergänzt. Bildrechte bleiben auf `not-requested`, bis eine ausdrückliche Lizenz oder ein zulässiger Feed vorliegt.

## Technische Prüfung

- `npm run us:data:check` erfolgreich: 201 Produkte, 201 Konfigurationen, 13 Angebote, 0 Warnungen.
- `npm run us:test` erfolgreich: 129 von 129 Tests.
- `npm run us:indexing:plan:check` erfolgreich; die Indexierung bleibt auf den geprüften ersten Veröffentlichungsstand begrenzt.
- Der Release-Snapshot wurde auf 201 Forschungsdatensätze, 178 Kandidaten und 23 veröffentlichte Produkte aktualisiert.

Der nächste sinnvolle Schritt ist die technische Einzelprüfung der wertvollsten Finnleo-Kandidaten. Erst nach belegten Daten und redaktioneller Prüfung dürfen einzelne Modelle in die öffentliche US-Auswahl aufgenommen werden.
