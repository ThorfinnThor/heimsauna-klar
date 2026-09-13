# Select Your Sauna US — Architekturentscheidungen

## ADR-US-001: Additiver Marktbereich

**Status:** angenommen

US-Daten liegen unter `data/us/` und `content/us/`. Der bestehende deutsche Datenbestand wird nicht migriert. Diese Entscheidung reduziert das Risiko, 516 veröffentlichte Produktdatensätze und ihre URLs unnötig zu verändern.

## ADR-US-002: Produkte und Angebote trennen

**Status:** angenommen

Ein Produkt beschreibt die redaktionelle Marktidentität, eine Konfiguration die konkrete Ausführung und ein Angebot die Händlerkondition für diese Ausführung. Händler- oder Preisvarianten erhöhen die Produktanzahl nicht künstlich.

## ADR-US-003: Evidenzfähige Fakten

**Status:** angenommen

Technische Fakten erhalten `documented`, `unknown`, `not-applicable` oder `conflict`. Bekannte Werte verweisen auf feldbezogene Evidenz. Das Modell verhindert, dass fehlende Werte als null, falsch oder nicht vorhanden erscheinen.

## ADR-US-004: Mehrteilige Stromversorgung

**Status:** angenommen

Alternative Versorgungen sind getrennte Optionen. Mehrere Anforderungen innerhalb einer Option gelten gemeinsam. Dadurch kann der Finder Hybridprodukte oder getrennte Steuer-/Heizkreise später korrekt behandeln.

## ADR-US-005: Deaktivierter Startzustand

**Status:** angenommen

US-Routen, Indexierung, Affiliate-Ausgabe und Feed-Sync starten deaktiviert. Die Datenvorlagen enthalten keine synthetischen öffentlichen Produkte. Testdaten bleiben ausschließlich im Testcode.

## ADR-US-006: Keine Bildpflicht im Pilot

**Status:** angenommen

Ein Produktbild ist kein Pflichtfeld des technischen Vertrags. Bilder werden erst nach dokumentierter Programmnutzung oder anderer belastbarer Lizenz in `docs/us/rights-register.json` aufgenommen.

## L-01: Vorläufiger US-Teilmarkt

Der erste US-Pilot beschränkt sich auf stationäre Indoor- und Outdoor-Saunakabinen sowie klar getrennte Infrarotkabinen. Saunaöfen, Decken, Zubehör und medizinische beziehungsweise therapeutische Leistungsversprechen werden nicht als Kabinenprodukte in den Finder übernommen. Mobile oder maßgefertigte Angebote können als eigene Produkttypen hinzukommen, wenn Konfiguration, Preisumfang und Liefergebiet belegbar sind.

Vier öffentlich auffindbare Awin-Programme sind als Kandidaten erfasst: Sweat Kingdom Saunas (`125462`), Peak Saunas (US) (`118291`), Sunlighten (`63394`) und JNH Lifestyles (`101557`). Die Profile belegen die Existenz des jeweiligen Programms und dienen der Recherche. Sie belegen nicht, dass das deutsche Publisherkonto zugelassen ist. Das bleibt je Programm ein `needs-account-check`.

## Noch fachlich zu bestätigen

- Luna prüft das Schema an 5–8 realen US-Produkten und dokumentiert fehlende Felder.
- Luna erstellt die Abdeckungsmatrix und Rechteprüfung.
- Der Betreiber bestätigt tatsächliche US-Advertiser-Zulassungen und erforderliche Konto-/Steuerangaben.
- Sol entscheidet nach dem Piloten, ob optionale Felder ergänzt werden müssen; eine generische Vorab-Erweiterung findet nicht statt.
