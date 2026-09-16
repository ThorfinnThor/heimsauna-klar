# Sol review — Sweat Kingdom US catalog expansion

**Review date:** 16 September 2026  
**Scope:** US catalog, Sweat Kingdom product pages, Awin deeplinks and publication controls

## Decision

The reviewed expansion is technically accepted for release. The US research catalog contains 115 products and 115 configurations. Twenty-three products are published, including thirteen Sweat Kingdom products with thirteen configuration-specific Awin links. Ninety-two records remain candidates and do not receive public product routes or affiliate output.

## Reviewed additions

- SK 110, 5 × 6 base footprint for 2-3 people
- SK 210, 6 × 8 base footprint for 4 people
- SK 310, 7 × 10 footprint for 4-5 people
- SK Mobile, 6.5 × 8 footprint for 4-5 people

Each addition has its own manufacturer source, evidence records, configuration, product-specific decision copy, rights placeholder, merchant mapping and Awin deeplink. Unstated electrical facts remain unknown rather than being inferred from another model or selectable package.

## Held candidates

- The Sweat Box remains a candidate because the official product page currently marks it sold out.
- The Sweat Cabin Deluxe remains a candidate because its product page and collection listing expose different prices. No offer is published until the merchant data is reconciled.

Neither candidate appears in the static product output, release manifest or sitemap.

## Tracking and output checks

- All thirteen Sweat Kingdom offers use advertiser `125462` and publisher `3037577`.
- Every `ued` parameter resolves to the exact recorded merchant destination.
- All click references are unique.
- Rendered links use `rel="sponsored nofollow noopener noreferrer"`, open in a new tab and carry a visible affiliate label.
- Every published Sweat Kingdom page has its own self-referential canonical and sitemap entry.

## Verification

- `npm run us:sol:gate` — passed with 115 products and 115 configurations against the 100-record threshold.
- `npm run us:ci` — passed; 32/32 test-matrix cases mapped and 129/129 US tests passed.
- `npm run data:check` — passed with 0 US data warnings.
- `npm run lint` — passed.
- `npm run build` — passed with 608 generated routes, 0 broken internal links and all SEO, diversity, security and discovery gates green.
- Static affiliate and candidate-boundary inspection — thirteen offers checked, two candidates held back, 0 failures.

## Release boundary

This review accepts the repository state. It does not record a GitHub push, Cloudflare deployment, live Awin redirect test or production-browser smoke test. Those checks belong to the release step for the exact accepted commit.
