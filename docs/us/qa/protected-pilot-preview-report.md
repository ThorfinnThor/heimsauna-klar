# Protected US pilot preview report

Date: 2026-09-14

## Decision

The technical pilot path passes as a protected offline preview. This is not a production approval. The checked-in US route, indexing, affiliate and feed switches remain off, and the preview runner deletes the generated US directory before exit.

## Real pilot data exercised

| Product | Static product route | Catalog | Finder payload | Configuration and sources |
|---|---|---|---|---|
| Peak Saunas Shasta | passed | passed | passed | passed |
| Peak Saunas Everest | passed | passed | passed | passed |
| JNH Lifestyles Tosi 1-Person | passed | passed | passed | passed |
| JNH Lifestyles Tosi 2-Person | passed | passed | passed | passed |
| JNH Lifestyles Tosi Red 4-Person | passed | passed | passed | passed |
| JNH Lifestyles Arki Outdoor Duo | passed | passed | passed | passed |

The six records and their six exact configurations are candidate research data. Product pages show their configuration labels and linked source titles. They show `No reviewed offer` and do not emit public Product schema while they remain candidates.

The tested real-data Finder scenarios remain those recorded in `docs/us/qa/pilot-content-review.md`. The two-seat indoor infrared 120 V scenario produces three known configuration matches. Adding a room envelope moves those records to `needs-verification` because installation clearances are not documented. A 240 V requirement excludes all six pilot configurations rather than treating unknown or unrelated electrical data as compatible.

## Static and discovery checks

- 16 US HTML pages generated with `lang="en-US"`
- 16/16 carried `noindex, follow` and a research-preview notice
- self-referential US canonicals and internal US links passed the SEO crawl
- zero US sitemap or `llms.txt` discovery URLs
- zero fixture markers in the generated HTML
- zero public Product schema blocks on candidate product pages
- zero affiliate labels, prices or outbound affiliate destinations
- `out/us` removed successfully before the preview command exited

## Explicitly not tested

The real US dataset contains zero offers. No approved US affiliate program, real US Awin feed response, production tracking URL, checkout handoff, conversion attribution, shipping quote or live merchant availability was tested. The affiliate decision path remains covered by isolated fixtures and must be repeated with a reviewed real offer before affiliate publication.

No public authentication layer was added because the preview is not hosted. It exists only during the local build-and-check process and is removed automatically. Publishing a preview URL would require a separate access-control decision.

## Commands

- `npm run us:preview:test`: passed
- `npm run us:test`: 97/97 passed
- `npm run lint`: passed
- `npm run build`: passed; 587 static routes generated before the US output gate
- DE regression: 568 public HTML pages and 14,923 internal references with zero broken targets
- DE SEO: 565 checked pages, including 306 indexable and 210 noindex product pages
- Content diversity, security headers and discovery checks: passed
