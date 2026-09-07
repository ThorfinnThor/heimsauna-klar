# Demmelhuber Live-Abnahme vom 7. September 2026

## Korrekturstand

Die nachstehende Erstprüfung bleibt als Verlauf dokumentiert. Inzwischen wurden alle 28 Kapazitäten mit expliziter Herstellerquelle hinterlegt, zehn Sitzplatz- und 15 Liegeplatzwerte korrigiert und die Schätzlogik aus dem Promotionscript entfernt. Alle 28 Seiten besitzen individuell verfasste redaktionelle Einordnungen. Sahib 1 wird ausdrücklich als abweichendes Angebot einschließlich Energiespartür und Dachkranzmaßen gekennzeichnet. Ava und Tonja bleiben wegen der offenen Paketzuordnung vorerst noindex. Neuer Stand: 303 indexierbare und 212 noindex Produktseiten; 515 Produkte und 208 Affiliate-Angebote insgesamt.

Ergebnis: Technischer Abruf und geprüfte Affiliate-Weiterleitungen funktionieren. Inhaltliche Abnahme noch nicht bestanden. Keine Änderungen an veröffentlichten Produktdaten in diesem Review.

## Umfang und bestandene Prüfungen

- Alle 28 zuletzt ergänzten Produktseiten live abgerufen: HTTP 200, jeweils ein H1, passender Canonical, sichtbarer Affiliate-Link mit sponsored/nofollow.
- Alle 28 Seiten liefern index, follow. Das bestätigt eine Indexierungsfreigabe, keine tatsächliche Aufnahme in Google.
- 92 Demmelhuber-Angebote im Katalog; 11 systematisch über den Bestand verteilte Awin-Weiterleitungen geprüft. Alle erreichen HTTP 200 und die zum gespeicherten Feed gehörende number/SKU.
- Alle 28 Karibu-Produktdokumente heruntergeladen und mit pdfinfo geprüft: jeweils zwei Seiten. Die erste Dateityperkennung von null Seiten war falsch und ist kein Befund.
- Gesamter Bestand unverändert: 515 Produkte, 208 aktive Affiliate-Angebote. Ein Angebot ist nicht gleichbedeutend mit einem eigenständigen Produkt oder einem nachgewiesenen Tracking-Verkauf.

## Befunde vor Freigabe

### P1: Übertragene Personenzahlen wirken als belegte Filterdaten

scripts/promote-demmelhuber-karibu-expansion.mjs übernimmt für 24 neue Produkte die Kapazität einer anderen Kabine mit ähnlichen Außenmaßen. Banklayout, Innenmaß und Sitzbreite werden nicht belegt. Auch seats wird mit dieser Zahl befüllt. Die Beschriftung Planungswert macht daraus keinen konservativ belegten Wert.

lib/products.ts verwendet people.max unverändert im Finder. getMatchReasons gibt die Zahl ohne Planungswert-Hinweis aus. lib/collections.ts verwendet sie auch in personenspezifischen Vergleichen. Erforderlich: Kapazität für das konkrete Modell belegen oder unbekannt abbilden und aus harten Personenfiltern herausnehmen.

### P1: Sahib 1 ist nicht dieselbe Tür-/Dachausführung

karibu-sauna-sahib-1 beschreibt eine grau getönte Glastür und 193 × 184 × 209 cm. Das Demmelhuber-Angebot nennt Energiespartür und Dachkranz; der Quellenbericht nennt einschließlich Dachkranz 221 × 198 × 212 cm. Trotzdem selection_required=false. Türvariante und Maßbezug müssen vor einer identischen Angebotszuordnung geklärt werden.

### P2: Indexierungsfreigabe berücksichtigt Belegqualität nicht ausreichend

Alle 28 neuen Seiten sind indexierbar, darunter die 24 mit übertragener Kapazität. scripts/product-indexing-policy.mjs zählt Quellen und wortgleiche Wiederholungen, prüft aber weder diese Kapazitätsbasis noch inhaltlich gleichartige Satzschablonen. Seiten mit offenen wesentlichen Angaben sollten gezielt zurückgestellt werden.

### P2: Texte erfüllen die individuelle redaktionelle Vorgabe noch nicht

Der Promotionscode erzeugt für den Batch wiederkehrende Vorteile wie die Prüfbarkeit des Grundrisses sowie dieselben Warnungen zu Montageabständen. Die live geprüfte Ava-Seite enthält wörtlich „beschreibt einen konkreten Vorteil“ und „markiert die wichtigste offene Abwägung“. Das ist redaktioneller Metatext statt konkreter Kaufhilfe. Die 28 Texte brauchen modellspezifische Überarbeitung auf Grundlage der tatsächlichen Dokumente.

## Grenzen

Kein Kauf oder Testverkauf durchgeführt. Die elf Weiterleitungsprüfungen belegen die Erreichbarkeit und Varianten-ID, nicht die spätere Provisionsabrechnung. Kein vollständiger visueller Browsertest bei verschiedenen Bildschirmgrößen. Die übrigen Demmelhuber-Angebote wurden anhand der gespeicherten Zuordnung geprüft; abweichende Ofenpakete sind überwiegend als Auswahl erforderlich markiert.

## Nächster Schritt

## Vertiefte Herstellerprüfung nach Icon-Auswahl

Die vollständige Textextraktion der 28 Herstellerdokumente liefert für jedes Modell explizite Sitzplätze und Liegeplätze. Damit sind die übertragenen Kapazitätswerte nicht notwendig. Sitzplätze im Katalog gegenüber Herstellerdokument:

| Modell | Katalog | Hersteller |
| --- | ---: | ---: |
| Quadro 3 | 5 | 4 |
| Mia | 3 | 4 |
| Tabea | 5 | 4 |
| Bodo | 2 | 3 |
| Faurin | 2 | 3 |
| Taurin | 3 | 2 |
| Tonja | 3 | 2 |
| Tromso | 2 | 3 |
| Variado | 3 | 2 |
| Jutta | 5 | 4 |

15 Liegeplatzangaben weichen ebenfalls ab: Quadro 3 (0 → 2), Jada (2 → 1), Bodo (2 → 1), Carin (2 → 1), Faurin (2 → 1), Fiona 1 (2 → 1), Irava 1 (0 → 1), Irava 2 (0 → 1), Larin (2 → 1), Taurin (2 → 1), Tonja (2 → 1), Tromso (2 → 1), Angkor 1 (0 → 2), Ares 3 (0 → 3), Nanja (2 → 1).

Maße und Ofenpakete dürfen nicht pauschal aus den PDFs ersetzt werden. Asta und Nanja haben beim Händler Dachkranzvarianten mit größerem Außenmaß. Das Ava-Dokument nennt einen Bio-Ofen, während die geprüfte Händlerkonfiguration einen 9-kW-Ofen mit Steuergerät benennt. Quellen gelten deshalb jeweils für einzelne Eigenschaften und die dokumentierte Konfiguration.

Die Quellen sind die bei jedem der 28 Produkte bereits hinterlegten offiziellen Karibu-Produktdokumente. Die vorhandenen zwei Seiten wurden jeweils ausgelesen. Es wurden noch keine veröffentlichten Datensätze geändert.

## Umsetzung nach der Abnahme

Bei Sol bleiben: Kapazitätsdaten korrigieren, Sahib-Ausführung auflösen, betroffene Indexierungsfreigaben korrigieren und die neuen Produkttexte einzeln überarbeiten. Danach die veränderten Seiten erneut prüfen. Icon erst nach Auswahl produktiv einbinden.
