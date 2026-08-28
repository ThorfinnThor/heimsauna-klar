# Affiliate-Integration

Select Your Sauna übernimmt das Freigabemodell von PassendPlanen, bleibt aber vollständig statisch. Ein Händlerlink wird nur als Affiliate-Link ausgegeben, wenn alle drei Ebenen aktiv sind:

1. Das Partnerprogramm in `content/de/affiliate.json` hat den Status `approved` und enthält die erlaubten Tracking-Domains.
2. Der Händler in `data/merchants.json` hat den Affiliate-Status `active` und verweist auf genau dieses Programm.
3. Das konkrete Angebot in `data/products.json` besitzt `affiliate: true`, dieselbe `affiliate_program_id` und einen geprüften `affiliate_url`.

Solange eine Ebene fehlt, verwendet die Website weiterhin die normale URL aus `offer.url` und kennzeichnet den Link als „Kein Affiliate-Link“.

## Tracking-Referenzen

- Awin: `clickref=sauna`, `clickref2=product-detail` und eine gekürzte Produkt-ID in `clickref3`.
- ADCELL: `subId=product-detail|<produkt-id>`.
- Es werden keine E-Mail-Adressen, Nutzerkennungen, Suchbegriffe oder Finder-Eingaben übertragen.

## Benötigte Angaben nach einer Freigabe

Für jedes freigeschaltete Programm werden benötigt:

- Netzwerk und Advertiser- beziehungsweise Programm-ID
- Status der Bewerbung
- erlaubte Tracking-Domain
- der im Netzwerk erzeugte Deeplink für jedes konkrete Produkt
- die unveränderte Ziel-URL beim Händler zum Gegencheck

Trackinglinks dürfen direkt im Repository stehen, weil sie im ausgelieferten HTML ohnehin öffentlich sichtbar sind. API-Schlüssel, Feed-Listen-URLs und Zugangsdaten gehören dagegen ausschließlich in GitHub Secrets und werden nicht für die manuelle Erstintegration benötigt.

## Aktivierung

Nach dem Eintragen der freigegebenen Deeplinks müssen `npm run data:check`, `npm run build` und eine Live-Stichprobe ausgeführt werden. Gleichzeitig werden die öffentlichen Affiliate- und Rechtstexte von „inaktiv“ auf den tatsächlichen Status aktualisiert.
