# US content, data and rights review

**Review date:** 14 September 2026  
**Ticket:** L-11  
**Status:** Accepted with conditions  
**Scope:** Protected US research preview only. This is not a production or affiliate approval.

## Reviewed scope

The review covers the ten candidate products and their ten model-specific configurations in the current launch snapshot. The records contain 20 source documents and 20 field-level evidence records. There are no US offers, no active affiliate links and no public US publication status. The four US publication switches remain `false`.

| Group | Records reviewed | Documented identity and placement | Review result |
| --- | ---: | --- | --- |
| Peak Saunas | 6 | Shasta, Everest, Mini, Crown and Fuji indoor infrared cabins; Patagonia outdoor infrared cabin | Each model has its own product ID, configuration ID and official product source. No values are carried between models. |
| JNH Lifestyles | 4 | Tosi 1-Person, Tosi 2-Person and Tosi Red 4-Person indoor infrared cabins; Arki Outdoor Duo outdoor infrared cabin | Each model has a separate source and configuration. Arki is not treated as an outdoor Tosi variant. |

The product and configuration records are still `candidate`. This is intentional. A documented specification is not the same as a reviewed installation approval, a current offer or a publisher-approved affiliate destination.

## Facts and claims

- Product type, heat type, placement, seating, exterior dimensions, material and electrical values are only displayed where the record has a matching evidence ID.
- Unknown fields remain unknown. Shipping dimensions, minimum clearances, some circuit details, SKU fields and other absent manufacturer facts are not filled with estimates.
- The copy describes source-based research. It does not claim hands-on testing, rankings, health outcomes, certification, installation approval or a completed purchase experience.
- The comparison copy is limited to the eight documented indoor infrared configurations. The two outdoor records are not silently included in that indoor comparison.
- The electrical guide keeps voltage, circuit capacity, connection method and plug information attached to the same configuration. It explicitly warns that a voltage match does not approve an outlet or circuit.
- No unresolved product conflict was found in the current snapshot. Every product resolves to exactly one configuration and at least one authoritative manufacturer source; each evidence record points to a known source and entity.

## Rights and commercial boundaries

The rights register contains ten explicit manufacturer-image records. All ten are `not-requested`, with no permission basis. No manufacturer image is used in the preview. `data/us/offers.json` contains zero offers, so the preview exposes no price, availability, affiliate CTA or tracking link. This keeps the research pages separate from an unverified commercial claim.

The remaining conditions are external rather than hidden in the copy:

1. Obtain documented image/feed permission or keep the product pages image-free.
2. Obtain and record publisher/program approval before adding an offer or affiliate URL.
3. Verify installation clearances and any unresolved electrical fields from the exact model documentation before treating a finder result as a confirmed fit.
4. Complete the legal/operator decision before changing the draft trust pages to production status.

## Checks performed

The following checks passed against the checked-in data and the generated protected preview:

- `npm run us:data:check`
- `npm run us:snapshot:check`
- `npm run us:test` — 106 tests passed
- `npm run us:preview:test` — 23 pages, 10 candidates, 10 configurations, 0 offers, 0 fixture leaks
- `npm run us:seo:check` — 23 pages, 0 discoverable routes
- `npm run us:output:gate` — US output removed after the protected run

**Conclusion:** L-11 is accepted with conditions. The data and claims are internally consistent for a protected research preview. No product is promoted to a public, priced or affiliate-backed listing by this review. L-05 remains blocked and no US publication switch may be enabled from this result.
