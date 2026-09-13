# US-Pilot: offene Freigaben

**Stand:** 13. September 2026  
**Scope:** sechs recherchierte Modelle in `data/us/`

Die Produktdaten sind als `candidate` erfasst. Sie sind nicht veröffentlicht und werden nicht als Affiliate-Angebote ausgegeben.

## Was noch fehlt

- Die vier öffentlichen Awin-Profile belegen keine Annahme unseres deutschen Publisherkontos. Für Peak Saunas, JNH Lifestyles, Sweat Kingdom und Sunlighten fehlt ein Konto- oder Advertiser-Nachweis.
- Für die sechs Pilotmodelle liegen keine bestätigten Awin-Feed-IDs, Tracking-Hosts oder Deeplink-Ziele aus unserem Publisherkonto vor. Deshalb gibt es in `data/us/offers.json` weiterhin null Angebote und keine `affiliate_url`.
- Produktbilder sind in `docs/us/rights-register.json` mit `not-requested` geführt. Herstellerseiten sind Quellen für technische Fakten, aber keine Bildlizenz.
- Versandmaße, Mindestabstände, SKU, Frequenz, Phase und teilweise Anschlussdetails bleiben je Modell `unknown`, wenn die geprüfte Produktseite sie nicht nennt.

## Nächster sicherer Schritt

1. Im Awin-Publisherkonto je Advertiser die tatsächliche Beziehung, Feed-/Deeplinkstatus, Zielhost und Promotionregeln prüfen.
2. Die zugehörigen Produktfeed-IDs und erlaubten Bildrechte redigiert dokumentieren.
3. Erst danach konkrete Angebote und Affiliate-URLs auf Konfigurationsebene mappen und mit einem einzelnen Pilotlink testen.

Bis dahin bleiben `routes_enabled`, `indexing_enabled`, `affiliate_links_enabled` und `feed_sync_enabled` in `data/us/publication.json` deaktiviert.
