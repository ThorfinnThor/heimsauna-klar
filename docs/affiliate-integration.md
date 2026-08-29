# Affiliate-Integration

Select Your Sauna übernimmt das Freigabemodell von PassendPlanen, bleibt aber vollständig statisch. Ein Händlerlink wird nur als Affiliate-Link ausgegeben, wenn alle drei Ebenen aktiv sind:

1. Das Partnerprogramm in `content/de/affiliate.json` hat den Status `approved` und enthält die erlaubten Tracking-Domains.
2. Der Händler in `data/merchants.json` hat den Affiliate-Status `active` und verweist auf genau dieses Programm.
3. Das konkrete Angebot in `data/products.json` besitzt `affiliate: true`, dieselbe `affiliate_program_id` und einen geprüften `affiliate_url`.

Solange eine Ebene fehlt, verwendet die Website weiterhin die normale URL aus `offer.url`. Diese direkten Händlerlinks erhalten keine zusätzliche Affiliate-Kennzeichnung; nur tatsächlich vergütete Links werden am konkreten Link als „Affiliate-Link“ ausgewiesen.

## Tracking-Referenzen

- Awin: `clickref=sauna`, `clickref2=product-detail` und eine gekürzte Produkt-ID in `clickref3`.
- ADCELL: `subId=product-detail|<produkt-id>`.
- Es werden keine E-Mail-Adressen, Nutzerkennungen, Suchbegriffe oder Finder-Eingaben übertragen.

## Awin-Produktfeeds

Artsauna und Home Deluxe werden über die von Awin bereitgestellte Feed-Liste synchronisiert. Die authentifizierte Feed-List-URL liegt ausschließlich im Repository-Secret `AWIN_FEED_LIST_URL`. Der Import:

1. berücksichtigt nur freigeschaltete deutschsprachige Awin-Feeds,
2. wählt je Advertiser deterministisch den aktuellsten Feed,
3. akzeptiert Feed-Downloads nur von bekannten Awin-Domains,
4. aktiviert nur Angebote, deren Händler-Produkt-URL exakt mit einer bereits redaktionell geprüften Katalog-URL übereinstimmt,
5. übernimmt ausschließlich den Awin-Trackinglink; technische Produktdaten, Preise und Quellen werden nicht ungeprüft überschrieben.

Unscharfe Produktnamen, Modellähnlichkeiten und nicht eindeutige URLs landen nur im bereinigten Sync-Bericht. Feed-URLs und Zugangstoken werden weder in Berichten noch im Repository gespeichert.

Der manuelle Workflow `Sync approved Awin affiliate offers` führt vor einem Commit die Feed-Tests, den Datencheck und den vollständigen statischen Build aus. Eine automatische Zeitplanung wird erst nach einem erfolgreichen Erstlauf aktiviert.

## Benötigte Angaben nach einer Freigabe

Für jedes freigeschaltete Programm werden benötigt:

- Netzwerk und Advertiser- beziehungsweise Programm-ID
- Status der Bewerbung
- erlaubte Tracking-Domain
- bei Awin: die geschützte Feed-Liste; Trackinglink und unveränderte Händler-URL werden daraus gemeinsam gelesen
- bei Netzwerken ohne Produktfeed: der erzeugte Deeplink und die unveränderte Ziel-URL zum Gegencheck

Trackinglinks dürfen direkt im Repository stehen, weil sie im ausgelieferten HTML ohnehin öffentlich sichtbar sind. API-Schlüssel, Feed-Listen-URLs und Zugangsdaten gehören dagegen ausschließlich in GitHub Secrets.

## Aktivierung

Nach dem Eintragen der freigegebenen Deeplinks müssen `npm run data:check`, `npm run build` und eine Live-Stichprobe ausgeführt werden. Gleichzeitig werden die öffentlichen Affiliate- und Rechtstexte von „inaktiv“ auf den tatsächlichen Status aktualisiert.
