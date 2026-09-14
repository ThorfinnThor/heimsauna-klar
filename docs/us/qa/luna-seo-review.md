# Luna fachlicher SEO-/GEO-Review

Reviewdatum: 2026-09-14
Scope: US-Pilotinhalte, Quellenbeziehungen, Seitenintention, Indexierungs-Auswahl und DE-/US-Äquivalenz

## Ergebnis

Die US-Inhalte sind als fachliche Research-Preview konsistent, aber noch nicht als öffentliche US-Sektion freigegeben. Alle drei redaktionellen Seiten, die Startseite und die Kontaktseite stehen im JSON weiterhin auf `draft`. Die US-Publikationsschalter, Indexierung, Affiliate-Ausgabe und Feed-Synchronisierung bleiben deaktiviert.

Es wurde keine `hreflang`-Gruppe freigegeben. Die Seiten sind keine Übersetzungen der bestehenden deutschen Seiten. Sie verwenden eigene US-Konfigurationen, andere elektrische Bezugsgrößen und ein eigenes Quellenregister. Eine Navigation zum jeweils anderen Markt wäre nur ein Fallback-Link und keine Äquivalenz.

## Suchintention und Seitenauswahl

| Seite | Erwartete Frage | Fachliche Abdeckung | Entscheidung |
| --- | --- | --- | --- |
| `/us/` | Welche US-Saunen werden untersucht und wie werden Angaben eingeordnet? | Marktumfang, Datenmethode, offene Grenzen und nächste Recherchepfade | Als Preview behalten; erst nach Veröffentlichung der zugrunde liegenden Inhalte indexieren |
| `/us/saunas/` | Welche dokumentierten Modelle kann ich im US-Markt vergleichen? | Konfiguration, Maße, Kapazität und elektrische Felder mit sichtbaren Lücken | Indexierbar erst bei veröffentlichten US-Produkten und Konfigurationen |
| `/us/compare/indoor-infrared-saunas/` | Welche dokumentierten Indoor-Infrarotkabinen unterscheiden sich bei Platz und Strom? | Explizite Auswahlregel, fünf belegte Datensätze, Matrix und Quellen | Inhaltlich plausibel; keine Rangliste und keine Kaufbehauptung |
| `/us/brands/jnh-lifestyles/` | Welche JNH-Konfigurationen sind im Research-Set enthalten? | Vier konkrete Konfigurationen, Trennung von Indoor/Outdoor und elektrische Daten | Inhaltlich plausibel; keine vollständige Markenabdeckung behauptet |
| `/us/guides/infrared-sauna-electrical-requirements/` | Was muss ich bei 120 V außer der Spannung prüfen? | Stromkreis, Anschluss, Stecker, dedicated circuit und offene Werte | Inhaltlich plausibel; ersetzt keine Installationsfreigabe |
| `/us/saunas/{slug}/` | Welche Fakten und Lücken gehören zu diesem Modell? | Konfiguration, Quellen, Datenlücken, Angebote nur bei Freigabe | Erst nach Produkt- und Konfigurationsfreigabe indexieren |
| `/us/sauna-finder/` | Welche Datensätze passen zu meinen Projektgrenzen? | Interaktive Filterung und getrennte Prüfzustände | `noindex, follow`, kein Suchlandungsziel |

Die Präsentationen sind absichtlich verschieden. Die Vergleichsseite führt über eine Auswahlmatrix, die Markenseite über Profil und Konfigurationskarten, der Ratgeber über eine fachliche Einordnung. Es gibt keinen gemeinsamen Einleitung-, Vorteile-, FAQ- oder Fazitautomatismus.

## Quellen- und Claimprüfung

- Die redaktionellen Seiten verweisen auf die jeweils verwendeten Hersteller- und Programmdokumente aus `data/us/sources.json`.
- Die Zahlen fünf, vier und die Pilotabdeckung beziehen sich auf die tatsächlich im JSON vorhandenen Produkt-/Konfigurationsdatensätze.
- Es werden keine eigenen Tests, Rankings, Zertifizierungen, Lieferzusagen, Bewertungen oder Heilversprechen behauptet.
- Unbekannte Stromkreis-, Freiraum-, Versand-, Zertifizierungs- und Angebotsdaten bleiben als offene Datenlücken sichtbar.
- Die Quellen belegen die Recherchebasis. Sie belegen nicht automatisch eine Publisher-Freigabe im Awin-Konto.

## Vor einer öffentlichen US-Freigabe offen

1. Mindestens ein ausreichender veröffentlichter US-Katalog mit geprüften Konfigurationen und ausreichender Abdeckung.
2. Prüfen und dokumentieren, ob US-Advertiser, Liefergebiet, Preise und Affiliate-Rechte tatsächlich für das Publisherkonto gelten.
3. Rechtliche US-Seiten und Kontaktprozess veröffentlichen und fachlich freigeben.
4. Für jede spätere `hreflang`-Gruppe denselben Suchintent, dieselbe Entität und eine echte gegenseitige Übersetzung nachweisen.
5. Erst danach die Publication-Schalter schrittweise öffnen und den technischen S-12-Crawl erneut ausführen.

## Freigabe

L-14 ist fachlich als **keine Äquivalenzen freigegeben, Inhalte als Research-Preview plausibel** abgeschlossen. Das ist keine Betreiberfreigabe für Produktion und keine Aussage, dass der US-Markt bereits ausreichend abgedeckt ist.
