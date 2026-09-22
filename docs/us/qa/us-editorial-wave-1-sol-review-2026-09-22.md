# US editorial wave one — Sol acceptance review

**Review date:** 2026-09-22
**Decision:** Accepted and released
**Scope:** 27 source-complete US product pages from Peak Saunas, Almost Heaven, Sun Home and Redwood Outdoors

## Release result

- 27 reviewed candidate products and their configurations moved to `published`.
- The public US catalog now contains 55 product pages.
- 235 research candidates remain non-public.
- The commercial scope remains 17 exact Sweat Kingdom offers. No affiliate destination was invented for the newly published records.
- Product pages remain image-free where no approved image-rights record exists.

## Data and editorial checks

Each released record has an exact product identity, a current manufacturer source, documented placement and heat type, capacity, exterior dimensions, materials and a complete electrical record. Unknown clearances, shipping dimensions, certifications, warranties or included components stay visibly unknown rather than being inferred.

The 27 pages use source-bound summaries, product-specific decision points and limitations. The automated review rejects prohibited stock phrases, duplicated headings and duplicated summaries. Each editorial record points to the exact product source ID used by the configuration.

## Automated acceptance

- `npm run us:test`: 133 tests passed.
- `npm run us:data:check`: 290 products, 290 configurations, 17 offers and no warnings.
- `npm run lint -- --quiet`: passed.
- `npm run build`: passed with 650 static pages.
- US SEO crawl: 69 generated US pages checked, 67 discoverable.
- Internal link check: 647 HTML pages, 16,186 references and no broken targets.
- Static SEO, content diversity, security headers and discovery files passed.

## Visual and responsive review

The production export was served locally and inspected at 1280 × 720 and 390 × 844. The review included:

- Peak Saunas Rainier as a compact one-person infrared page.
- Almost Heaven Grandview as a long product title.
- Sun Home Eclipse 2.
- Redwood Outdoors Barrel Outdoor Sauna with Porch 6 Person.
- Almost Heaven Hillsboro 2 Person Indoor Sauna.
- Navigation from a product page to the US home page.

All checked pages rendered meaningful content with one H1, no framework error overlay, no console warnings or errors and no horizontal overflow. The long product names wrap cleanly on mobile, the offer-status panel stacks below the introduction, and the US home navigation remains usable at 390 pixels.

The local Next.js development watcher reached the host's open-file limit during this check. Browser QA therefore used the successful production static export, which is the artifact deployed by the project. This environment-only watcher limitation does not affect the built output.

## Remaining work

The next publication cohort consists of 25 source-review records. They should not be made public in bulk. Each needs an exact current model source and evidence mapping before Luna prepares page-specific editorial copy and Sol repeats this acceptance gate.
