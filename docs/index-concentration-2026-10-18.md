# Index concentration — 2026-10-18

## Decision

Owner decision (2026-10-18): recover Google visibility by indexing only pages
with substantial original content. The US market is a priority; it should enter
the index with strong pages rather than with a catalogue of thin ones.

Pages stay online, linked and reachable. Removed pages get `noindex,follow`
and leave the sitemap. Nothing is deleted or redirected.

## Evidence

Google Search Console (Domain property, read 2026-10-18):

- No manual action.
- Impressions started 2026-08-30, ~30–50/day, average position ~40.
- 2026-09-15 "Enable indexed US first-wave release", 2026-09-16 large US
  catalogue expansion. **2026-09-17: impressions fell to ~0** and stayed there.
- Index report: 84 indexed, 364 "Gefunden – zurzeit nicht indexiert". 307 of
  the 437 sitemap URLs were German product pages.
- Demand since launch sits on the guide and collection pages:
  `/de/indoor-sauna/2-personen-sauna/` (222 impressions),
  `/de/indoor-sauna/1-person-sauna/` (123), `/de/outdoor-sauna/kleine-gartensauna/` (86),
  `/de/planung/platzbedarf/` (71), `/de/produkte/` (62),
  `/de/indoor-sauna/mini-sauna/` (50), `/de/vergleiche/finnische-sauna/` (36, 2 clicks).
  All product detail pages together: under 40 impressions. US pages: none.

## Changes

| Area | Before | After |
| --- | ---: | ---: |
| DE product detail pages | 306 indexable | 1 (`artsauna-kiruna-120`, the only one with a click) |
| US product detail pages | 72 indexable | 0 |
| US overviews `/us/guides/`, `/us/compare/`, `/us/brands/` (~75 words, one entry each) | indexable | noindex |
| **Sitemap** | **437 URLs** | **58 URLs** |

Kept: DE home, 37 collection pages, 12 planning guides, comparisons, legal and
trust pages; US home, `/us/saunas/`, the published US guide, comparison and
brand page, methodology and trust pages.

Mechanics:

- DE: `index_concentration` in `data/product-indexing-policy.json`, applied by
  `scripts/product-indexing-policy.mjs` (can only remove pages from the index).
- US: `index_concentration` in `data/us/publication.json`, applied by
  `isUsPathConcentratedOut` in `lib/us/seo.ts`; the launch snapshot check and
  the preview manifest follow it.

Rollback: set both `status` fields to `paused`, run `npm run indexing:generate`.

## Offer freshness (resolved the same day)

All 601 offers had been older than the 30-day freshness rule, so `data:check`
failed on `main` and no build could deploy. Fixed before this change shipped:
#7 re-read the 391 manufacturer offers and #8 synced the Awin links and re-read
the 210 affiliate offers at their shop pages
(`scripts/refresh-manufacturer-offers.mjs`, reports in `data/`). Offers whose
price could not be read stay on their old date and count as stale.

Re-run that script at least every four weeks, or the build fails again.

## What brings the US forward

Pruning removes the thin mass; it does not create US demand. The US pages that
can rank are decision guides with original depth, analogous to the German
pages that do get impressions (2-person sauna, small garden sauna, space
requirements). Product pages should return to the index one by one, only once
they carry product-specific decision content.
