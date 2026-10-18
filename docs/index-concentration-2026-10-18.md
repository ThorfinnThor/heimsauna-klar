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

## Known blocker (pre-existing, not caused by this change)

All 601 offers were last checked between 2026-08-27 and 2026-09-08. With the
30-day freshness rule every offer is stale since ~2026-10-08, so
`npm run data:check` fails on `main` today ("sauna-bis-2500-euro has no
matching verified products") and every new Cloudflare build fails. The live
site still serves the build of 2026-09-26. Refresh the offers (Awin sync plus
manual manufacturer checks) before this or any other change can deploy.

The US test "catalog filters keep documented matches deterministic"
(144 vs 141) also fails on `main` independently of this change.

Verification of this branch ran with the offer date pinned to 2026-09-26 (the
last successful build): data check, Next export, US SEO crawl, output gate,
links, static SEO, diversity, security and discovery checks pass.

## What brings the US forward

Pruning removes the thin mass; it does not create US demand. The US pages that
can rank are decision guides with original depth, analogous to the German
pages that do get impressions (2-person sauna, small garden sauna, space
requirements). Product pages should return to the index one by one, only once
they carry product-specific decision content.
