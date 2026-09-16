# US Sweat Kingdom expansion review

**Review date:** 16 September 2026  
**Scope:** official Sweat Kingdom product pages, US catalogue records and Awin deeplinks

## Result

The US catalogue now contains 248 products and 248 one-to-one configurations. Twenty-eight products are published and 220 remain candidates for later technical review. Sweat Kingdom contributes seventeen eligible Awin offers after a manual check of the exact merchant destination URLs.

The expansion adds four previously missing model pages:

- [SK Contrast](https://sweatkingdom.com/products/sk-contrast), a configurable outdoor sauna and cold-plunge suite with three footprint choices.
- [REGEN The Sweat Cabin (4 Person)](https://sweatkingdom.com/products/regen-the-sweat-cabin-4-person).
- [REGEN The Sweat Cabin Deluxe (6 Person)](https://sweatkingdom.com/products/the-sweat-cabin-deluxe-6-person-copy).
- [REGEN The Sweat Pod (2-4 Person)](https://sweatkingdom.com/products/regen-the-sweat-pod-2-4-person).

Each new published record has an exact manufacturer source, a source-bound editorial entry, one configuration record, an approved manual mapping and an Awin redirect using advertiser `125462` and publisher `3037577`. Manufacturer imagery remains excluded because image rights have not been requested.

## Technical limits

The model pages do not expose every field needed for a fully complete electrical or installation record. Voltage, phase, shipping dimensions, weights and minimum clearances remain explicitly unknown where the source does not state them. SK Contrast also has multiple footprints and no stated seated capacity, so the catalogue preserves those choices instead of inventing a single dimension or capacity.

The Sweat Box is now public as a researched catalogue record even though the merchant page was sold out at review time. It has no price or affiliate offer until availability returns. The older Sweat Cabin Deluxe record remains a candidate because its displayed price conflicted with the current collection price.

## Catalog parity check

The official [Saunas collection](https://sweatkingdom.com/collections/saunas), [Sauna Units collection](https://sweatkingdom.com/collections/sauna-units) and [all-products catalogue](https://sweatkingdom.com/collections/all) were compared with the local model list. There are currently **zero additional sauna models** in those public collections that are missing from the US catalogue. The remaining Awin feed-only entries, if any, are not counted as sauna models until the feed is explicitly synchronized and manually classified. Heaters, accessories, installation and service items are intentionally not imported as sauna models.

## Verification

- `npm run us:data:check` passed with 248 products, 248 configurations, 17 offers and 0 warnings.
- `npm run us:test` passed all 129 US tests.
- The launch snapshot contains 28 published products, 220 candidates, 42 declared routes and 248 explicit rights records.
- Coverage counts are 69 indoor traditional cabins, 91 outdoor traditional cabins and 113 sauna kits. Categories overlap by design.
